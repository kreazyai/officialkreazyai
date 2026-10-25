import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Smartphone, CheckCircle2, AlertCircle, Loader2, X,
  FileText, Download, Printer, Copy, Check, Upload,
  Image as ImageIcon, RefreshCw, ChevronRight, Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { billingService } from '../../services/api';
import { downloadInvoicePdf, printInvoicePdf } from '../../services/invoiceService';
import { addDashboardNotification } from '../../services/notificationStore';

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { border: '#16a34a', color: '#16a34a', icon: <CheckCircle2 size={16} /> },
    error: { border: '#dc2626', color: '#dc2626', icon: <AlertCircle size={16} /> },
    info: { border: '#087A4A', color: '#087A4A', icon: <CheckCircle2 size={16} /> },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-medium, #E2E8F0)',
      borderLeft: `4px solid ${c.border}`, borderRadius: '10px',
      padding: '0.85rem 1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      minWidth: '260px', maxWidth: '400px'
    }}>
      <span style={{ color: c.color, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary, #092A20)', flexGrow: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #6B7280)', padding: 0 }}>
        <X size={14} />
      </button>
    </div>
  );
}

export function BillingPage({ user }) {
  const { updateUser } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authoritative 4-section billing state
  const [billingData, setBillingData] = useState({
    plan: {
      id: 'growth',
      name: 'Growth Plan',
      status: 'Active',
      isActive: true,
      amount: 119,
      currency: 'USD',
      formattedPrice: '$119 / month',
      priceBdt: 14280,
      nextPayment: 'November 12, 2026',
      canCancel: true
    },
    conversations: {
      used: 0,
      limit: 5000,
      remaining: 5000,
      resetDate: 'the 1st of each month',
      resetText: 'Resets on the 1st of each month.'
    },
    paymentMethod: {
      provider: 'bKash',
      accountNumber: '016****2804',
      rawAccount: '01643792804',
      verificationStatus: 'Confirmed',
      isVerified: true,
      receiptDetails: null
    },
    invoices: []
  });

  // Modals state
  const [changePlanModal, setChangePlanModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);
  const [updateMethodModal, setUpdateMethodModal] = useState(false);

  // Form states for checkout / payment
  const [checkoutMethod, setCheckoutMethod] = useState('BKASH');
  const [senderNumberInput, setSenderNumberInput] = useState('');
  const [trxIdInput, setTrxIdInput] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [cancellingPlan, setCancellingPlan] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const screenshotInputRef = useRef(null);

  // Method update inputs
  const [updateProviderInput, setUpdateProviderInput] = useState('bKash');
  const [updateSenderInput, setUpdateSenderInput] = useState('');
  const [updatingMethod, setUpdatingMethod] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const PLANS = [
    {
      id: 'starter',
      name: 'Starter Plan',
      price: 49,
      priceBdt: 5880,
      conversations: '1,000',
      conversationsNum: 1000,
      badge: null
    },
    {
      id: 'growth',
      name: 'Growth Plan',
      price: 119,
      priceBdt: 14280,
      conversations: '5,000',
      conversationsNum: 5000,
      badge: 'Most Popular'
    },
    {
      id: 'scale',
      name: 'Scale Plan',
      price: 299,
      priceBdt: 35880,
      conversations: '25,000',
      conversationsNum: 25000,
      badge: 'High Volume'
    }
  ];

  // Fetch billing data from backend API
  const loadBillingDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await billingService.getBillingDetails();
      const payload = res?.data || res;
      if (payload && payload.plan) {
        setBillingData(payload);
      }
    } catch (err) {
      console.warn('[BILLING] API fetch fallback to local storage:', err);
      // Fallback gracefully from localStorage
      try {
        const stored = localStorage.getItem('kreazy_user_subscription');
        if (stored) {
          const parsed = JSON.parse(stored);
          setBillingData(prev => ({
            ...prev,
            plan: {
              ...prev.plan,
              name: parsed.name || prev.plan.name,
              amount: parsed.price || prev.plan.amount,
              formattedPrice: `$${parsed.price || 119} / month`,
              nextPayment: parsed.renewalDate || prev.plan.nextPayment,
              status: 'Active',
              isActive: true
            },
            conversations: {
              ...prev.conversations,
              used: parsed.conversationsUsed || 0,
              limit: parsed.conversationsLimit || 5000,
              remaining: (parsed.conversationsLimit || 5000) - (parsed.conversationsUsed || 0)
            },
            paymentMethod: {
              ...prev.paymentMethod,
              provider: parsed.paymentMethodType === 'NAGAD' ? 'Nagad' : 'bKash',
              accountNumber: parsed.senderNumber ? `${parsed.senderNumber.slice(0, 3)}****${parsed.senderNumber.slice(-4)}` : prev.paymentMethod.accountNumber,
              verificationStatus: parsed.paymentCleared ? 'Confirmed' : 'Pending',
              isVerified: Boolean(parsed.paymentCleared),
              receiptDetails: {
                invoiceId: parsed.invoices?.[0]?.id || 'INV-2026-001',
                planName: parsed.name,
                amount: `$${parsed.price}.00`,
                provider: parsed.paymentMethodType === 'NAGAD' ? 'Nagad' : 'bKash',
                senderNumber: parsed.senderNumber || '01643792804',
                trxId: parsed.trxId || 'BL98XJ28K9',
                screenshotUrl: parsed.screenshotUrl || null,
                date: parsed.renewalDate || 'October 12, 2026'
              }
            },
            invoices: parsed.invoices || prev.invoices
          }));
        }
      } catch (e) {
        setError('Failed to load billing details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingDetails();
  }, [loadBillingDetails]);

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

  // Submit payment & plan activation
  const handleSubmitPayment = async (plan) => {
    setCheckoutError('');
    if (!senderNumberInput.trim()) {
      setCheckoutError('Please enter your sender bKash/Nagad phone number.');
      return;
    }
    if (!trxIdInput.trim()) {
      setCheckoutError('Please enter the Transaction ID (TrxID) received from Send Money.');
      return;
    }

    try {
      setSubmittingPayment(true);
      const res = await billingService.submitPayment({
        planId: plan.id,
        provider: checkoutMethod === 'NAGAD' ? 'Nagad' : 'bKash',
        senderNumber: senderNumberInput.trim(),
        trxId: trxIdInput.trim().toUpperCase(),
        screenshotUrl: screenshotPreview
      });

      const data = res?.data || res;

      // Add dashboard notification
      addDashboardNotification({
        title: '📋 Payment Submitted for Verification',
        desc: `Your payment reference for ${plan.name} has been received and is pending verification.`,
        type: 'payment',
        time: 'Just now',
        link: '/dashboard/billing'
      });

      showToast(`Payment submitted successfully. Your invoice is pending review.`, 'info');

      // Reset form
      setSenderNumberInput('');
      setTrxIdInput('');
      setScreenshotPreview(null);
      setScreenshotName('');
      setSelectedPlanForCheckout(null);
      setChangePlanModal(false);

      // Reload backend data
      await loadBillingDetails();
    } catch (err) {
      console.error('[BILLING] Payment submission failed:', err);
      setCheckoutError(err.message || 'Failed to submit payment. Please verify transaction details.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Cancel subscription
  const handleCancelPlan = async () => {
    try {
      setCancellingPlan(true);
      await billingService.cancelPlan();

      if (updateUser) {
        updateUser({
          isSubscribed: false,
          plan: 'Free Trial',
          subscriptionStatus: 'inactive'
        });
      }

      showToast('Your subscription has been cancelled. Your account is on Free Trial.', 'info');
      setShowCancelConfirm(false);
      await loadBillingDetails();
    } catch (err) {
      console.error('[BILLING] Cancel plan failed:', err);
      showToast('Failed to cancel plan. Please try again.', 'error');
    } finally {
      setCancellingPlan(false);
    }
  };

  // Update payment method
  const handleUpdateMethod = async () => {
    if (!updateSenderInput.trim()) {
      showToast('Please enter a sender phone number.', 'error');
      return;
    }
    try {
      setUpdatingMethod(true);
      await billingService.updatePaymentMethod({
        provider: updateProviderInput,
        senderNumber: updateSenderInput.trim()
      });
      showToast('Payment method updated successfully.', 'success');
      setUpdateMethodModal(false);
      setUpdateSenderInput('');
      await loadBillingDetails();
    } catch (err) {
      console.error('[BILLING] Update method failed:', err);
      showToast('Failed to update payment method.', 'error');
    } finally {
      setUpdatingMethod(false);
    }
  };

  // Helper for progress percentage
  const convUsed = billingData.conversations.used || 0;
  const convLimit = billingData.conversations.limit || 5000;
  const progressPercent = Math.min(100, Math.max(2, (convUsed / convLimit) * 100));

  return (
    <div className="billing-page-wrapper">
      {/* Page Header */}
      <div className="billing-page-header">
        <h1 className="billing-page-title">Billing & Pricing</h1>
        <p className="billing-page-subtitle">
          Manage your subscription tier, monthly conversation quota, and payment details.
        </p>
      </div>

      {loading && (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '0.88rem' }}>Loading billing details…</p>
        </div>
      )}

      {error && !loading && (
        <div style={{
          padding: '0.9rem 1.25rem', background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.25)', borderRadius: '12px',
          marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadBillingDetails}
            style={{
              background: 'none', border: '1px solid #dc2626', borderRadius: '6px',
              padding: '4px 10px', fontSize: '0.78rem', color: '#dc2626', cursor: 'pointer', fontWeight: 700
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && (
        <>
          {/* =================================================================
              SECTION 1 — YOUR PLAN
              ================================================================= */}
          <div className="billing-card" id="section-your-plan">
            <div className="billing-card-header">
              <h2 className="billing-card-title">Your Plan</h2>
              <span className={`billing-status-badge ${billingData.plan.isActive ? 'active' : 'inactive'}`}>
                {billingData.plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="billing-plan-details-grid">
              <div className="billing-detail-col">
                <span className="billing-detail-label">Your Plan</span>
                <span className="billing-detail-val">{billingData.plan.name}</span>
              </div>

              <div className="billing-detail-col">
                <span className="billing-detail-label">Monthly Price</span>
                <span className="billing-price-val">{billingData.plan.formattedPrice}</span>
              </div>

              <div className="billing-detail-col">
                <span className="billing-detail-label">Next Payment</span>
                <span className="billing-detail-val">{billingData.plan.nextPayment}</span>
              </div>
            </div>

            <div className="billing-plan-actions">
              <button
                type="button"
                className="btn-billing-primary"
                onClick={() => setChangePlanModal(true)}
              >
                Change Plan
              </button>
              {billingData.plan.isActive && (
                <button
                  type="button"
                  className="btn-billing-danger"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Cancel Plan
                </button>
              )}
            </div>
          </div>

          {/* =================================================================
              SECTION 2 — MONTHLY AI CONVERSATIONS
              ================================================================= */}
          <div className="billing-card" id="section-conversations">
            <div className="billing-card-header">
              <h2 className="billing-card-title">Monthly AI Conversations</h2>
            </div>

            <div className="billing-quota-numbers">
              <span className="billing-quota-used">
                {convUsed.toLocaleString()} / {convLimit.toLocaleString()} used
              </span>
              <span className="billing-quota-remaining">
                {(billingData.conversations.remaining || (convLimit - convUsed)).toLocaleString()} conversations left
              </span>
            </div>

            <div className="billing-progress-track">
              <div
                className="billing-progress-bar"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="billing-quota-reset">
              {billingData.conversations.resetText || `Resets on ${billingData.conversations.resetDate}.`}
            </p>
          </div>

          {/* =================================================================
              SECTION 3 — PAYMENT METHOD
              ================================================================= */}
          <div className="billing-card" id="section-payment-method">
            <div className="billing-card-header">
              <h2 className="billing-card-title">Payment Method</h2>
            </div>

            <div className="billing-method-body">
              <div className="billing-method-info">
                <div className={`billing-method-icon-pill ${billingData.paymentMethod.provider?.toLowerCase() === 'nagad' ? 'nagad' : 'bkash'}`}>
                  ৳
                </div>
                <div className="billing-method-text">
                  <div className="billing-method-name-row">
                    <span className="billing-method-provider">{billingData.paymentMethod.provider}</span>
                    <span className={`billing-status-badge ${billingData.paymentMethod.verificationStatus.toLowerCase()}`}>
                      {billingData.paymentMethod.verificationStatus}
                    </span>
                  </div>
                  {billingData.paymentMethod.accountNumber ? (
                    <span className="billing-method-account">{billingData.paymentMethod.accountNumber}</span>
                  ) : (
                    <span className="billing-method-account">No account linked</span>
                  )}
                </div>
              </div>

              <div className="billing-method-actions">
                <button
                  type="button"
                  className="btn-billing-secondary"
                  onClick={() => {
                    const latest = billingData.paymentMethod.receiptDetails || billingData.invoices[0];
                    if (latest) {
                      setViewReceiptModal(latest);
                    } else {
                      setViewReceiptModal({
                        invoiceId: 'INV-2026-001',
                        planName: billingData.plan.name,
                        amount: billingData.plan.formattedPrice,
                        provider: billingData.paymentMethod.provider,
                        senderNumber: billingData.paymentMethod.accountNumber || '016****2804',
                        trxId: 'BL98XJ28K9',
                        date: billingData.plan.nextPayment
                      });
                    }
                  }}
                >
                  <Eye size={15} /> View Receipt
                </button>
                <button
                  type="button"
                  className="btn-billing-secondary"
                  onClick={() => {
                    setUpdateProviderInput(billingData.paymentMethod.provider || 'bKash');
                    setUpdateSenderInput(billingData.paymentMethod.rawAccount || '');
                    setUpdateMethodModal(true);
                  }}
                >
                  <RefreshCw size={14} /> Update Method
                </button>
              </div>
            </div>
          </div>

          {/* =================================================================
              SECTION 4 — PAYMENT HISTORY
              ================================================================= */}
          <div className="billing-card" id="section-payment-history">
            <div className="billing-card-header">
              <h2 className="billing-card-title">Payment History</h2>
            </div>

            {billingData.invoices && billingData.invoices.length > 0 ? (
              <>
                {/* Desktop Table View */}
                <div className="billing-invoices-desktop">
                  <table className="billing-invoices-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingData.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td style={{ color: 'var(--text-secondary, #6B7280)', fontWeight: 600 }}>
                            {inv.date}
                          </td>
                          <td style={{ fontWeight: 800 }}>
                            {inv.amount}
                          </td>
                          <td>
                            <span className={`billing-status-badge ${inv.status.toLowerCase()}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn-invoice-action"
                              onClick={() => {
                                setViewReceiptModal(inv);
                              }}
                            >
                              <FileText size={14} /> View Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Compact Cards View */}
                <div className="billing-invoices-mobile">
                  {billingData.invoices.map((inv) => (
                    <div key={inv.id} className="billing-invoice-card-item">
                      <div className="billing-invoice-row-top">
                        <span className="billing-invoice-date">{inv.date}</span>
                        <span className={`billing-status-badge ${inv.status.toLowerCase()}`}>
                          {inv.status}
                        </span>
                      </div>
                      <div className="billing-invoice-row-middle">
                        <span className="billing-invoice-amount">{inv.amount}</span>
                      </div>
                      <div className="billing-invoice-row-bottom">
                        <button
                          type="button"
                          className="btn-invoice-action"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => {
                            setViewReceiptModal(inv);
                          }}
                        >
                          <FileText size={14} /> View Invoice
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="billing-invoices-empty">
                <FileText size={28} style={{ marginBottom: '0.45rem', opacity: 0.6 }} />
                <p style={{ margin: 0 }}>No payment history yet.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* =====================================================================
          CHANGE PLAN MODAL
          ===================================================================== */}
      {changePlanModal && !selectedPlanForCheckout && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.7)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          boxSizing: 'border-box'
        }} onClick={() => setChangePlanModal(false)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '520px', width: '100%',
              padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', margin: 'auto',
              maxHeight: '90vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Change Subscription Plan
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Select the conversation tier suited for your store volume.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChangePlanModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {PLANS.map((p) => {
                const isCurrent = billingData.plan.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanForCheckout(p)}
                    style={{
                      border: isCurrent ? '2px solid var(--primary, #087A4A)' : '1px solid var(--border-medium, #E2E8F0)',
                      borderRadius: '12px', padding: '1rem 1.15rem', cursor: 'pointer',
                      background: isCurrent ? 'var(--mint-soft, #EFFBF5)' : 'var(--bg-card, #ffffff)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{p.name}</span>
                        {p.badge && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#087A4A', color: '#fff', padding: '2px 8px', borderRadius: '100px' }}>
                            {p.badge}
                          </span>
                        )}
                        {isCurrent && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#DDF7E9', color: '#087A4A', padding: '2px 8px', borderRadius: '100px' }}>
                            Current
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {p.conversations} monthly conversations
                      </span>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--primary, #087A4A)' }}>
                          ${p.price}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ৳{p.priceBdt.toLocaleString()} BDT
                        </div>
                      </div>
                      <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-billing-secondary"
                onClick={() => setChangePlanModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CHECKOUT & PAYMENT MODAL (bKash / Nagad 01643792804)
          ===================================================================== */}
      {selectedPlanForCheckout && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          boxSizing: 'border-box'
        }} onClick={() => !submittingPayment && setSelectedPlanForCheckout(null)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '480px', width: '100%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)', margin: 'auto', maxHeight: '90vh', overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '1.15rem 1.35rem', borderBottom: '1px solid var(--border-light, #E5E7EB)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--mint-soft, #EFFBF5)'
            }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary-dark, #092A20)', display: 'block' }}>
                  Subscribe to {selectedPlanForCheckout.name}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  bKash / Nagad Send Money Gateway
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPlanForCheckout(null)}
                disabled={submittingPayment}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.35rem' }}>
              {/* Plan Pricing Banner */}
              <div style={{
                padding: '0.85rem 1rem', background: 'var(--mint-soft, #EFFBF5)', borderRadius: '10px',
                border: '1px solid var(--border-medium, #D9E9E1)', marginBottom: '1.15rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {selectedPlanForCheckout.name}
                  </span>
                  <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {selectedPlanForCheckout.conversations} conversations / month
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--primary, #087A4A)' }}>
                    ${selectedPlanForCheckout.price}/mo
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                    ৳{(selectedPlanForCheckout.price * 120).toLocaleString()} BDT
                  </div>
                </div>
              </div>

              {/* Method Selector */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  SELECT PAYMENT METHOD:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => { setCheckoutMethod('BKASH'); setCheckoutError(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                      padding: '0.65rem', borderRadius: '10px', cursor: 'pointer',
                      border: checkoutMethod === 'BKASH' ? '2px solid #E2136E' : '1px solid var(--border-medium, #E2E8F0)',
                      background: checkoutMethod === 'BKASH' ? 'rgba(226, 19, 110, 0.08)' : 'var(--bg-subtle, #F8FAF9)',
                      color: checkoutMethod === 'BKASH' ? '#E2136E' : 'var(--text-secondary)',
                      fontWeight: 750, fontSize: '0.84rem'
                    }}
                  >
                    ৳ bKash (Send money)
                  </button>

                  <button
                    type="button"
                    onClick={() => { setCheckoutMethod('NAGAD'); setCheckoutError(''); }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                      padding: '0.65rem', borderRadius: '10px', cursor: 'pointer',
                      border: checkoutMethod === 'NAGAD' ? '2px solid #F7931E' : '1px solid var(--border-medium, #E2E8F0)',
                      background: checkoutMethod === 'NAGAD' ? 'rgba(247, 147, 30, 0.08)' : 'var(--bg-subtle, #F8FAF9)',
                      color: checkoutMethod === 'NAGAD' ? '#F7931E' : 'var(--text-secondary)',
                      fontWeight: 750, fontSize: '0.84rem'
                    }}
                  >
                    ৳ Nagad (Send money)
                  </button>
                </div>
              </div>

              {/* Recipient Account Box */}
              <div style={{
                padding: '0.9rem 1rem', borderRadius: '10px',
                background: checkoutMethod === 'NAGAD' ? 'rgba(247, 147, 30, 0.06)' : 'rgba(226, 19, 110, 0.06)',
                border: `1px solid ${checkoutMethod === 'NAGAD' ? 'rgba(247, 147, 30, 0.3)' : 'rgba(226, 19, 110, 0.3)'}`,
                marginBottom: '1.15rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: checkoutMethod === 'NAGAD' ? '#C26A00' : '#B00E53' }}>
                    {checkoutMethod === 'NAGAD' ? 'Nagad' : 'bKash'} Personal (Send money)
                  </span>
                  <span style={{ fontSize: '0.72rem', background: '#fff', padding: '1px 7px', borderRadius: '100px', fontWeight: 700, border: '1px solid var(--border-medium)' }}>
                    Send Money
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
                    01643792804
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    style={{
                      background: copiedNumber ? 'var(--mint, #DDF7E9)' : '#ffffff',
                      color: copiedNumber ? '#087A4A' : 'var(--text-primary)',
                      border: '1px solid var(--border-medium)', borderRadius: '6px',
                      padding: '4px 10px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {copiedNumber ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>

                <div style={{ marginTop: '0.55rem', paddingTop: '0.55rem', borderTop: '1px dashed rgba(0,0,0,0.1)', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                  Amount to Send: <strong>৳{(selectedPlanForCheckout.price * 120).toLocaleString()} BDT</strong> (${selectedPlanForCheckout.price} USD)
                </div>
              </div>

              {/* Sender Details Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Your Sender Phone Number <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={senderNumberInput}
                    onChange={e => setSenderNumberInput(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem',
                      border: '1px solid var(--border-medium, #D1D5DB)', borderRadius: '8px',
                      fontSize: '0.88rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    Transaction ID (TrxID) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={trxIdInput}
                    onChange={e => setTrxIdInput(e.target.value)}
                    placeholder="e.g. BL98XJ28K9"
                    style={{
                      width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem',
                      border: '1px solid var(--border-medium, #D1D5DB)', borderRadius: '8px',
                      fontSize: '0.88rem', outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Upload Screenshot (Optional Proof) */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Payment Screenshot (Optional)
                </label>

                {screenshotPreview ? (
                  <div style={{
                    padding: '0.65rem', borderRadius: '8px', border: '1px solid #B8E7D1',
                    background: '#EAF8F0', display: 'flex', alignItems: 'center', gap: '0.65rem'
                  }}>
                    <img
                      src={screenshotPreview}
                      alt="Proof"
                      style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#087A4A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {screenshotName || 'Screenshot attached'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setScreenshotPreview(null); setScreenshotName(''); }}
                        style={{ background: 'none', border: 'none', padding: 0, fontSize: '0.74rem', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Remove
                      </button>
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
                      border: `1.5px dashed ${isDragging ? '#087A4A' : 'var(--border-medium, #D1D5DB)'}`,
                      borderRadius: '8px', padding: '0.9rem', textAlign: 'center', cursor: 'pointer',
                      background: isDragging ? 'rgba(8, 122, 74, 0.05)' : 'var(--bg-subtle, #F8FAF9)'
                    }}
                  >
                    <Upload size={20} color="var(--primary, #087A4A)" style={{ marginBottom: '2px' }} />
                    <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Click or drag payment screenshot here
                    </span>
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

              {checkoutError && (
                <div style={{
                  padding: '0.65rem 0.85rem', background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.25)', borderRadius: '8px',
                  marginBottom: '1rem', color: '#dc2626', fontSize: '0.78rem',
                  display: 'flex', alignItems: 'center', gap: '0.45rem'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} /> {checkoutError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn-billing-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedPlanForCheckout(null)}
                  disabled={submittingPayment}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-billing-primary"
                  style={{ flex: 2 }}
                  disabled={submittingPayment}
                  onClick={() => handleSubmitPayment(selectedPlanForCheckout)}
                >
                  {submittingPayment ? (
                    <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Activating…</>
                  ) : (
                    <><CheckCircle2 size={15} /> Confirm & Activate</>
                  )}
                </button>
              </div>
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
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          boxSizing: 'border-box'
        }} onClick={() => !cancellingPlan && setShowCancelConfirm(false)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '420px', width: '100%',
              padding: '1.75rem', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <AlertCircle size={32} color="#dc2626" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Cancel Subscription?
            </h3>
            <p style={{ margin: '0 0 1.35rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Are you sure you want to cancel your paid plan? Your workspace will return to the Free Trial tier and autonomous capabilities will be paused.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-billing-secondary"
                style={{ flex: 1 }}
                disabled={cancellingPlan}
                onClick={() => setShowCancelConfirm(false)}
              >
                Keep Plan
              </button>
              <button
                type="button"
                className="btn-billing-danger"
                style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none' }}
                disabled={cancellingPlan}
                onClick={handleCancelPlan}
              >
                {cancellingPlan ? 'Cancelling…' : 'Yes, Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIEW RECEIPT / INVOICE MODAL
          ===================================================================== */}
      {viewReceiptModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.75)', backdropFilter: 'blur(4px)',
          zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          boxSizing: 'border-box'
        }} onClick={() => setViewReceiptModal(null)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '480px', width: '100%',
              padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', margin: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Payment Receipt
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Invoice #{viewReceiptModal.id || viewReceiptModal.invoiceId || 'INV-2026-001'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewReceiptModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'var(--mint-soft, #EFFBF5)', borderRadius: '12px',
              border: '1px solid var(--border-medium, #D9E9E1)', padding: '1rem',
              marginBottom: '1.25rem', fontSize: '0.84rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Plan:</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  {viewReceiptModal.planName || billingData.plan.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
                <span style={{ fontWeight: 800, color: '#087A4A' }}>
                  {viewReceiptModal.amount || billingData.plan.formattedPrice}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {viewReceiptModal.provider || viewReceiptModal.method || 'bKash'} (01643792804)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Sender Account:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {viewReceiptModal.senderMasked || viewReceiptModal.senderNumber || billingData.paymentMethod.accountNumber || '016****2804'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Transaction ID (TrxID):</span>
                <code style={{ fontWeight: 800, color: 'var(--primary-dark)', background: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                  {viewReceiptModal.trxId || 'TRX-VERIFIED'}
                </code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Date:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {viewReceiptModal.date || 'October 12, 2026'}
                </span>
              </div>
            </div>

            {viewReceiptModal.screenshotUrl && (
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Attached Screenshot Proof:
                </span>
                <div style={{
                  maxHeight: '160px', overflow: 'hidden', borderRadius: '8px',
                  border: '1px solid var(--border-medium)', background: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <img
                    src={viewReceiptModal.screenshotUrl}
                    alt="Proof"
                    style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn-billing-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  downloadInvoicePdf(viewReceiptModal, billingData.plan, user);
                  showToast('Official PDF Invoice downloaded.', 'success');
                }}
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                type="button"
                className="btn-billing-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  printInvoicePdf(viewReceiptModal, billingData.plan, user);
                }}
              >
                <Printer size={14} /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          UPDATE METHOD MODAL
          ===================================================================== */}
      {updateMethodModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(9, 42, 32, 0.65)', backdropFilter: 'blur(3px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          boxSizing: 'border-box'
        }} onClick={() => !updatingMethod && setUpdateMethodModal(false)}>
          <div
            style={{
              background: 'var(--bg-card, #ffffff)', borderRadius: '16px', maxWidth: '420px', width: '100%',
              padding: '1.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.25)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Update Payment Method
            </h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
              Update your primary payment provider and sender account number.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Provider
                </label>
                <select
                  value={updateProviderInput}
                  onChange={e => setUpdateProviderInput(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-medium, #D1D5DB)', borderRadius: '8px',
                    fontSize: '0.88rem', outline: 'none', background: '#fff'
                  }}
                >
                  <option value="bKash">bKash (Send money)</option>
                  <option value="Nagad">Nagad (Send money)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
                  Sender Phone Number
                </label>
                <input
                  type="text"
                  value={updateSenderInput}
                  onChange={e => setUpdateSenderInput(e.target.value)}
                  placeholder="e.g. 017XXXXXXXX"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border-medium, #D1D5DB)', borderRadius: '8px',
                    fontSize: '0.88rem', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                type="button"
                className="btn-billing-secondary"
                style={{ flex: 1 }}
                disabled={updatingMethod}
                onClick={() => setUpdateMethodModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-billing-primary"
                style={{ flex: 1 }}
                disabled={updatingMethod}
                onClick={handleUpdateMethod}
              >
                {updatingMethod ? 'Saving…' : 'Save Method'}
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

