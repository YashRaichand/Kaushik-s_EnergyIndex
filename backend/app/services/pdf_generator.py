"""
EDI PDF Report Generator using ReportLab
Built by Kaushik Digital — Measuring Human Progress Through Energy Access
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
from typing import Optional


# ─── Brand Colors ──────────────────────────────────────────────────────────
BRAND_DARK   = colors.HexColor("#050816")
BRAND_PRIMARY = colors.HexColor("#00D4FF")
BRAND_ACCENT  = colors.HexColor("#7B61FF")
BRAND_SUCCESS = colors.HexColor("#00FF88")
BRAND_WARNING = colors.HexColor("#FFB547")
BRAND_DANGER  = colors.HexColor("#FF4757")
BRAND_MUTED   = colors.HexColor("#8892B0")
BRAND_CARD    = colors.HexColor("#0D1117")
WHITE         = colors.white
BLACK         = colors.black


async def generate_edi_report(prediction, user) -> bytes:
    """Generate a branded PDF report for an EDI prediction."""
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm,
        title="Energy Dignity Index Report",
        author="Kaushik Digital",
        subject="EDI Platform Analysis",
    )

    styles = getSampleStyleSheet()
    elements = []

    # ─ Custom Styles ──────────────────────────────────────────────
    h1 = ParagraphStyle("H1", parent=styles["Heading1"], fontSize=22, textColor=BRAND_PRIMARY,
                        spaceAfter=6, fontName="Helvetica-Bold")
    h2 = ParagraphStyle("H2", parent=styles["Heading2"], fontSize=14, textColor=BRAND_ACCENT,
                        spaceAfter=4, spaceBefore=12, fontName="Helvetica-Bold")
    body = ParagraphStyle("Body", parent=styles["Normal"], fontSize=10, textColor=BLACK,
                          leading=16, spaceAfter=6)
    label = ParagraphStyle("Label", fontSize=8, textColor=BRAND_MUTED, fontName="Helvetica",
                           spaceAfter=2, spaceBefore=6)
    meta = ParagraphStyle("Meta", fontSize=9, textColor=BRAND_MUTED, fontName="Helvetica",
                          spaceAfter=4)
    center = ParagraphStyle("Center", parent=body, alignment=TA_CENTER)
    highlight = ParagraphStyle("Highlight", fontSize=11, textColor=BRAND_SUCCESS,
                               fontName="Helvetica-BoldOblique", spaceAfter=6, leading=18)

    input_data = prediction.input_data or {}
    village_name = input_data.get("village_name", "Unknown Village")
    state = input_data.get("state", "India")
    policy = prediction.policy_recommendations or {}

    # ── HEADER ──────────────────────────────────────────────────────────────
    header_data = [[
        Paragraph("⚡ ENERGY DIGNITY INDEX", ParagraphStyle("HL", fontSize=18, textColor=WHITE,
                  fontName="Helvetica-Bold", alignment=TA_LEFT)),
        Paragraph("Built by<br/><b>Kaushik Digital</b>", ParagraphStyle("HR", fontSize=9,
                  textColor=BRAND_PRIMARY, alignment=TA_RIGHT, leading=14)),
    ]]
    header_tbl = Table(header_data, colWidths=["70%", "30%"])
    header_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BRAND_DARK),
        ("PADDING",    (0,0), (-1,-1), 14),
        ("ROUNDEDCORNERS", (0,0), (-1,-1), 8),
    ]))
    elements.append(header_tbl)
    elements.append(Spacer(1, 0.3*cm))
    elements.append(Paragraph("Measuring Human Progress Through Energy Access", meta))
    elements.append(HRFlowable(color=BRAND_PRIMARY, thickness=2, width="100%"))
    elements.append(Spacer(1, 0.4*cm))

    # ── REPORT META ─────────────────────────────────────────────────────────
    elements.append(Paragraph(f"ENERGY DIGNITY ANALYSIS REPORT", h1))
    elements.append(Paragraph(f"{village_name}, {state}", ParagraphStyle("sub", fontSize=14,
                    textColor=BRAND_ACCENT, fontName="Helvetica-Bold")))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(
        f"Generated: {datetime.now().strftime('%B %d, %Y %H:%M IST')}  |  "
        f"Analyst: {getattr(user, 'name', 'EDI Platform')}  |  "
        f"Prediction ID: #{prediction.id}", meta
    ))
    elements.append(Spacer(1, 0.4*cm))

    # ── EDS SCORE BOX ───────────────────────────────────────────────────────
    eds = prediction.eds_score or 0
    eds_color = BRAND_SUCCESS if eds > 75 else (BRAND_WARNING if eds > 50 else BRAND_DANGER)
    score_data = [[
        Paragraph(f"ENERGY DIGNITY SCORE", ParagraphStyle("sl", fontSize=9, textColor=BRAND_MUTED,
                  fontName="Helvetica", alignment=TA_CENTER)),
        Paragraph(f"CONFIDENCE", ParagraphStyle("sl", fontSize=9, textColor=BRAND_MUTED,
                  fontName="Helvetica", alignment=TA_CENTER)),
        Paragraph(f"INVESTMENT PRIORITY", ParagraphStyle("sl", fontSize=9, textColor=BRAND_MUTED,
                  fontName="Helvetica", alignment=TA_CENTER)),
        Paragraph(f"EXPECTED ROI", ParagraphStyle("sl", fontSize=9, textColor=BRAND_MUTED,
                  fontName="Helvetica", alignment=TA_CENTER)),
    ],[
        Paragraph(f"<b>{eds:.1f}/100</b>", ParagraphStyle("sv", fontSize=24, textColor=eds_color,
                  fontName="Helvetica-Bold", alignment=TA_CENTER)),
        Paragraph(f"<b>{prediction.confidence_level or 87:.1f}%</b>", ParagraphStyle("sv", fontSize=24,
                  textColor=BRAND_PRIMARY, fontName="Helvetica-Bold", alignment=TA_CENTER)),
        Paragraph(f"<b>{policy.get('priority', 'High')}</b>", ParagraphStyle("sv", fontSize=20,
                  textColor=BRAND_WARNING, fontName="Helvetica-Bold", alignment=TA_CENTER)),
        Paragraph(f"<b>{prediction.expected_roi or 3.2:.1f}x</b>", ParagraphStyle("sv", fontSize=24,
                  textColor=BRAND_SUCCESS, fontName="Helvetica-Bold", alignment=TA_CENTER)),
    ]]
    score_tbl = Table(score_data, colWidths=["25%"]*4)
    score_tbl.setStyle(TableStyle([
        ("BACKGROUND",  (0,0), (-1,-1), BRAND_CARD),
        ("GRID",        (0,0), (-1,-1), 0.5, colors.HexColor("#1A2332")),
        ("PADDING",     (0,0), (-1,-1), 12),
        ("LINEABOVE",   (0,0), (-1,0), 2, BRAND_PRIMARY),
    ]))
    elements.append(score_tbl)
    elements.append(Spacer(1, 0.5*cm))

    # ── EDS COMPONENTS ──────────────────────────────────────────────────────
    elements.append(Paragraph("EDS Component Breakdown", h2))
    comp_data = [
        ["Component", "Weight", "Score", "Status"],
        ["📚 Education", "25%", f"{prediction.education_score or 0:.1f}/100", ""],
        ["🏥 Healthcare", "20%", f"{prediction.healthcare_score or 0:.1f}/100", ""],
        ["💰 Economic Growth", "20%", f"{prediction.economic_score or 0:.1f}/100", ""],
        ["♀  Women's Empowerment", "15%", f"{prediction.women_score or 0:.1f}/100", ""],
        ["📶 Digital Inclusion", "10%", f"{prediction.digital_score or 0:.1f}/100", ""],
        ["🌱 Carbon Benefit", "10%", f"{prediction.carbon_score or 0:.1f}/100", ""],
    ]
    def component_color(val_str):
        try:
            v = float(val_str.split("/")[0])
            return BRAND_SUCCESS if v > 70 else (BRAND_WARNING if v > 45 else BRAND_DANGER)
        except: return BRAND_MUTED
    comp_tbl = Table(comp_data, colWidths=["40%", "15%", "25%", "20%"])
    comp_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,0), BRAND_DARK),
        ("TEXTCOLOR",    (0,0), (-1,0), BRAND_PRIMARY),
        ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",     (0,0), (-1,-1), 10),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#0A0F1E"), colors.HexColor("#0D1117")]),
        ("GRID",         (0,0), (-1,-1), 0.3, colors.HexColor("#1A2332")),
        ("PADDING",      (0,0), (-1,-1), 10),
    ]))
    elements.append(comp_tbl)
    elements.append(Spacer(1, 0.4*cm))

    # ── FORMULA ─────────────────────────────────────────────────────────────
    elements.append(Paragraph("Novel EDS Formula (Kaushik Digital)", h2))
    formula = "EDS = 0.25(Education) + 0.20(Healthcare) + 0.20(Economic Growth) + 0.15(Women's Empowerment) + 0.10(Digital Inclusion) + 0.10(Carbon Benefit)"
    elements.append(Paragraph(formula, ParagraphStyle("formula", fontSize=10, textColor=BRAND_PRIMARY,
                              fontName="Helvetica-Bold", backColor=BRAND_CARD, borderPadding=10,
                              leading=18, spaceAfter=8)))
    elements.append(Spacer(1, 0.3*cm))

    # ── POLICY RECOMMENDATIONS ───────────────────────────────────────────────
    if policy:
        elements.append(Paragraph("AI Policy Recommendations", h2))
        if policy.get("summary"):
            elements.append(Paragraph(policy["summary"], body))
        if policy.get("dignity_insight"):
            elements.append(Paragraph(f'"{policy["dignity_insight"]}"', highlight))

        recs = policy.get("recommendations", [])
        if recs:
            rec_data = [["#", "Action", "Impact", "Timeline", "Cost (Cr)"]]
            for i, r in enumerate(recs, 1):
                rec_data.append([
                    str(i),
                    r.get("action", ""),
                    r.get("impact", ""),
                    r.get("timeline", ""),
                    f"₹{r.get('cost_crore', 0):.1f}",
                ])
            rec_tbl = Table(rec_data, colWidths=["5%", "30%", "35%", "15%", "15%"])
            rec_tbl.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), BRAND_ACCENT),
                ("TEXTCOLOR",  (0,0), (-1,0), WHITE),
                ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
                ("FONTSIZE",   (0,0), (-1,-1), 9),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#0A0F1E"), colors.HexColor("#0D1117")]),
                ("GRID",       (0,0), (-1,-1), 0.3, colors.HexColor("#1A2332")),
                ("PADDING",    (0,0), (-1,-1), 8),
                ("VALIGN",     (0,0), (-1,-1), "TOP"),
            ]))
            elements.append(rec_tbl)

        if policy.get("policy_message"):
            elements.append(Spacer(1, 0.3*cm))
            elements.append(Paragraph(f'💡 {policy["policy_message"]}',
                ParagraphStyle("pm", fontSize=11, textColor=BRAND_SUCCESS,
                               fontName="Helvetica-BoldOblique", leading=18, backColor=BRAND_CARD,
                               borderPadding=10)))

    elements.append(Spacer(1, 0.5*cm))

    # ── INPUT DATA ──────────────────────────────────────────────────────────
    elements.append(Paragraph("Village Input Parameters", h2))
    inp_pairs = [
        ("Population",             input_data.get("population", "—")),
        ("Households",             input_data.get("households", "—")),
        ("Electricity Access",     f"{input_data.get('electricity_access_pct', 0):.1f}%"),
        ("Literacy Rate",          f"{input_data.get('literacy_rate', 0):.1f}%"),
        ("Female Employment",      f"{input_data.get('female_employment_rate', 0):.1f}%"),
        ("Average Income",         f"₹{input_data.get('income_level', 0):,.0f}/yr"),
        ("Renewable Energy",       f"{input_data.get('renewable_energy_pct', 0):.1f}%"),
        ("Internet Connectivity",  f"{input_data.get('internet_connectivity', 0):.0%}"),
        ("Road Connectivity",      f"{input_data.get('road_connectivity', 0):.0%}"),
        ("Water Access",           f"{input_data.get('water_access', 0):.0%}"),
    ]
    rows = [inp_pairs[i:i+2] for i in range(0, len(inp_pairs), 2)]
    flat = [["Parameter", "Value", "Parameter", "Value"]] + \
           [[r[0][0], r[0][1], r[1][0] if len(r)>1 else "", r[1][1] if len(r)>1 else ""] for r in rows]
    inp_tbl = Table(flat, colWidths=["25%","25%","25%","25%"])
    inp_tbl.setStyle(TableStyle([
        ("BACKGROUND",   (0,0), (-1,0), BRAND_DARK),
        ("TEXTCOLOR",    (0,0), (-1,0), BRAND_MUTED),
        ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",     (0,0), (-1,-1), 9),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#0A0F1E"), colors.HexColor("#0D1117")]),
        ("GRID",         (0,0), (-1,-1), 0.3, colors.HexColor("#1A2332")),
        ("PADDING",      (0,0), (-1,-1), 8),
        ("TEXTCOLOR",    (1,1), (1,-1), BRAND_PRIMARY),
        ("TEXTCOLOR",    (3,1), (3,-1), BRAND_PRIMARY),
        ("FONTNAME",     (1,1), (1,-1), "Helvetica-Bold"),
        ("FONTNAME",     (3,1), (3,-1), "Helvetica-Bold"),
    ]))
    elements.append(inp_tbl)

    # ── FOOTER ──────────────────────────────────────────────────────────────
    elements.append(Spacer(1, 0.8*cm))
    elements.append(HRFlowable(color=BRAND_ACCENT, thickness=1, width="100%"))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(
        "Energy Dignity Index Platform  ·  Built by <b>Kaushik Digital</b>  ·  "
        "Measuring Human Progress Through Energy Access  ·  "
        f"Report generated {datetime.now().strftime('%Y-%m-%d')}",
        ParagraphStyle("footer", fontSize=8, textColor=BRAND_MUTED, alignment=TA_CENTER)
    ))
    elements.append(Paragraph(
        "© 2025 Kaushik Digital. This report uses the novel Energy Dignity Score (EDS) framework.",
        ParagraphStyle("copy", fontSize=7, textColor=BRAND_MUTED, alignment=TA_CENTER)
    ))

    doc.build(elements)
    return buf.getvalue()
