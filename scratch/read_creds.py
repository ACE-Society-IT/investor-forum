import zipfile
import xml.etree.ElementTree as ET
import os

xlsx_path = r"c:\Users\kingm\OneDrive\Desktop\updated creds.xlsx"

with zipfile.ZipFile(xlsx_path) as z:
    print("Files in zip:", [n for n in z.namelist() if n.startswith("xl/")])
    
    shared_strings = []
    if "xl/sharedStrings.xml" in z.namelist():
        tree = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for elem in tree.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si"):
            texts = [node.text for node in elem.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t") if node.text]
            shared_strings.append("".join(texts))
            
    # List sheets from workbook.xml
    wb_tree = ET.fromstring(z.read("xl/workbook.xml"))
    sheets = wb_tree.findall(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}sheet")
    for s in sheets:
        sheet_name = s.attrib.get("name")
        sheet_id = s.attrib.get("sheetId")
        r_id = s.attrib.get("{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id")
        print(f"\n================ SHEET: {sheet_name} (id: {sheet_id}, rId: {r_id}) ================")
        
        # Read worksheet
        sheet_filename = f"xl/worksheets/sheet{sheet_id}.xml"
        if sheet_filename not in z.namelist():
            sheet_filename = "xl/worksheets/sheet1.xml"
        
        ws_tree = ET.fromstring(z.read(sheet_filename))
        rows = ws_tree.findall(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row")
        for row in rows:
            r_num = row.attrib.get("r")
            cells = row.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c")
            row_items = []
            for cell in cells:
                ref = cell.attrib.get("r")
                t_attr = cell.attrib.get("t")
                v_elem = cell.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
                val = v_elem.text if v_elem is not None else None
                if t_attr == "s" and val is not None:
                    try:
                        val = shared_strings[int(val)]
                    except Exception:
                        pass
                row_items.append((ref, val))
            print(f"Row {r_num}: {row_items}")
