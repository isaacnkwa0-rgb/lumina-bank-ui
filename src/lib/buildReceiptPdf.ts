export async function buildReceiptPdf(
  rows: { label: string; value: string }[],
  title: string
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const PAD = 40;
  const red: [number, number, number] = [219, 0, 17];
  const darkRed: [number, number, number] = [176, 0, 13];
  const altRow: [number, number, number] = [250, 250, 250];
  const dark: [number, number, number] = [15, 15, 30];

  // ── Header background ──────────────────────────────────────────
  doc.setFillColor(...red);
  doc.rect(0, 0, W, 110, "F");

  // Subtle darker stripe at bottom of header
  doc.setFillColor(...darkRed);
  doc.rect(0, 100, W, 10, "F");

  // ── Diamond logo (drawn, no Unicode) ───────────────────────────
  // Outer diamond
  const cx = PAD + 18;
  const cy = 54;
  const r = 16;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  // Draw diamond as 4-point polygon
  doc.lines(
    [[r, -r], [r, r], [-r, r], [-r, -r]],
    cx - r, cy,
    [1, 1],
    "F",
    true
  );
  // Inner diamond (darker red cutout feel)
  const ir = 8;
  doc.setFillColor(...red);
  doc.lines(
    [[ir, -ir], [ir, ir], [-ir, ir], [-ir, -ir]],
    cx - ir, cy,
    [1, 1],
    "F",
    true
  );

  // ── Bank name ──────────────────────────────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("LUMINA BANK", cx + r + 10, cy + 8);

  // ── Subtitle ───────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 200, 200);
  doc.text(title.toUpperCase(), W / 2, 90, { align: "center" });

  // ── Rows ───────────────────────────────────────────────────────
  let y = 140;
  const ROW_H = 36;

  rows.forEach((row, i) => {
    // Alternating row background full-width
    if (i % 2 === 0) {
      doc.setFillColor(...altRow);
      doc.rect(0, y - 22, W, ROW_H, "F");
    }

    // Label
    doc.setFontSize(11);
    doc.setTextColor(140, 140, 140);
    doc.setFont("helvetica", "normal");
    doc.text(row.label, PAD, y);

    // Value
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(row.value, W - PAD, y, { align: "right" });

    y += ROW_H;
  });

  // ── Divider ────────────────────────────────────────────────────
  y += 12;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(PAD, y, W - PAD, y);

  // ── Footer ─────────────────────────────────────────────────────
  doc.setFillColor(248, 248, 248);
  doc.rect(0, H - 60, W, 60, "F");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text(
    "Lumina Bank plc  |  FCA Register No. 56754  |  FSCS protected up to \xA385,000",
    W / 2,
    H - 36,
    { align: "center" }
  );
  doc.text(
    `Generated ${new Date().toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    })}`,
    W / 2,
    H - 20,
    { align: "center" }
  );

  // Left red accent bar on footer
  doc.setFillColor(...red);
  doc.rect(0, H - 60, 4, 60, "F");

  return doc.output("blob");
}

export async function downloadReceiptPdf(
  rows: { label: string; value: string }[],
  title: string,
  filename: string
) {
  const blob = await buildReceiptPdf(rows, title);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function shareReceiptPdf(
  rows: { label: string; value: string }[],
  title: string,
  filename: string
) {
  const blob = await buildReceiptPdf(rows, title);
  const file = new File([blob], filename, { type: "application/pdf" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ title: "Lumina Bank - " + title, files: [file] });
  } else {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
