// =====================================================================
// KREAZYAI BRANDED INVOICE GENERATOR SERVICE
// Generates high-res PDF invoices using store identity & "Powered by KreazyAI"
// Enables 1-click sharing to WhatsApp, Messenger, or saving to device
// =====================================================================

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Order, User, BusinessProfile } from '../types';

export interface InvoiceOptions {
  order: Order;
  user?: User | null;
  business?: BusinessProfile | null;
}

export function buildInvoiceHtml(options: InvoiceOptions): string {
  const { order, user, business } = options;

  // Use the verified store identity saved during signup (Step 6)
  const storeName = business?.name || user?.storeName || 'KreazyAI Merchant';
  const ownerName = business?.ownerName || user?.name || 'Authorized Merchant';
  const ownerEmail = business?.businessEmail || user?.email || 'contact@kreazyai.com';
  const ownerPhone = business?.businessPhone || user?.phone || '';
  const currency = business?.baseCurrency || 'USD';
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  // Profile avatar / logo if saved during signup
  const avatarUrl = user?.avatarUrl || business?.avatarUrl || '';

  const invoiceNumber = `INV-${order.id.replace(/^ORD-?/, '')}`;
  const issueDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : new Date().toLocaleDateString();

  const customerName = order.customerName || 'Valued Customer';
  const customerEmail = order.customerEmail || 'N/A';
  const customerPhone = order.customerPhone || 'N/A';
  const paymentMethod = order.paymentMethod || 'Cash On Delivery (COD)';
  const channel = order.channel || 'DIRECT';

  const itemsHtml = (order.items || []).map((item, index) => {
    const itemName = item.productName || item.name || 'Product Item';
    const sku = item.productSku || item.sku || 'N/A';
    const qty = item.quantity || 1;
    const unitPrice = item.unitPrice || item.price || 0;
    const total = item.totalPrice || (unitPrice * qty);

    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">${index + 1}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0;">
          <div style="font-weight: 600; font-size: 14px; color: #0f172a;">${itemName}</div>
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace;">SKU: ${sku}</div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 14px; color: #334155;">${qty}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; color: #334155;">${currencySymbol}${unitPrice.toFixed(2)}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; font-size: 14px; color: #0f172a;">${currencySymbol}${total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const subtotal = order.subtotal || order.total || 0;
  const discount = order.discount || 0;
  const grandTotal = order.total || (subtotal - discount);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 32px;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .header {
      background: #06080D;
      color: #ffffff;
      padding: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-avatar {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: #FF334B;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      object-fit: cover;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .brand-tagline {
      font-size: 12px;
      color: #94a3b8;
    }
    .invoice-title-block {
      text-align: right;
    }
    .invoice-title {
      font-size: 24px;
      font-weight: 800;
      color: #FF334B;
      letter-spacing: 1px;
    }
    .invoice-num {
      font-family: monospace;
      font-size: 14px;
      color: #cbd5e1;
      margin-top: 4px;
    }
    .body {
      padding: 32px;
    }
    .info-grid {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #f1f5f9;
    }
    .info-col {
      flex: 1;
    }
    .info-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .info-val {
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .info-sub {
      font-size: 13px;
      color: #64748b;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      background: #ecfdf5;
      color: #0fa968;
      border: 1px solid #a7f3d0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background: #f8fafc;
      padding: 12px 16px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
    }
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
    .summary-box {
      width: 280px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
      color: #64748b;
    }
    .summary-row.total {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      border-top: 2px solid #0f172a;
      padding-top: 12px;
      margin-top: 8px;
    }
    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 20px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #64748b;
    }
    .powered-by {
      font-weight: 700;
      color: #FF334B;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div class="brand-section">
        ${avatarUrl ? `<img src="${avatarUrl}" class="brand-avatar" alt="Logo" />` : `<div class="brand-avatar">${storeName.charAt(0).toUpperCase()}</div>`}
        <div>
          <div class="brand-name">${storeName}</div>
          <div class="brand-tagline">Official Merchant Invoice & Delivery Note</div>
        </div>
      </div>
      <div class="invoice-title-block">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-num">${invoiceNumber}</div>
      </div>
    </div>

    <div class="body">
      <div class="info-grid">
        <div class="info-col">
          <div class="info-label">Billed To</div>
          <div class="info-val">${customerName}</div>
          <div class="info-sub">${customerPhone}</div>
          <div class="info-sub">${customerEmail}</div>
        </div>
        <div class="info-col">
          <div class="info-label">Merchant Details</div>
          <div class="info-val">${ownerName}</div>
          <div class="info-sub">${ownerEmail}</div>
          ${ownerPhone ? `<div class="info-sub">${ownerPhone}</div>` : ''}
        </div>
        <div class="info-col">
          <div class="info-label">Order Details</div>
          <div class="info-sub"><strong>Date:</strong> ${issueDate}</div>
          <div class="info-sub"><strong>Channel:</strong> ${channel}</div>
          <div class="info-sub"><strong>Payment:</strong> ${paymentMethod}</div>
          <div style="margin-top: 6px;"><span class="badge">${order.status}</span></div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">#</th>
            <th>Description</th>
            <th style="text-align: center; width: 60px;">Qty</th>
            <th style="text-align: right; width: 100px;">Price</th>
            <th style="text-align: right; width: 100px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="summary-section">
        <div class="summary-box">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${currencySymbol}${subtotal.toFixed(2)}</span>
          </div>
          ${discount > 0 ? `
            <div class="summary-row" style="color: #0fa968;">
              <span>Discount:</span>
              <span>-${currencySymbol}${discount.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span>Total Payable:</span>
            <span style="color: #FF334B;">${currencySymbol}${grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Thank you for your business! Please keep this invoice for your delivery records.</div>
      <div class="powered-by">Powered by KreazyAI</div>
    </div>
  </div>
</body>
</html>
  `;
}

export async function generateInvoicePdf(options: InvoiceOptions): Promise<{ uri: string }> {
  const html = buildInvoiceHtml(options);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false
  });
  return { uri };
}

export async function shareInvoice(options: InvoiceOptions): Promise<void> {
  const { uri } = await generateInvoicePdf(options);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Share Invoice for Order ${options.order.id}`,
      UTI: 'com.adobe.pdf'
    });
  } else {
    throw new Error('Sharing is not supported on this device.');
  }
}
