import os
import zipfile
import xml.etree.ElementTree as ET
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# 1. Parse Excel data
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
        username = email.split("@")[0].lower()
        pwd = cred.get("password") or "Alpha#2026"
        leader = cred.get("leader") or (roster.get("members")[0]["name"] if roster.get("members") else "Pending")
        members = roster.get("members", [])
        clean_pwd = ''.join([c for c in pwd if c.isalnum()]).upper()
        secret_key = f"KEY-{num_int:02d}-{clean_pwd[:6]}"
        
        teams_data.append({
            "num_int": num_int,
            "team_num_display": f"Team {num_int:02d}",
            "team_name": team_name,
            "username": username,
            "email": email,
            "password": pwd,
            "secret_key": secret_key,
            "leader": leader,
            "members": members
        })

# 2. Numbered Canvas for Professional Footer & Page Numbers
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#71717a"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(36, 760, "INVESTOR FORUM 2026 — OFFICIAL TEAM CREDENTIALS & ACCESS DIRECTORY")
            self.drawRightString(576, 760, "CONFIDENTIAL")
            self.setStrokeColor(colors.HexColor("#e4e4e7"))
            self.setLineWidth(0.5)
            self.line(36, 754, 576, 754)

        # Footer
        self.setStrokeColor(colors.HexColor("#e4e4e7"))
        self.setLineWidth(0.5)
        self.line(36, 36, 576, 36)
        
        self.drawString(36, 24, "ACE Society IT · Confidential Competition Document · Generated Oct 2026")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 24, page_str)
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=44,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography & Styles
    c_maroon = colors.HexColor("#402b28")
    c_cream = colors.HexColor("#f8f4ed")
    c_dark = colors.HexColor("#1b0805")
    c_gold = colors.HexColor("#d97706")
    c_emerald = colors.HexColor("#059669")
    c_slate = colors.HexColor("#475569")
    c_muted = colors.HexColor("#64748b")
    c_border = colors.HexColor("#cbd5e1")
    c_bg_subtle = colors.HexColor("#f8fafc")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=c_dark,
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        "DocSubTitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=c_slate
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=c_maroon,
        spaceBefore=10,
        spaceAfter=4
    )

    badge_style = ParagraphStyle(
        "Badge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=c_maroon
    )

    cell_bold = ParagraphStyle(
        "CellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=c_dark
    )

    cell_mono = ParagraphStyle(
        "CellMono",
        parent=styles["Normal"],
        fontName="Courier-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0f172a")
    )

    cell_key = ParagraphStyle(
        "CellKey",
        parent=styles["Normal"],
        fontName="Courier-Bold",
        fontSize=8,
        leading=10,
        textColor=c_emerald
    )

    cell_text = ParagraphStyle(
        "CellText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=c_slate
    )

    th_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=0
    )

    story = []

    # Title & Header
    story.append(Paragraph("INVESTOR FORUM 2026", badge_style))
    story.append(Paragraph("Official Team Credentials & Access Directory", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>Confidential Competition Reference:</b> Assigned Login IDs, Passwords, One-Time Secret Keys, and Registered Member Rosters for all 25 Trading Teams.",
        subtitle_style
    ))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_maroon, spaceBefore=0, spaceAfter=8))

    # Admin Quick Reference Box
    admin_data = [
        [
            Paragraph("<b>DIRECTOR & ADMIN ACCESS</b>", ParagraphStyle("AdmT", fontName="Helvetica-Bold", fontSize=9, textColor=c_maroon)),
            Paragraph("<b>PORTAL URL:</b> <code>/admin</code>", cell_text),
            Paragraph("<b>USER:</b> <code>admin</code>", cell_text),
            Paragraph("<b>PASS:</b> <code>admin2026</code>", cell_text),
            Paragraph("<b>MASTER KEY:</b> <code>IF-ADMIN-KEY-2026</code>", cell_text),
        ]
    ]
    t_admin = Table(admin_data, colWidths=[140, 100, 80, 90, 130])
    t_admin.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef3c7")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#f59e0b")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_admin)
    story.append(Spacer(1, 10))

    # SECTION 1: MASTER CREDENTIALS TABLE
    story.append(Paragraph("1. Master Credentials Matrix (25 Trading Desks)", h2_style))
    
    table_data = [
        [
            Paragraph("Team #", th_style),
            Paragraph("Team Name", th_style),
            Paragraph("Username (Login)", th_style),
            Paragraph("Secure Password", th_style),
            Paragraph("Secret Access Key", th_style),
            Paragraph("Designated Team Leader", th_style),
            Paragraph("Members", th_style)
        ]
    ]

    for t in teams_data:
        m_count = len(t["members"])
        count_str = f"{m_count} Active" if m_count > 0 else "Reserve"
        table_data.append([
            Paragraph(t["team_num_display"], cell_bold),
            Paragraph(t["team_name"], cell_bold),
            Paragraph(t["username"], cell_mono),
            Paragraph(t["password"], cell_mono),
            Paragraph(t["secret_key"], cell_key),
            Paragraph(t["leader"], cell_text),
            Paragraph(count_str, cell_text)
        ])

    # Col widths sum = 540 pt (7.5 inches)
    col_widths = [45, 85, 65, 75, 85, 135, 50]
    t_teams = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    t_style = [
        ('BACKGROUND', (0, 0), (-1, 0), c_maroon),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, c_border),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]
    # Alternating row background
    for r in range(1, len(table_data)):
        if r % 2 == 0:
            t_style.append(('BACKGROUND', (0, r), (-1, r), c_bg_subtle))
            
    t_teams.setStyle(TableStyle(t_style))
    story.append(t_teams)
    story.append(Spacer(1, 14))

    # SECTION 2: MEMBER ROSTERS (TEAM BY TEAM)
    story.append(PageBreak())
    story.append(Paragraph("2. Full Member Rosters by Team", h2_style))
    story.append(Paragraph("Detailed participant roster containing designated team leaders, student names, IDs, and official assigned roles.", subtitle_style))
    story.append(Spacer(1, 8))

    # Grid of team cards / small tables (2 teams per row or stacked)
    for i, t in enumerate(teams_data):
        if len(t["members"]) == 0:
            continue
            
        roster_rows = [
            [
                Paragraph(f"<b>{t['team_num_display']} · {t['team_name']}</b> (Login: <code>{t['username']}</code> | Key: <code>{t['secret_key']}</code>)", ParagraphStyle("RostH", fontName="Helvetica-Bold", fontSize=8.5, textColor=colors.white)),
                Paragraph(f"Pass: <b>{t['password']}</b>", ParagraphStyle("RostHP", fontName="Courier-Bold", fontSize=8.5, textColor=colors.HexColor("#fef08a"), alignment=2))
            ]
        ]
        
        # Subtable of members
        member_table_data = [
            [
                Paragraph("Role", ParagraphStyle("MTH", fontName="Helvetica-Bold", fontSize=7.5, textColor=c_maroon)),
                Paragraph("Student / Member Name", ParagraphStyle("MTH", fontName="Helvetica-Bold", fontSize=7.5, textColor=c_maroon)),
                Paragraph("Email Contact", ParagraphStyle("MTH", fontName="Helvetica-Bold", fontSize=7.5, textColor=c_maroon))
            ]
        ]
        
        for m in t["members"]:
            is_lead = m["role"] == "Team Leader"
            role_text = f"<b>👑 {m['role']}</b>" if is_lead else m["role"]
            name_text = f"<b>{m['name']}</b>" if is_lead else m["name"]
            member_table_data.append([
                Paragraph(role_text, cell_text),
                Paragraph(name_text, cell_text),
                Paragraph(m["email"] or t["email"], cell_text)
            ])
            
        t_members_sub = Table(member_table_data, colWidths=[90, 260, 180])
        t_members_sub.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 2.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
            ('LEFTPADDING', (0, 0), (-1, -1), 4),
            ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ]))

        # Outer card container
        card_data = [
            [
                Table(roster_rows, colWidths=[360, 170], style=[
                    ('BACKGROUND', (0, 0), (-1, -1), c_maroon),
                    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('LEFTPADDING', (0, 0), (-1, -1), 6),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ])
            ],
            [t_members_sub]
        ]
        
        card_table = Table(card_data, colWidths=[536])
        card_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 1, c_border),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ]))
        
        story.append(KeepTogether([card_table, Spacer(1, 8)]))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully compiled PDF to: {filename}")


# Build to Desktop and project root
desktop_pdf = r"c:\Users\kingm\OneDrive\Desktop\Investor_Forum_Official_Team_Credentials.pdf"
local_pdf = r"c:\Users\kingm\Downloads\Projects\Investor Forum\Investor_Forum_Official_Team_Credentials.pdf"

build_pdf(desktop_pdf)
build_pdf(local_pdf)
