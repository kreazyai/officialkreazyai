// ─────────────────────────────────────────────────────────────────────────────
// KREAZY AI - OFFICIAL TAX INVOICE & RECEIPT GENERATOR SERVICE
// Creates high-resolution, printable, and downloadable tax invoices
// ─────────────────────────────────────────────────────────────────────────────
import { jsPDF } from 'jspdf';

export function generateInvoiceHtml(invoice, plan, user) {
  const planName = plan?.name || 'Growth';
  const priceUsd = plan?.price || 119;
  const priceBdt = plan?.priceBdt || (priceUsd * 120);
  const convLimit = plan?.conversationsLimit || plan?.conversationsNum || (priceUsd === 49 ? 1000 : (priceUsd === 299 ? 25000 : 5000));
  const senderNumber = invoice?.senderNumber || '01643792804';
  const trxId = invoice?.trxId || 'TRX-VERIFIED';
  const invoiceId = invoice?.id || `INV-${new Date().getFullYear()}-001`;
  const invoiceDate = invoice?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const paymentMethod = invoice?.method || 'bKash / Nagad 01643792804 (Send money)';
  const customerName = user?.name || user?.email?.split('@')[0] || 'Valued Merchant';
  const customerEmail = user?.email || 'merchant@kreazyai.com';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${invoiceId} - Kreazy AI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px 20px;
      line-height: 1.5;
    }
    .invoice-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      position: relative;
    }
    .top-actions-bar {
      background: #092A20;
      color: #ffffff;
      padding: 12px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-action {
      background: #087A4A;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-action:hover { background: #0b935a; }
    .invoice-body {
      padding: 40px 48px;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #EFFBF5;
      padding-bottom: 28px;
      margin-bottom: 32px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: #087A4A;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 900;
      color: #092A20;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #087A4A;
      letter-spacing: 1px;
    }
    .invoice-title-block {
      text-align: right;
    }
    .invoice-title {
      font-size: 28px;
      font-weight: 900;
      color: #092A20;
      letter-spacing: -0.5px;
    }
    .invoice-status-badge {
      display: inline-block;
      margin-top: 6px;
      background: #DDF7E9;
      color: #087A4A;
      border: 1.5px solid #087A4A;
      border-radius: 100px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
    }
    .meta-box h4 {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.8px;
      margin-bottom: 8px;
    }
    .meta-box p {
      font-size: 14px;
      color: #334155;
      margin-bottom: 4px;
    }
    .meta-box strong {
      color: #0f172a;
    }
    .payment-cleared-banner {
      background: #EFFBF5;
      border: 1.5px solid #AEEBCB;
      border-radius: 12px;
      padding: 18px 24px;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .cleared-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .cleared-check {
      width: 32px;
      height: 32px;
      background: #087A4A;
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 16px;
    }
    .table-container {
      margin-bottom: 36px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
      text-align: left;
      padding: 12px 16px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    tbody td {
      padding: 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .mono-trx {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      font-weight: 700;
      color: #087A4A;
      background: #EFFBF5;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #D9E9E1;
    }
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    .summary-box {
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px 24px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: #64748b;
    }
    .summary-row.total {
      border-top: 2px solid #087A4A;
      margin-top: 12px;
      padding-top: 12px;
      font-size: 18px;
      font-weight: 900;
      color: #092A20;
    }
    .stamp-seal {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 28px;
      border-top: 1px solid #e2e8f0;
      color: #64748b;
      font-size: 12px;
    }
    .digital-seal-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 2px dashed #087A4A;
      padding: 8px 16px;
      border-radius: 8px;
      color: #087A4A;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-wrapper { box-shadow: none; border: none; }
      .top-actions-bar { display: none !important; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>

<div class="invoice-wrapper">
  <!-- Interactive Web Bar (Hidden in print) -->
  <div class="top-actions-bar">
    <div style="font-size: 13px; font-weight: 600;">Kreazy AI Billing System • Verified Tax Invoice</div>
    <div style="display: flex; gap: 10px;">
      <button class="btn-action" onclick="window.print()">🖨️ Print / Save PDF</button>
    </div>
  </div>

  <div class="invoice-body">
    <!-- Header -->
    <div class="header-row">
      <div class="brand-logo">
        <div class="logo-badge">K</div>
        <div>
          <div class="brand-name">Kreazy AI</div>
          <div class="brand-sub">Enterprise Autonomous Agent Platform</div>
        </div>
      </div>
      <div class="invoice-title-block">
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-status-badge">✓ PAYMENT CLEARED & CONFIRMED</div>
      </div>
    </div>

    <!-- Meta Info -->
    <div class="meta-grid">
      <div class="meta-box">
        <h4>Billed From</h4>
        <p><strong>Kreazy AI Technologies Ltd.</strong></p>
        <p>Level 8, Software Technology Park</p>
        <p>Kawran Bazar, Dhaka-1215, Bangladesh</p>
        <p>Email: <strong>billing@kreazyai.com</strong></p>
        <p>BIN / Tax Registration: <strong>BIN-004829103-2026</strong></p>
      </div>

      <div class="meta-box">
        <h4>Billed To (Customer)</h4>
        <p><strong>${customerName}</strong></p>
        <p>Account Email: <strong>${customerEmail}</strong></p>
        <p>Invoice ID: <strong>${invoiceId}</strong></p>
        <p>Invoice Date: <strong>${invoiceDate}</strong></p>
        <p>Billing Cycle: <strong>30-Day Monthly Access</strong></p>
      </div>
    </div>

    <!-- Payment Gateway Cleared Confirmation Banner -->
    <div class="payment-cleared-banner">
      <div class="cleared-left">
        <div class="cleared-check">✓</div>
        <div>
          <div style="font-weight: 800; font-size: 14px; color: #092A20;">
            Mobile Payment Verified & Cleared
          </div>
          <div style="font-size: 12px; color: #52645D;">
            Processed via ${paymentMethod}
          </div>
        </div>
      </div>

      <div>
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b;">Transaction ID (TrxID)</div>
        <div class="mono-trx">${trxId}</div>
      </div>

      <div>
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b;">Sender Account</div>
        <div style="font-weight: 700; font-size: 13px; color: #092A20;">${senderNumber}</div>
      </div>
    </div>

    <!-- Line Items Table -->
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 55%;">Subscription Item & Description</th>
            <th style="width: 15%; text-align: center;">Qty</th>
            <th style="width: 15%; text-align: right;">Unit Price</th>
            <th style="width: 15%; text-align: right;">Total Paid</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div style="font-weight: 800; font-size: 15px; color: #092A20; margin-bottom: 4px;">
                ${planName} Plan — Autonomous Omnichannel AI Agent
              </div>
              <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
                • ${convLimit.toLocaleString()} monthly autonomous customer conversations<br>
                • WhatsApp Cloud API + Facebook Messenger + Web widget integration<br>
                • Automated lead qualification, order confirmation & CRM sync<br>
                • 24/7 dedicated system uptime and priority queue routing
              </div>
            </td>
            <td style="text-align: center; font-weight: 700;">1 Month</td>
            <td style="text-align: right; font-weight: 600; color: #475569;">
              $${priceUsd}.00<br>
              <span style="font-size: 11px; color: #087A4A;">৳${priceBdt.toLocaleString()} BDT</span>
            </td>
            <td style="text-align: right; font-weight: 800; color: #092A20;">
              $${priceUsd}.00<br>
              <span style="font-size: 12px; color: #087A4A; font-weight: 700;">৳${priceBdt.toLocaleString()} BDT</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Summary Box -->
    <div class="summary-section">
      <div class="summary-box">
        <div class="summary-row">
          <span>Subtotal (USD):</span>
          <span>$${priceUsd}.00</span>
        </div>
        <div class="summary-row">
          <span>Official Conversion (1 USD):</span>
          <span>120.00 BDT</span>
        </div>
        <div class="summary-row">
          <span>Subtotal (BDT):</span>
          <span>৳${priceBdt.toLocaleString()} BDT</span>
        </div>
        <div class="summary-row">
          <span>VAT / Digital Tax (0%):</span>
          <span>৳0.00 BDT</span>
        </div>
        <div class="summary-row total">
          <span>Total Paid:</span>
          <span>৳${priceBdt.toLocaleString()} BDT</span>
        </div>
        <div style="text-align: right; font-size: 11px; color: #087A4A; font-weight: 700; margin-top: 4px;">
          ($${priceUsd}.00 USD Paid in Full)
        </div>
      </div>
    </div>

    <!-- Footer & Seal -->
    <div class="stamp-seal">
      <div>
        <p><strong>Note:</strong> This document is a computer-generated official tax invoice and electronic receipt.</p>
        <p>For questions or enterprise tax inquiries: <strong>billing@kreazyai.com</strong> | <strong>01643792804</strong></p>
      </div>

      <div class="digital-seal-badge">
        <span>🛡️</span>
        <span>DIGITALLY VERIFIED BY KREAZY AI GATEWAY</span>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;
}

export function downloadInvoiceHtml(invoice, plan, user) {
  const html = generateInvoiceHtml(invoice, plan, user);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const invoiceId = invoice?.id || 'Invoice';
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoiceId}_KreazyAI_Tax_Invoice.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printInvoicePdf(invoice, plan, user) {
  const html = generateInvoiceHtml(invoice, plan, user);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for fonts and styling to load, then trigger native browser Print / PDF Save dialog
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  } else {
    // If popup blocker intervened, fallback to automatic PDF file download
    downloadInvoicePdf(invoice, plan, user);
  }
}

export function downloadInvoicePdf(invoice, plan, user) {
  try {
    const planName = plan?.name || 'Growth';
    const priceUsd = plan?.price || 119;
    const priceBdt = plan?.priceBdt || (priceUsd * 120);
    const convLimit = plan?.conversationsLimit || plan?.conversationsNum || (priceUsd === 49 ? 1000 : (priceUsd === 299 ? 25000 : 5000));
    const senderNumber = invoice?.senderNumber || '01643792804';
    const trxId = invoice?.trxId || 'TRX-VERIFIED';
    const invoiceId = invoice?.id || `INV-${new Date().getFullYear()}-001`;
    const invoiceDate = invoice?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const paymentMethod = invoice?.method || 'bKash / Nagad 01643792804 (Send money)';
    const customerName = user?.name || user?.email?.split('@')[0] || 'Valued Merchant';
    const customerEmail = user?.email || 'merchant@kreazyai.com';

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ── 1. Top Header Banner ──
    doc.setFillColor(9, 42, 32); // #092A20
    doc.roundedRect(14, 12, 182, 26, 3, 3, 'F');

    // Logo mark
    doc.setFillColor(8, 122, 74); // #087A4A
    doc.roundedRect(20, 16.5, 11, 11, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('K', 25.5, 24.5, { align: 'center' });

    // Brand Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Kreazy AI', 35, 22.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(174, 235, 203); // #AEEBCB
    doc.text('Autonomous Omnichannel AI Agent Platform', 35, 27.5);

    // Right Header Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('TAX INVOICE', 190, 22, { align: 'right' });

    // Status Pill
    doc.setFillColor(221, 247, 233); // #DDF7E9
    doc.roundedRect(142, 25, 48, 6.5, 3, 3, 'F');
    doc.setTextColor(8, 122, 74);
    doc.setFontSize(7.5);
    doc.text('PAID & CONFIRMED', 166, 29.5, { align: 'center' });

    // ── 2. Metadata Section ──
    // Billed From
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED FROM:', 16, 46);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.text('Kreazy AI Technologies Ltd.', 16, 51);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text('Level 8, Software Technology Park', 16, 55.5);
    doc.text('Kawran Bazar, Dhaka-1215, Bangladesh', 16, 60);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(8, 122, 74);
    doc.text('BIN / Tax Reg: BIN-004829103-2026', 16, 64.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Email: billing@kreazyai.com | Phone: 01643792804', 16, 69);

    // Billed To
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('BILLED TO (CUSTOMER):', 114, 46);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.text(customerName, 114, 51);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8);
    doc.text(`Account Email: ${customerEmail}`, 114, 55.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(8, 122, 74);
    doc.text(`Invoice Number: ${invoiceId}`, 114, 60);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Invoice Date: ${invoiceDate}`, 114, 64.5);
    doc.text('Billing Cycle: 30-Day Monthly Access', 114, 69);

    // ── 3. Payment Gateway Cleared Confirmation Banner ──
    doc.setFillColor(239, 251, 245); // #EFFBF5
    doc.setDrawColor(174, 235, 203); // #AEEBCB
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 74, 182, 22, 2.5, 2.5, 'FD');

    // Circle checkmark badge
    doc.setFillColor(8, 122, 74);
    doc.circle(22, 85, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('OK', 22, 87.5, { align: 'center' });

    doc.setTextColor(9, 42, 32);
    doc.setFontSize(9.5);
    doc.text('Mobile Payment Verified & Cleared', 29, 82.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 100, 93);
    doc.setFontSize(7.5);
    doc.text(`Official Recipient: 01643792804 (Send money)`, 29, 87);
    doc.text(`Method: ${paymentMethod}`, 29, 91.5);

    // TrxID box
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('TRANSACTION ID (TrxID):', 125, 82.5);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(217, 233, 225);
    doc.roundedRect(125, 84.5, 65, 6.5, 1.5, 1.5, 'FD');
    doc.setTextColor(8, 122, 74);
    doc.setFontSize(8.5);
    doc.text(trxId, 128, 89);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Sender: ${senderNumber}`, 125, 94);

    // ── 4. Line Items Table ──
    const tableTop = 101;
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(14, tableTop, 182, 8, 'FD');

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('ITEM & DESCRIPTION', 18, tableTop + 5.5);
    doc.text('QTY', 120, tableTop + 5.5);
    doc.text('UNIT PRICE', 142, tableTop + 5.5);
    doc.text('TOTAL PAID', 170, tableTop + 5.5);

    // Table body container
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, tableTop + 8, 182, 46, 'S');

    // Title
    doc.setTextColor(9, 42, 32);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${planName} Plan — Autonomous Omnichannel AI Agent`, 18, tableTop + 16);

    // Bullets
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`* ${convLimit.toLocaleString()} monthly autonomous customer conversations`, 18, tableTop + 22);
    doc.text(`* WhatsApp Cloud API + Facebook Messenger + Web chat widget integration`, 18, tableTop + 27);
    doc.text(`* Lead qualification, automated catalog recommendations & CRM sync`, 18, tableTop + 32);
    doc.text(`* 24/7 dedicated system uptime and priority queue processing`, 18, tableTop + 37);
    doc.text(`* Official Bangladesh bKash & Nagad automated digital payment verification`, 18, tableTop + 42);
    doc.text(`* Priority multi-channel support with custom prompt engineering`, 18, tableTop + 47);

    // Qty
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('1 Month', 120, tableTop + 18);

    // Unit Price
    doc.setTextColor(71, 85, 105);
    doc.text(`$${priceUsd}.00`, 142, tableTop + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(8, 122, 74);
    doc.text(`(৳${priceBdt.toLocaleString()})`, 142, tableTop + 23);

    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(8, 122, 74);
    doc.text(`৳${priceBdt.toLocaleString()}`, 170, tableTop + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`$${priceUsd}.00 USD`, 170, tableTop + 23);

    // ── 5. Summary Section ──
    const summaryTop = tableTop + 58;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(114, summaryTop, 82, 36, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal (USD):', 118, summaryTop + 6);
    doc.setTextColor(15, 23, 42);
    doc.text(`$${priceUsd}.00`, 190, summaryTop + 6, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.text('Exchange Rate (USD to BDT):', 118, summaryTop + 11.5);
    doc.setTextColor(15, 23, 42);
    doc.text('120.00 BDT', 190, summaryTop + 11.5, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.text('Subtotal (BDT):', 118, summaryTop + 17);
    doc.setTextColor(15, 23, 42);
    doc.text(`৳${priceBdt.toLocaleString()} BDT`, 190, summaryTop + 17, { align: 'right' });

    doc.setTextColor(100, 116, 139);
    doc.text('VAT / Digital Export Tax (0%):', 118, summaryTop + 22.5);
    doc.setTextColor(15, 23, 42);
    doc.text('৳0.00 BDT', 190, summaryTop + 22.5, { align: 'right' });

    // Green divider
    doc.setDrawColor(8, 122, 74);
    doc.setLineWidth(0.5);
    doc.line(118, summaryTop + 25.5, 192, summaryTop + 25.5);

    // Grand total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(9, 42, 32);
    doc.text('Total Paid:', 118, summaryTop + 31);
    doc.setTextColor(8, 122, 74);
    doc.text(`৳${priceBdt.toLocaleString()} BDT`, 190, summaryTop + 31, { align: 'right' });

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`($${priceUsd}.00 USD Paid in Full)`, 190, summaryTop + 34.5, { align: 'right' });

    // ── 6. Verification Seal & Legal ──
    const sealTop = summaryTop + 42;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(14, sealTop, 196, sealTop);

    // Left legal notes
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('LEGAL & TAX NOTICE:', 16, sealTop + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text('* This document is an official computer-generated Tax Invoice and payment receipt.', 16, sealTop + 9.5);
    doc.text('* Electronic receipt requires no physical signature under Bangladesh digital commerce regulations.', 16, sealTop + 14);
    doc.text('* Accounting questions: billing@kreazyai.com | Official hotline: 01643792804', 16, sealTop + 18.5);
    doc.text('* Registered at Level 8, Software Technology Park, Dhaka-1215 | https://kreazyai.com', 16, sealTop + 23);

    // Right digital seal box
    doc.setFillColor(239, 251, 245);
    doc.setDrawColor(8, 122, 74);
    doc.setLineWidth(0.5);
    doc.roundedRect(128, sealTop + 4, 68, 23, 2, 2, 'FD');

    doc.setTextColor(8, 122, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('[ OFFICIAL VERIFICATION SEAL ]', 162, sealTop + 9, { align: 'center' });

    doc.setTextColor(9, 42, 32);
    doc.setFontSize(8);
    doc.text('KREAZY AI GATEWAY DHAKA', 162, sealTop + 14, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setTextColor(8, 122, 74);
    doc.text('PAID VIA 01643792804 SEND MONEY', 162, sealTop + 18.5, { align: 'center' });

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.text(`TRX: ${trxId} | ${invoiceDate}`, 162, sealTop + 23, { align: 'center' });

    // ── 7. Page Footer ──
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Page 1 of 1 • Kreazy AI Autonomous Agent Platform • Official Digital Tax Receipt', 105, 285, { align: 'center' });

    // Direct save/download as true .pdf file!
    const fileName = `${invoiceId}_KreazyAI_Tax_Invoice.pdf`;
    doc.save(fileName);
    return true;
  } catch (err) {
    console.error('Error generating PDF with jsPDF:', err);
    // Fallback to print window
    printInvoicePdf(invoice, plan, user);
    return false;
  }
}

