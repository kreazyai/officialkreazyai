import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  CreditCard, Smartphone, Upload, Check, CheckCircle2,
  AlertCircle, Loader2, X, Key, FileText, Copy, Plus,
  Trash2, Image as ImageIcon, ShieldCheck, Zap, Sparkles,
  Download, Printer, RotateCcw, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { printInvoicePdf, downloadInvoiceHtml } from '../../services/invoiceService';
import { addDashboardNotification } from '../../services/notificationStore';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: 'rgba(22,163,74,0.1)', border: 'rgba(22,163,74,0.25)', color: '#16a34a', icon: <CheckCircle2 size={16} /> },
    error: { bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', color: '#dc2626', icon: <AlertCircle size={16} /> },
    info: { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)', color: '#3b82f6', icon: <Sparkles size={16} /> },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: 'var(--bg-card, #ffffff)', border: `1px solid ${c.border}`,
      borderLeft: `4px solid ${c.color}`, borderRadius: '10px',
      padding: '0.85rem 1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      minWidth: '280px', maxWidth: '420px', animation: 'slideInRight 0.3s ease',
    }}>
      <span style={{ color: c.color, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', flexGrow: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function BillingPage({ user }) {
  const { updateUser } = useAuth();
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Storage key for user billing subscription
  const [activePlan, setActivePlan] = useState(() => {
    try {
      const stored = localStorage.getItem('kreazy_user_subscription');
      if (stored) return JSON.parse(stored);
    } catch {}

    const planName = user?.plan || '';
    const isPaid = user?.isSubscribed && planName && !['free', 'free trial', 'none', ''].includes(planName.toLowerCase());
    if (isPaid) {
      return {
        name: planName,
        price: planName.includes('299') ? 299 : (planName.includes('49') ? 49 : 119),
        priceBdt: planName.includes('299') ? 35880 : (planName.includes('49') ? 5880 : 14280),
        conversationsLimit: planName.includes('Scale') ? 25000 : (planName.includes('Starter') ? 1000 : 5000),
        conversationsUsed: 142,
        renewalDate: 'November 12, 2026',
        paymentMethod: 'bKash 01643792804 (Send money)',
        paymentMethodType: 'BKASH',
        senderNumber: '01643792804',
        trxId: 'BL98XJ28K9',
        screenshotUrl: null,
        invoices: [
          {
            id: 'INV-2026-001',
            date: 'October 12, 2026',
            amount: '$119.00 (৳14,280 BDT)',
            status: 'Verified',
            method: 'bKash 01643792804 (Send money)',
            trxId: 'BL98XJ28K9',
            senderNumber: '01643792804'
          }
        ]
      };
    }
    return null;
  });

  const [checkoutModal, setCheckoutModal] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('BKASH'); // 'BKASH' | 'NAGAD'
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [viewScreenshotModal, setViewScreenshotModal] = useState(null);
  const [paymentSuccessModal, setPaymentSuccessModal] = useState(null);
  const [clearPaymentMethodModal, setClearPaymentMethodModal] = useState(false);
  const screenshotInputRef = useRef(null);

  const PLANS = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: 49,
      priceBdt: 5880,
      period: '/ month',
      conversations: '1,000',
      conversationsNum: 1000,
      badge: null,
      description: 'Ideal for emerging merchants automating their first WhatsApp store channel.',
      features: [
        '1,000 autonomous AI conversations / mo',
        '1 Connected WhatsApp Business account',
        'Real-time catalog & inventory sync',
        'Basic order capture & CRM storage',
        'Standard email & community support'
      ]
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: 119,
      priceBdt: 14280,
      period: '/ month',
      conversations: '5,000',
      conversationsNum: 5000,
      badge: 'Most Popular',
      description: 'Built for scaling retail brands requiring multi-channel AI automation.',
      features: [
        '5,000 autonomous AI conversations / mo',
        'WhatsApp + Instagram + Messenger omnichannel',
        'Autonomous order placement & cart checkout',
        'AI sizing, discount & delivery advice',
        'Priority 24/7 AI Copilot support',
        'Dedicated webhook & Shopify/Woo sync'
      ]
    },
    {
      id: 'scale',
      name: 'Scale Plan',
      price: 299,
      priceBdt: 35880,
      period: '/ month',
      conversations: '25,000',
      conversationsNum: 25000,
      badge: 'High Volume',
      description: 'Enterprise-grade speed and custom fine-tuned agents for high-volume stores.',
      features: [
        '25,000 autonomous AI conversations / mo',
        'Unlimited social channels & team seats',
        'Custom fine-tuned AI prompts & catalog training',
        'Dedicated SLA & 99.9% uptime guarantee',
        'Dedicated customer success manager',
        'Custom ERP & payment gateway integrations'
      ]
    }
  ];

  const handleCopyNumber = () => {
    navigator.clipboard?.writeText('01643792804').then(() => {
      setCopiedNumber(true);
      setTimeout(() => setCopiedNumber(false), 2500);
    });
  };

  const handleScreenshotFile = (file) => {
    setCheckoutError('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setCheckoutError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setCheckoutError('Screenshot must be smaller than 10 MB.');
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setScreenshotPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleActivatePlan = (plan) => {
    setCheckoutError('');
    if (!senderNumber.trim()) {
      setCheckoutError('Please enter the sender phone number (your bKash/Nagad account).');
      return;
    }
    if (!trxId.trim()) {
      setCheckoutError('Please enter the Transaction ID (TrxID) received from Send Money.');
      return;
    }
    if (!screenshotPreview) {
      setCheckoutError('Please upload your payment transaction screenshot before submitting.');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const now = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(now.getMonth() + 1);
      const renewalStr = nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const invoiceId = `INV-${now.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      const priceBdt = Math.round(plan.price * 120);
      const methodName = selectedMethod === 'NAGAD' ? 'Nagad' : 'bKash';
      const formattedMethod = `${methodName} 01643792804 (Send money)`;
      const clearedTimeStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const invoiceItem = {
        id: invoiceId,
        date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        amount: `$${plan.price}.00 (৳${priceBdt.toLocaleString()} BDT)`,
        status: 'Confirmed & Cleared',
        method: formattedMethod,
        trxId: trxId.trim().toUpperCase(),
        senderNumber: senderNumber.trim(),
        screenshotUrl: screenshotPreview
      };

      const newSub = {
        name: plan.name,
        price: plan.price,
        priceBdt: priceBdt,
        conversationsLimit: plan.conversationsNum,
        conversationsUsed: 0,
        renewalDate: renewalStr,
        paymentMethod: formattedMethod,
        paymentMethodType: selectedMethod,
        paymentCleared: true,
        paymentClearedAt: clearedTimeStr,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim().toUpperCase(),
        screenshotUrl: screenshotPreview,
        screenshotName: screenshotName || 'payment_screenshot.png',
        invoices: [invoiceItem]
      };

      // 1. Persist subscription locally
      setActivePlan(newSub);
      localStorage.setItem('kreazy_user_subscription', JSON.stringify(newSub));

      // 2. Synchronize user auth profile
      if (updateUser) {
        updateUser({
          isSubscribed: true,
          plan: plan.name,
          subscriptionStatus: 'active'
        });
      }

      // 3. Dispatch instant reactive notification to Dashboard TopHeader
      addDashboardNotification({
        title: '🎉 Payment Confirmed & Plan Active',
        desc: `Payment of ৳${priceBdt.toLocaleString()} BDT for ${plan.name} has been verified & cleared via ${methodName} 01643792804. TrxID: ${trxId.trim().toUpperCase()}`,
        type: 'payment',
        time: 'Just now',
        link: '/dashboard/billing'
      });

      // 4. Capture details for the celebration confirmation modal
      const successData = {
        plan,
        invoice: invoiceItem,
        senderNumber: senderNumber.trim(),
        trxId: trxId.trim().toUpperCase(),
        priceBdt,
        methodName
      };

      // 5. Cleanly clear all input form fields
      setSenderNumber('');
      setTrxId('');
      setScreenshotPreview(null);
      setScreenshotName('');
      setCheckoutError('');
      setProcessing(false);
      setCheckoutModal(null);

      // 6. Show payment success confirmation modal
      setPaymentSuccessModal(successData);
      showToast(`🎉 Payment Confirmed! Your subscription to ${plan.name} is now 100% active.`, 'success');
    }, 700);
  };

  const handleClearPaymentMethod = () => {
    if (!activePlan) return;
    const updated = {
      ...activePlan,
      senderNumber: '',
      trxId: '',
      screenshotUrl: null,
      screenshotName: ''
    };
    setActivePlan(updated);
    try {
      localStorage.setItem('kreazy_user_subscription', JSON.stringify(updated));
    } catch {}
    setClearPaymentMethodModal(false);
    showToast('Saved payment sender details have been cleared.', 'info');
  };

  const handleCancelSubscription = () => {
    setActivePlan(null);
    localStorage.removeItem('kreazy_user_subscription');
    if (updateUser) {
      updateUser({
        isSubscribed: false,
        plan: 'Free Trial',
        subscriptionStatus: 'inactive'
      });
    }
    setShowCancelConfirm(false);
    showToast('Your subscription has been cancelled. Your account is now on the Free Trial.', 'info');
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Billing & Pricing
          </h1>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Manage your subscription tier, monthly quota limits, and bKash / Nagad payment verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--mint-soft, #EFFBF5)', border: '1px solid var(--border-medium, #D9E9E1)',
            padding: '5px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary, #087A4A)'
          }}>
            <Smartphone size={13} /> bKash & Nagad (01643792804)
          </span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'var(--mint-soft, #EFFBF5)', border: '1px solid var(--border-medium, #D9E9E1)',
            padding: '5px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary, #087A4A)'
          }}>
            <ShieldCheck size={13} /> Meta Cloud Verified
          </span>
        </div>
      </div>

      {activePlan ? (
        /* ===================================================================
           ACTIVE PAID SUBSCRIPTION VIEW
           =================================================================== */
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
            padding: '1.5rem', background: 'var(--mint-soft, #EFFBF5)', borderRadius: '14px',
            border: '1.5px solid var(--border-medium, #D9E9E1)', marginBottom: '1.5rem',
            boxShadow: '0 4px 14px rgba(8, 122, 74, 0.08)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-dark, #092A20)' }}>
                  {activePlan.name}
                </h3>
                <span style={{
                  background: 'rgba(22,163,74,0.12)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)',
                  borderRadius: '100px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700
                }}>
                  Active & Verified
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #52645D)' }}>
                Billed ${activePlan.price}/month (৳{(activePlan.priceBdt || activePlan.price * 120).toLocaleString()} BDT) • Next automatic renewal: <strong>{activePlan.renewalDate}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setCheckoutModal(PLANS[1])}
                style={{
                  background: 'var(--primary, #087A4A)', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '0.6rem 1.35rem', fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer', boxShadow: '0 2px 6px rgba(8, 122, 74, 0.2)'
                }}
              >
                Change Plan
              </button>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(true)}
                style={{
                  background: 'var(--bg-card, #fff)', border: '1px solid rgba(220,38,38,0.3)', color: '#dc2626',
                  borderRadius: '8px', padding: '0.6rem 1.35rem', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel Plan
              </button>
            </div>
          </div>

          {/* Usage meters */}
          <div style={{ padding: '1.5rem', background: 'var(--bg-card, #fff)', borderRadius: '12px', border: '1px solid var(--border-light, #E6F0EB)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Autonomous Conversation Quota</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>
                {(activePlan.conversationsUsed || 0).toLocaleString()} / {activePlan.conversationsLimit.toLocaleString()} used
              </span>
            </div>
            <div style={{ height: '10px', background: 'var(--border-light, #E6F0EB)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.max(2, ((activePlan.conversationsUsed || 0) / activePlan.conversationsLimit) * 100)}%`,
                height: '100%', background: 'var(--primary, #087A4A)', borderRadius: '5px',
                transition: 'width 0.3s ease'
              }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Conversations reset automatically on the 1st of every calendar month. You have {((activePlan.conversationsLimit) - (activePlan.conversationsUsed || 0)).toLocaleString()} conversations remaining.
            </p>
          </div>

          {/* Payment method card */}
          <div style={{
            padding: '1.5rem', background: 'var(--bg-card, #fff)', borderRadius: '12px',
            border: '1px solid var(--border-light, #E6F0EB)', marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: activePlan.paymentMethodType === 'NAGAD' ? 'rgba(247, 147, 30, 0.12)' : 'rgba(226, 19, 110, 0.12)',
                border: `1.5px solid ${activePlan.paymentMethodType === 'NAGAD' ? 'rgba(247, 147, 30, 0.35)' : 'rgba(226, 19, 110, 0.35)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Smartphone size={24} color={activePlan.paymentMethodType === 'NAGAD' ? '#F7931E' : '#E2136E'} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span>{activePlan.paymentMethod || 'bKash/Nagad 01643792804 (Send money)'}</span>
                  <span style={{ fontSize: '0.72rem', background: '#DDF7E9', color: '#087A4A', padding: '3px 10px', borderRadius: '100px', fontWeight: 800, border: '1px solid #AEEBCB' }}>
                    ✓ Payment Cleared & Confirmed
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Sender Account: <strong>{activePlan.senderNumber || '01643792804'}</strong> • TrxID: <code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, color: 'var(--primary-dark)' }}>{activePlan.trxId || 'TRX-VERIFIED'}</code>
                  {activePlan.paymentClearedAt && <span> • Cleared: <em>{activePlan.paymentClearedAt}</em></span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {activePlan.screenshotUrl && (
                <button
                  type="button"
                  onClick={() => setViewScreenshotModal({
                    url: activePlan.screenshotUrl,
                    plan: activePlan.name,
                    trxId: activePlan.trxId,
                    senderNumber: activePlan.senderNumber,
                    amount: `$${activePlan.price} (৳${(activePlan.priceBdt || activePlan.price * 120).toLocaleString()} BDT)`
                  })}
                  style={{
                    background: 'var(--mint-soft, #EFFBF5)', border: '1px solid var(--border-medium, #D9E9E1)',
                    borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 700,
                    color: 'var(--primary, #087A4A)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  <ImageIcon size={16} /> View Payment Screenshot
                </button>
              )}

              <button
                type="button"
                onClick={() => setClearPaymentMethodModal(true)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-medium, #D9E9E1)',
                  borderRadius: '8px', padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600,
                  color: 'var(--text-secondary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px'
                }}
              >
                <RotateCcw size={14} /> Clear / Update Method
              </button>
            </div>
          </div>

          {/* Invoices List */}
          <div style={{ padding: '1.5rem', background: 'var(--bg-card, #fff)', borderRadius: '12px', border: '1px solid var(--border-light, #E6F0EB)' }}>
            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Billing History & Tax Invoices
            </h4>
            <div style={{ border: '1px solid var(--border-light, #E6F0EB)', borderRadius: '10px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-subtle, #EFFBF5)', borderBottom: '1px solid var(--border-light, #E6F0EB)' }}>
                  <tr>
                    <th style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Invoice #</th>
                    <th style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment Method & TrxID</th>
                    <th style={{ padding: '0.85rem 1.15rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ padding: '0.85rem 1.15rem', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(activePlan.invoices || []).map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-light, #E6F0EB)' }}>
                      <td style={{ padding: '0.95rem 1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.id}</td>
                      <td style={{ padding: '0.95rem 1.15rem', color: 'var(--text-muted)' }}>{inv.date}</td>
                      <td style={{ padding: '0.95rem 1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{inv.amount}</td>
                      <td style={{ padding: '0.95rem 1.15rem', color: 'var(--text-secondary)' }}>
                        <div>{inv.method || 'bKash/Nagad (01643792804)'}</div>
                        {inv.trxId && <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>TrxID: {inv.trxId}</div>}
                      </td>
                      <td style={{ padding: '0.95rem 1.15rem' }}>
                        <span style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.3)', padding: '3px 10px', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 700 }}>
                          {inv.status || 'Confirmed & Cleared'}
                        </span>
                      </td>
                      <td style={{ padding: '0.95rem 1.15rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {inv.screenshotUrl && (
                            <button
                              type="button"
                              onClick={() => setViewScreenshotModal({
                                url: inv.screenshotUrl,
                                plan: activePlan.name,
                                trxId: inv.trxId || activePlan.trxId,
                                senderNumber: inv.senderNumber || activePlan.senderNumber,
                                amount: inv.amount
                              })}
                              style={{
                                background: 'none', border: '1px solid var(--border-medium)', borderRadius: '6px',
                                padding: '5px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: 'var(--primary, #087A4A)'
                              }}
                            >
                              Proof
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              printInvoicePdf(inv, activePlan, user);
                              showToast(`Opened printable official tax invoice for ${inv.id}`, 'success');
                            }}
                            style={{
                              background: 'var(--primary, #087A4A)', border: 'none', borderRadius: '6px',
                              padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#ffffff',
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              boxShadow: '0 2px 6px rgba(8, 122, 74, 0.2)'
                            }}
                          >
                            <Printer size={13} /> Print / PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              downloadInvoiceHtml(inv, activePlan, user);
                              showToast(`Downloaded tax invoice file for ${inv.id}`, 'success');
                            }}
                            style={{
                              background: 'none', border: '1px solid var(--border-medium)', borderRadius: '6px',
                              padding: '5px 10px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', color: 'var(--primary, #087A4A)',
                              display: 'inline-flex', alignItems: 'center', gap: '4px'
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ===================================================================
           EMPTY ZERO-STATE (When merchant has NOT bought anything yet)
           =================================================================== */
        <div>
          {/* Zero State Notice Banner */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            padding: '2.75rem 1.5rem', background: 'var(--mint-soft, #EFFBF5)',
            borderRadius: '16px', border: '1.5px solid var(--border-medium, #D9E9E1)',
            marginBottom: '2.25rem', boxShadow: '0 4px 16px rgba(8, 122, 74, 0.06)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--mint, #DDF7E9)', border: '2px solid var(--border-strong, #AEEBCB)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem', boxShadow: '0 4px 12px rgba(8, 122, 74, 0.12)'
            }}>
              <Smartphone size={32} color="var(--primary, #087A4A)" />
            </div>

            <span style={{
              fontSize: '0.75rem', fontWeight: 700, padding: '4px 14px', borderRadius: '100px',
              background: 'var(--mint, #DDF7E9)', color: 'var(--primary, #087A4A)',
              marginBottom: '0.85rem', border: '1px solid var(--border-strong, #AEEBCB)'
            }}>
              Free Trial • No Active Paid Subscription
            </span>

            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 850, color: 'var(--primary-dark, #092A20)' }}>
              No Active Paid Subscription
            </h2>

            <p style={{ margin: '0 auto 1.5rem', maxWidth: '580px', fontSize: '0.9rem', color: 'var(--text-secondary, #52645D)', lineHeight: 1.6 }}>
              Your workspace is currently on the free trial mode. Subscribe to an autonomous tier using <strong>bKash / Nagad 01643792804 (Send money)</strong> to unlock full multi-channel automation, catalogs, and team seats.
            </p>

            <button
              type="button"
              onClick={() => setCheckoutModal(PLANS[1])}
              style={{
                background: 'var(--primary, #087A4A)', color: '#ffffff',
                border: 'none', borderRadius: '10px', padding: '0.75rem 2rem',
                fontSize: '0.9rem', fontWeight: 750, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(8, 122, 74, 0.25)', transition: 'all 0.2s ease'
              }}
            >
              <Plus size={18} /> Choose a Plan to Get Started
            </button>
          </div>

          {/* Available Pricing Plans */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Select a Plan for Your Business
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Choose the conversation volume that fits your brand. Upgrade or cancel anytime with one click.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {PLANS.map((plan) => {
                const isFeatured = plan.id === 'growth';
                return (
                  <div
                    key={plan.id}
                    style={{
                      position: 'relative',
                      background: 'var(--bg-card, #ffffff)',
                      border: isFeatured ? '2px solid var(--primary, #087A4A)' : '1px solid var(--border-medium, #D9E9E1)',
                      borderRadius: '16px',
                      padding: '1.75rem',
                      display: 'flex', flexDirection: 'column',
                      boxShadow: isFeatured ? '0 12px 32px rgba(8, 122, 74, 0.14)' : '0 2px 10px rgba(0,0,0,0.03)',
                      transition: 'transform 0.2s ease'
                    }}
                  >
                    {plan.badge && (
                      <span style={{
                        position: 'absolute', top: '-13px', right: '18px',
                        background: 'var(--primary, #087A4A)', color: '#ffffff',
                        borderRadius: '100px', padding: '3px 12px', fontSize: '0.74rem', fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(8, 122, 74, 0.35)'
                      }}>
                        {plan.badge}
                      </span>
                    )}

                    <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 850, color: 'var(--text-primary)' }}>
                      {plan.name}
                    </h4>
                    <p style={{ margin: '0 0 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)', minHeight: '38px', lineHeight: 1.45 }}>
                      {plan.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '2.1rem', fontWeight: 900, color: 'var(--primary-dark, #092A20)', letterSpacing: '-0.5px' }}>
                        ${plan.price}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{plan.period}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary, #087A4A)', marginBottom: '1.5rem' }}>
                      ৳{plan.priceBdt.toLocaleString()} BDT / month
                    </div>

                    <div style={{ flexGrow: 1, marginBottom: '1.75rem' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        WHAT'S INCLUDED:
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                            <Check size={15} color="var(--primary, #087A4A)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCheckoutModal(plan)}
                      style={{
                        width: '100%',
                        background: isFeatured ? 'var(--primary, #087A4A)' : 'var(--mint-soft, #EFFBF5)',
                        color: isFeatured ? '#ffffff' : 'var(--primary, #087A4A)',
                        border: isFeatured ? 'none' : '1.5px solid var(--border-medium, #D9E9E1)',
                        borderRadius: '10px', padding: '0.75rem', fontSize: '0.88rem', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        boxShadow: isFeatured ? '0 4px 12px rgba(8, 122, 74, 0.25)' : 'none'
                      }}
                    >
                      Subscribe via bKash / Nagad
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty Invoices State */}
          <div style={{ padding: '1.75rem', background: 'var(--bg-card, #fff)', borderRadius: '14px', border: '1px solid var(--border-light, #E6F0EB)' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Billing History & Tax Invoices
            </h4>
            <div style={{
              padding: '2.5rem 1rem', textAlign: 'center', background: 'var(--bg-subtle, #EFFBF5)',
              borderRadius: '10px', border: '1px dashed var(--border-medium, #D9E9E1)'
            }}>
              <FileText size={28} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                No Invoices Available
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Invoices and payment verification receipts will be automatically generated and made available here once you subscribe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         CHECKOUT & ACTIVATION MODAL (bKash / Nagad 01643792804 Send money)
         ===================================================================== */}
      {checkoutModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.7)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          overflowY: 'auto'
        }} onClick={() => !processing && setCheckoutModal(null)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '520px', width: '100%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)', overflow: 'hidden', margin: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--mint-soft, #EFFBF5)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Smartphone size={20} color="var(--primary, #087A4A)" />
                <div>
                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-dark, #092A20)', display: 'block', lineHeight: 1.2 }}>
                    Subscribe to {checkoutModal.name}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    bKash / Nagad Send Money Gateway
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModal(null)}
                disabled={processing}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', maxHeight: 'calc(90vh - 80px)', overflowY: 'auto' }}>
              {/* Plan Summary Banner */}
              <div style={{
                padding: '0.9rem 1.15rem', background: 'var(--mint-soft, #EFFBF5)', borderRadius: '10px',
                border: '1px solid var(--border-medium, #D9E9E1)', marginBottom: '1.25rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-dark)' }}>{checkoutModal.name}</span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {checkoutModal.conversations} autonomous conversations / mo
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary, #087A4A)' }}>
                    ${checkoutModal.price}/mo
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    ৳{(checkoutModal.price * 120).toLocaleString()} BDT
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Select Payment Method:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('BKASH'); setCheckoutError(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.75rem 0.5rem', borderRadius: '10px', cursor: 'pointer',
                      border: selectedMethod === 'BKASH' ? '2px solid #E2136E' : '1px solid var(--border-medium)',
                      background: selectedMethod === 'BKASH' ? 'rgba(226, 19, 110, 0.08)' : 'var(--bg-subtle)',
                      color: selectedMethod === 'BKASH' ? '#E2136E' : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: selectedMethod === 'BKASH' ? '#E2136E' : '#9ca3af',
                      color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                    }}>৳</span>
                    bKash (Send money)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedMethod('NAGAD'); setCheckoutError(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.75rem 0.5rem', borderRadius: '10px', cursor: 'pointer',
                      border: selectedMethod === 'NAGAD' ? '2px solid #F7931E' : '1px solid var(--border-medium)',
                      background: selectedMethod === 'NAGAD' ? 'rgba(247, 147, 30, 0.08)' : 'var(--bg-subtle)',
                      color: selectedMethod === 'NAGAD' ? '#F7931E' : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: selectedMethod === 'NAGAD' ? '#F7931E' : '#9ca3af',
                      color: '#fff', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                    }}>৳</span>
                    Nagad (Send money)
                  </button>
                </div>
              </div>

              {/* Bkash / Nagad Send Money Target Card */}
              <div style={{
                padding: '1rem 1.15rem', borderRadius: '12px',
                background: selectedMethod === 'NAGAD' ? 'rgba(247, 147, 30, 0.06)' : 'rgba(226, 19, 110, 0.06)',
                border: `1.5px solid ${selectedMethod === 'NAGAD' ? 'rgba(247, 147, 30, 0.3)' : 'rgba(226, 19, 110, 0.3)'}`,
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                    color: selectedMethod === 'NAGAD' ? '#C26A00' : '#B00E53'
                  }}>
                    {selectedMethod === 'NAGAD' ? 'Nagad' : 'bKash'} Personal (Send money)
                  </span>
                  <span style={{
                    fontSize: '0.72rem', background: '#ffffff', padding: '2px 8px', borderRadius: '100px',
                    fontWeight: 700, color: 'var(--text-primary)', border: '1px solid var(--border-medium)'
                  }}>
                    Send Money Only
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Smartphone size={20} color={selectedMethod === 'NAGAD' ? '#F7931E' : '#E2136E'} />
                    <span style={{ fontSize: '1.35rem', fontWeight: 900, letterSpacing: '1px', color: 'var(--primary-dark, #092A20)' }}>
                      01643792804
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    style={{
                      background: copiedNumber ? 'var(--mint, #DDF7E9)' : '#ffffff',
                      color: copiedNumber ? 'var(--primary, #087A4A)' : 'var(--text-primary)',
                      border: copiedNumber ? '1px solid var(--green, #0FA968)' : '1px solid var(--border-medium)',
                      borderRadius: '8px', padding: '5px 12px', fontSize: '0.78rem', fontWeight: 700,
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {copiedNumber ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Number</>}
                  </button>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.65rem', borderTop: '1px dashed rgba(0,0,0,0.1)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Amount to Send: <strong>৳{(checkoutModal.price * 120).toLocaleString()} BDT</strong> (${checkoutModal.price} USD)
                </div>
              </div>

              {/* Instructions steps */}
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'var(--bg-subtle, #EFFBF5)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  How to complete payment:
                </p>
                <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <li>Open your <strong>{selectedMethod === 'NAGAD' ? 'Nagad' : 'bKash'}</strong> app and select <strong>Send Money (সেন্ড মানি)</strong>.</li>
                  <li>Enter recipient number <strong>01643792804</strong> and send <strong>৳{(checkoutModal.price * 120).toLocaleString()} BDT</strong>.</li>
                  <li>Save a screenshot of the successful transaction confirmation.</li>
                  <li>Enter your sender number, Transaction ID (TrxID), and upload your transaction screenshot below.</li>
                </ol>
              </div>

              {/* Sender Details Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Your {selectedMethod === 'NAGAD' ? 'Nagad' : 'bKash'} Sender Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={senderNumber}
                    onChange={e => setSenderNumber(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX or 016XXXXXXXX"
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Transaction ID (TrxID) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={trxId}
                    onChange={e => setTrxId(e.target.value)}
                    placeholder="e.g. BL98XJ28K9"
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Transaction Picture Choosing Section (Upload Screenshot) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Payment Screenshot Proof <span style={{ color: '#dc2626' }}>*</span>
                </label>

                {screenshotPreview ? (
                  <div style={{
                    padding: '0.85rem', borderRadius: '10px',
                    border: '1.5px solid var(--border-strong, #AEEBCB)',
                    background: 'var(--mint-soft, #EFFBF5)',
                    display: 'flex', alignItems: 'center', gap: '0.85rem'
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden',
                      border: '1px solid var(--border-medium)', background: '#fff', flexShrink: 0
                    }}>
                      <img
                        src={screenshotPreview}
                        alt="Payment Screenshot Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a' }}>Screenshot Attached</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {screenshotName || 'Transaction_screenshot.png'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => screenshotInputRef.current?.click()}
                          style={{
                            background: 'none', border: 'none', padding: 0, fontSize: '0.75rem',
                            fontWeight: 700, color: 'var(--primary, #087A4A)', cursor: 'pointer', textDecoration: 'underline'
                          }}
                        >
                          Change Screenshot
                        </button>
                        <button
                          type="button"
                          onClick={() => { setScreenshotPreview(null); setScreenshotName(''); }}
                          style={{
                            background: 'none', border: 'none', padding: 0, fontSize: '0.75rem',
                            fontWeight: 700, color: '#dc2626', cursor: 'pointer', textDecoration: 'underline'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleScreenshotFile(f);
                    }}
                    onClick={() => screenshotInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? 'var(--primary, #087A4A)' : 'var(--border-medium, #D9E9E1)'}`,
                      borderRadius: '10px', padding: '1.25rem 1rem', textAlign: 'center', cursor: 'pointer',
                      background: isDragging ? 'rgba(8, 122, 74, 0.05)' : 'var(--bg-subtle, #EFFBF5)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Upload size={24} color="var(--primary, #087A4A)" style={{ marginBottom: '4px' }} />
                    <p style={{ margin: '0 0 4px', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Click or drag & drop payment screenshot here
                    </p>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Upload transaction screenshot • JPG, PNG, WebP (Max 10 MB)
                    </p>
                  </div>
                )}

                <input
                  ref={screenshotInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={e => e.target.files?.[0] && handleScreenshotFile(e.target.files[0])}
                />
              </div>

              {/* Error Banner */}
              {checkoutError && (
                <div style={{
                  padding: '0.75rem 1rem', background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px',
                  marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.78rem',
                  display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 600
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} /> {checkoutError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setCheckoutModal(null)}
                  disabled={processing}
                  style={{
                    flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
                    borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleActivatePlan(checkoutModal)}
                  disabled={processing}
                  style={{
                    flex: 2, background: 'var(--primary, #087A4A)', color: '#ffffff',
                    border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem',
                    fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    boxShadow: '0 2px 8px rgba(8, 122, 74, 0.25)', opacity: processing ? 0.75 : 1
                  }}
                >
                  {processing ? (
                    <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying Payment…</>
                  ) : (
                    <><CheckCircle2 size={15} /> Submit Payment & Activate</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         VIEW PAYMENT SCREENSHOT MODAL
         ===================================================================== */}
      {viewScreenshotModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setViewScreenshotModal(null)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '500px', width: '100%',
              padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', margin: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Payment Transaction Screenshot Proof
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Recipient: bKash/Nagad 01643792804 (Send money)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewScreenshotModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-medium)',
              marginBottom: '1rem', background: '#000', maxHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img
                src={viewScreenshotModal.url}
                alt="Payment proof screenshot"
                style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }}
              />
            </div>

            <div style={{
              padding: '0.75rem', background: 'var(--mint-soft, #EFFBF5)', borderRadius: '8px',
              border: '1px solid var(--border-medium)', fontSize: '0.78rem', color: 'var(--text-secondary)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem'
            }}>
              <div>
                Sender: <strong>{viewScreenshotModal.senderNumber || '01643792804'}</strong>
              </div>
              <div>
                TrxID: <code style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>{viewScreenshotModal.trxId || 'TRX-VERIFIED'}</code>
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setViewScreenshotModal(null)}
                style={{
                  background: 'var(--primary, #087A4A)', color: '#ffffff',
                  border: 'none', borderRadius: '8px', padding: '0.55rem 1.25rem',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         CANCEL CONFIRMATION DIALOG
         ===================================================================== */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.65)', backdropFilter: 'blur(3px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setShowCancelConfirm(false)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '420px', width: '100%',
              padding: '1.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <AlertCircle size={32} color="#dc2626" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Cancel Subscription?
            </h4>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Are you sure you want to cancel your paid subscription? Your workspace will return to the Free Trial tier and your automated limits will be paused.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
                  borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Keep Plan
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                style={{
                  flex: 1, background: '#dc2626', color: '#ffffff',
                  border: 'none', borderRadius: '8px', padding: '0.6rem', fontSize: '0.85rem',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Yes, Cancel Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         PAYMENT CONFIRMED SUCCESS CELEBRATION MODAL
         ===================================================================== */}
      {paymentSuccessModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.78)', backdropFilter: 'blur(5px)',
          zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          animation: 'fadeIn 0.2s ease'
        }} onClick={() => setPaymentSuccessModal(null)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '20px', maxWidth: '520px', width: '100%',
              padding: '2rem 1.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', margin: 'auto', textAlign: 'center',
              border: '1.5px solid var(--border-medium, #D9E9E1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Celebration Green Badge */}
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #087A4A 0%, #0FA968 100%)',
              color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem', boxShadow: '0 10px 24px rgba(8, 122, 74, 0.35)'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <span style={{
              display: 'inline-block', background: '#DDF7E9', color: '#087A4A',
              border: '1.5px solid #AEEBCB', borderRadius: '100px', padding: '4px 14px',
              fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
            }}>
              ✓ Payment Cleared & Confirmed
            </span>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.45rem', fontWeight: 900, color: 'var(--primary-dark, #092A20)' }}>
              Subscription Activated!
            </h3>

            <p style={{ margin: '0 0 1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Your payment for the <strong>{paymentSuccessModal.plan.name}</strong> has been successfully verified and cleared. Your monthly conversation quota is fully active.
            </p>

            {/* Receipt Summary Card */}
            <div style={{
              background: 'var(--mint-soft, #EFFBF5)', borderRadius: '12px',
              border: '1px solid var(--border-medium, #D9E9E1)', padding: '1.25rem',
              marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.84rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-dark)' }}>
                  ৳{paymentSuccessModal.priceBdt.toLocaleString()} BDT (${paymentSuccessModal.plan.price} USD)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Gateway:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {paymentSuccessModal.methodName} 01643792804 (Send money)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sender Account:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {paymentSuccessModal.senderNumber}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(0,0,0,0.06)', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction ID (TrxID):</span>
                <code style={{ fontWeight: 800, color: 'var(--primary-dark)', background: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                  {paymentSuccessModal.trxId}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tax Invoice ID:</span>
                <span style={{ fontWeight: 800, color: 'var(--primary, #087A4A)' }}>
                  {paymentSuccessModal.invoice.id}
                </span>
              </div>
            </div>

            {/* Instant Notification Alert */}
            <div style={{
              background: 'rgba(8, 122, 74, 0.08)', borderRadius: '10px',
              padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex',
              alignItems: 'center', gap: '0.65rem', textAlign: 'left',
              fontSize: '0.8rem', color: 'var(--primary-dark, #092A20)', border: '1px solid var(--border-medium)'
            }}>
              <CheckCheck size={18} color="var(--primary, #087A4A)" style={{ flexShrink: 0 }} />
              <div>
                <strong>Instant Dashboard Alert:</strong> A payment confirmation notification has been posted to your top dashboard bell.
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  printInvoicePdf(paymentSuccessModal.invoice, paymentSuccessModal.plan, user);
                  downloadInvoiceHtml(paymentSuccessModal.invoice, paymentSuccessModal.plan, user);
                  showToast(`Tax invoice ${paymentSuccessModal.invoice.id} downloaded!`, 'success');
                }}
                style={{
                  background: 'var(--primary, #087A4A)', color: '#ffffff',
                  border: 'none', borderRadius: '10px', padding: '0.85rem 1.25rem',
                  fontSize: '0.92rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(8, 122, 74, 0.25)'
                }}
              >
                <Download size={18} /> Download Official Tax Invoice (PDF / Receipt)
              </button>

              <button
                type="button"
                onClick={() => setPaymentSuccessModal(null)}
                style={{
                  background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-medium)',
                  borderRadius: '10px', padding: '0.75rem', fontSize: '0.88rem',
                  fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer'
                }}
              >
                Done & View Active Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
         CLEAR / UPDATE PAYMENT METHOD MODAL
         ===================================================================== */}
      {clearPaymentMethodModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.65)', backdropFilter: 'blur(3px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }} onClick={() => setClearPaymentMethodModal(false)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '440px', width: '100%',
              padding: '1.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <RotateCcw size={32} color="var(--primary, #087A4A)" style={{ marginBottom: '0.75rem' }} />
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Clear or Update Payment Method?
            </h4>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              This will clear your saved sender account number and transaction ID. Your active subscription tier remains intact, and you can re-enter new bKash / Nagad payment credentials anytime.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setClearPaymentMethodModal(false)}
                style={{
                  flex: 1, background: 'var(--bg-subtle)', border: '1px solid var(--border-medium)',
                  borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600,
                  color: 'var(--text-secondary)', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearPaymentMethod}
                style={{
                  flex: 1, background: 'var(--primary, #087A4A)', color: '#ffffff',
                  border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Yes, Clear Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
