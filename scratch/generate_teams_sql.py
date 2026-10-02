import zipfile
import xml.etree.ElementTree as ET
import os

xlsx_path = r"c:\Users\kingm\OneDrive\Desktop\updated creds.xlsx"

with zipfile.ZipFile(xlsx_path) as z:
    shared_strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for elem in tree.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si"):
            texts = [node.text for node in elem.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t") if node.text]
            shared_strings.append("".join(texts))

    def get_sheet_data(sheet_filename):
        ws_tree = ET.fromstring(z.read(sheet_filename))
        rows = ws_tree.findall(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row")
        all_rows = []
        for row in rows:
            r_num = int(row.attrib.get("r"))
            cells = row.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c")
            row_dict = {}
            for cell in cells:
                ref = cell.attrib.get("r")
                col_letter = "".join([c for c in ref if c.isalpha()])
                t_attr = cell.attrib.get("t")
                v_elem = cell.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
                val = v_elem.text if v_elem is not None else None
                if t_attr == "s" and val is not None:
                    try:
                        val = shared_strings[int(val)]
                    except Exception:
                        pass
                row_dict[col_letter] = val
            all_rows.append((r_num, row_dict))
        return all_rows

    s1_rows = get_sheet_data("xl/worksheets/sheet1.xml")
    s2_rows = get_sheet_data("xl/worksheets/sheet2.xml")

    # Sheet 1: Team #, Assigned Email, Secure Password, Team Leader, Total Members
    creds_by_team_num = {}
    for r_num, row in s1_rows:
        if r_num >= 5 and row.get("A"):
            t_num_raw = str(row.get("A")).strip()
            digits = ''.join([c for c in t_num_raw if c.isdigit()])
            if not digits:
                continue
            num_int = int(digits)
            if num_int <= 0:
                continue
            key = f"Team {num_int}"
            
            email = str(row.get("B")).strip() if row.get("B") else ""
            pwd = str(row.get("C")).strip() if row.get("C") else ""
            leader = str(row.get("D")).strip() if row.get("D") else ""
            total_m = row.get("E")
            creds_by_team_num[key] = {
                "num_int": num_int,
                "team_num_display": f"Team {num_int:02d}",
                "email": email,
                "password": pwd,
                "leader": leader,
                "total_members": total_m
            }

    # Sheet 2: Team #, Team Name, Member Role, Student / Member Name, Team Contact Email
    roster_by_team = {}
    for r_num, row in s2_rows:
        if r_num >= 4 and row.get("A"):
            t_num_raw = str(row.get("A")).strip()
            digits = ''.join([c for c in t_num_raw if c.isdigit()])
            if not digits:
                continue
            num_int = int(digits)
            if num_int <= 0:
                continue
            key = f"Team {num_int}"
            
            t_name = str(row.get("B")).strip() if row.get("B") else ""
            m_role = str(row.get("C")).strip() if row.get("C") else "Trader"
            m_name = str(row.get("D")).strip() if row.get("D") else ""
            m_email = str(row.get("E")).strip() if row.get("E") else ""

            if key not in roster_by_team:
                roster_by_team[key] = {
                    "num_int": num_int,
                    "team_name": t_name,
                    "members": []
                }
            if t_name and not roster_by_team[key]["team_name"]:
                roster_by_team[key]["team_name"] = t_name

            if m_name and m_name.lower() != "pending registration":
                roster_by_team[key]["members"].append({
                    "name": m_name,
                    "role": m_role,
                    "email": m_email
                })

    all_keys = sorted(list(set(list(creds_by_team_num.keys()) + list(roster_by_team.keys()))), key=lambda x: int(''.join([c for c in x if c.isdigit()]) or 0))

    teams_data = []
    for k in all_keys:
        num_int = int(''.join([c for c in k if c.isdigit()]))
        cred = creds_by_team_num.get(k, {})
        roster = roster_by_team.get(k, {})
        team_name = roster.get("team_name") or f"Alpha Team {num_int:02d}"
        email = cred.get("email") or f"team{num_int}@alpha.com"
        username = email.split("@")[0].lower() # e.g. team1, team2, etc.
        pwd = cred.get("password") or "Alpha#2026"
        members = roster.get("members", [])
        
        # Format secret key
        # Extract clean letters/digits from password for unique secret key
        clean_pwd = ''.join([c for c in pwd if c.isalnum()]).upper()
        secret_key = f"KEY-{num_int:02d}-{clean_pwd[:6]}"
        leader_name = cred.get("leader") or (members[0]["name"] if members else "To Be Assigned")
        
        teams_data.append({
            "num_int": num_int,
            "team_name": team_name,
            "username": username,
            "email": email,
            "password": pwd,
            "leader_name": leader_name,
            "secret_key": secret_key,
            "members": members
        })

    print(f"Parsed {len(teams_data)} teams:")
    for t in teams_data:
        print(f"[{t['num_int']:02d}] {t['team_name']} | Lead: {t['leader_name']} | User: {t['username']} | Pass: {t['password']} | Key: {t['secret_key']} | Members: {len(t['members'])}")

    # Generate SQL
    sql_lines = []
    sql_lines.append("-- =====================================================================")
    sql_lines.append("-- 🏆 INVESTOR FORUM: OFFICIAL COMPETITION TEAMS & MEMBERS SEED SCRIPT")
    sql_lines.append("-- =====================================================================")
    sql_lines.append("-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql")
    sql_lines.append("-- Generated from official: updated creds.xlsx")
    sql_lines.append("-- =====================================================================\n")

    sql_lines.append("-- 1. Ensure required columns exist on public.teams")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS participant_type text NOT NULL DEFAULT 'team';")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS leader_name text DEFAULT NULL;")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS trader_title text DEFAULT NULL;")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS secret_key text DEFAULT NULL;")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS secret_key_used boolean NOT NULL DEFAULT false;")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS secret_key_used_at timestamp with time zone DEFAULT NULL;")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS locked_ip text DEFAULT NULL;")
    sql_lines.append("ALTER TABLE IF EXISTS public.teams ADD COLUMN IF NOT EXISTS locked_device_info text DEFAULT NULL;\n")

    sql_lines.append("-- 2. Ensure team_members table exists")
    sql_lines.append("CREATE TABLE IF NOT EXISTS public.team_members (")
    sql_lines.append("  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),")
    sql_lines.append("  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,")
    sql_lines.append("  name text NOT NULL,")
    sql_lines.append("  role text NOT NULL DEFAULT 'Trader',")
    sql_lines.append("  email text DEFAULT NULL,")
    sql_lines.append("  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL")
    sql_lines.append(");")
    sql_lines.append("CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id, created_at asc);\n")

    sql_lines.append("-- 3. Clean previous non-admin participant data (Leaves Admin Command and stocks intact)")
    sql_lines.append("DELETE FROM public.portfolio WHERE team_id IN (SELECT id FROM public.teams WHERE is_admin = false);")
    sql_lines.append("DELETE FROM public.transactions WHERE team_id IN (SELECT id FROM public.teams WHERE is_admin = false);")
    sql_lines.append("DELETE FROM public.team_sessions WHERE team_id IN (SELECT id FROM public.teams WHERE is_admin = false);")
    sql_lines.append("DELETE FROM public.team_members;")
    sql_lines.append("DELETE FROM public.teams WHERE is_admin = false;\n")

    sql_lines.append("-- 4. Ensure Admin Director Account exists")
    sql_lines.append("INSERT INTO public.teams (name, username, password, cash_balance, is_admin, is_banned, participant_type, leader_name)")
    sql_lines.append("VALUES ('Admin Command', 'admin', 'admin2026', 0, true, false, 'team', 'Competition Director')")
    sql_lines.append("ON CONFLICT (username) DO UPDATE SET password = 'admin2026', is_admin = true, is_banned = false, leader_name = 'Competition Director';\n")

    sql_lines.append("-- 5. Insert Official 25 Competition Trading Teams")
    sql_lines.append("INSERT INTO public.teams (name, username, password, cash_balance, is_admin, is_banned, participant_type, leader_name, secret_key, secret_key_used)")
    sql_lines.append("VALUES")
    
    team_values = []
    for t in teams_data:
        esc_name = t['team_name'].replace("'", "''")
        esc_user = t['username'].replace("'", "''")
        esc_pass = t['password'].replace("'", "''")
        esc_lead = t['leader_name'].replace("'", "''")
        esc_key = t['secret_key'].replace("'", "''")
        team_values.append(f"  ('{esc_name}', '{esc_user}', '{esc_pass}', 100000, false, false, 'team', '{esc_lead}', '{esc_key}', false)")
    
    sql_lines.append(",\n".join(team_values) + ";\n")

    sql_lines.append("-- 6. Insert Official Team Members & Assigned Roles")
    sql_lines.append("INSERT INTO public.team_members (team_id, name, role, email)")
    sql_lines.append("VALUES")

    member_values = []
    for t in teams_data:
        esc_user = t['username'].replace("'", "''")
        for m in t['members']:
            esc_m_name = m['name'].replace("'", "''")
            esc_m_role = m['role'].replace("'", "''")
            esc_m_email = m['email'].replace("'", "''") if m['email'] else f"{t['username']}@alpha.com"
            member_values.append(f"  ((SELECT id FROM public.teams WHERE username = '{esc_user}'), '{esc_m_name}', '{esc_m_role}', '{esc_m_email}')")

    sql_lines.append(",\n".join(member_values) + ";\n")

    sql_lines.append("-- 7. Reload Schema Cache & Notify Realtime")
    sql_lines.append("NOTIFY pgrst, 'reload config';")
    sql_lines.append("NOTIFY pgrst, 'reload schema';")

    sql_content = "\n".join(sql_lines)
    
    with open(r"c:\Users\kingm\Downloads\Projects\Investor Forum\supabase\migrations\202610020003_seed_official_competition_teams.sql", "w", encoding="utf-8") as f:
        f.write(sql_content)

    print("\nSuccessfully generated supabase/migrations/202610020003_seed_official_competition_teams.sql!")

