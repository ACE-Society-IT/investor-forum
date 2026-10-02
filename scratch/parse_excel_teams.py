import zipfile
import xml.etree.ElementTree as ET
import json

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
            t_num = str(row.get("A")).strip()
            email = str(row.get("B")).strip() if row.get("B") else ""
            pwd = str(row.get("C")).strip() if row.get("C") else ""
            leader = str(row.get("D")).strip() if row.get("D") else ""
            total_m = row.get("E")
            creds_by_team_num[t_num] = {
                "team_num": t_num,
                "email": email,
                "password": pwd,
                "leader": leader,
                "total_members": total_m
            }

    # Sheet 2: Team #, Team Name, Member Role, Student / Member Name, Team Contact Email
    teams_dict = {}
    for r_num, row in s2_rows:
        if r_num >= 4 and row.get("A"):
            t_num = str(row.get("A")).strip()
            t_name = str(row.get("B")).strip() if row.get("B") else ""
            m_role = str(row.get("C")).strip() if row.get("C") else "Trader"
            m_name = str(row.get("D")).strip() if row.get("D") else ""
            m_email = str(row.get("E")).strip() if row.get("E") else ""

            if t_num not in teams_dict:
                teams_dict[t_num] = {
                    "team_num": t_num,
                    "team_name": t_name,
                    "members": []
                }
            if t_name and not teams_dict[t_num]["team_name"]:
                teams_dict[t_num]["team_name"] = t_name

            if m_name:
                teams_dict[t_num]["members"].append({
                    "name": m_name,
                    "role": m_role,
                    "email": m_email
                })

    print(f"Loaded {len(creds_by_team_num)} credential rows and {len(teams_dict)} team roster entries.")
    
    # Merge
    all_teams = []
    # Sorted by team number
    team_keys = sorted(list(set(list(creds_by_team_num.keys()) + list(teams_dict.keys()))), key=lambda x: int(''.join([c for c in x if c.isdigit()]) or 0))
    for tk in team_keys:
        cred = creds_by_team_num.get(tk, {})
        roster = teams_dict.get(tk, {})
        team_name = roster.get("team_name") or f"Team {tk}"
        email = cred.get("email") or f"{tk.lower().replace(' ', '')}@alpha.com"
        username = email.split("@")[0].lower() # e.g. team1, team2, etc.
        pwd = cred.get("password") or "Alpha#2026"
        members = roster.get("members", [])
        
        all_teams.append({
            "team_num": tk,
            "team_name": team_name,
            "username": username,
            "email": email,
            "password": pwd,
            "members": members
        })

    print(json.dumps(all_teams, indent=2))
