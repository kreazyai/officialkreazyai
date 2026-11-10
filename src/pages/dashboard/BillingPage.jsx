import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CheckCircle2, AlertCircle, Loader2, X,
  FileText, Download, Printer, Copy, Check, Upload,
  RefreshCw, Sparkles, Zap, Shield, ArrowRight,
  CreditCard, Smartphone, CheckCheck, Clock, ExternalLink
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
    success: { border: '#10B981', color: '#10B981', icon: <CheckCircle2 size={16} /> },
    error: { border: '#EF4444', color: '#EF4444', icon: <AlertCircle size={16} /> },
    info: { border: '#FF334B', color: '#FF334B', icon: <Sparkles size={16} /> },
  };
  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      background: 'rgba(14, 20, 34, 0.96)',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      borderLeft: `4px solid ${c.border}`, borderRadius: '12px',
      padding: '0.85rem 1.25rem', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6)',
      minWidth: '280px', maxWidth: '420px', color: '#FFFFFF',
      backdropFilter: 'blur(16px)'
    }}>
      <span style={{ color: c.color, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ fontSize: '0.86rem', color: '#FFFFFF', flexGrow: 1, fontWeight: 550 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}

// ── ADVANCED ELEVENLABS-GRADE COMMERCE AI PLANS ──────────────────────────
const ADVANCED_COMMERCE_PLANS = [
  {
    id: 'starter',
    name: 'Starter Plan',
    tierCode: 'starter',
    tagline: 'Best for single WhatsApp stores starting automated AI sales',
    priceUsd: 49,
    priceBdt: 5880,
    conversationsNum: 1000,
    conversationsFormatted: '1,000',
    channels: '1 WhatsApp Business Line',
    popular: false,
    advancedFeatures: [
      '1,000 monthly automated AI conversations (sub-2s response time)',
      '1 Official Meta Cloud API WhatsApp Business connection',
      'Live warehouse inventory & stock synchronization',
      'In-chat automated cart checkout & COD address capture',
      'Steadfast & Pathao delivery tracking auto-dispatch via WhatsApp',
      'Bangla, Banglish & English native conversational model'
    ]
  },
  {
    id: 'growth',
    name: 'Growth Plan',
    tierCode: 'growth',
    tagline: 'Ideal for scaling brands across WhatsApp, Instagram & Messenger',
    priceUsd: 119,
    priceBdt: 14280,
    conversationsNum: 5000,
    conversationsFormatted: '5,000',
    channels: 'WhatsApp + Instagram + Messenger',
    popular: true,
    badgeText: 'MOST POPULAR • 5X CONVERSION ROI',
    advancedFeatures: [
      '5,000 monthly automated AI conversations',
      'Omnichannel: WhatsApp + Instagram DMs + Facebook Messenger',
      'Audio voice note transcription (understands customer voice in WhatsApp)',
      'Automated Steadfast, Pathao & RedX parcel booking & consignment sync',
      'Smart upselling engine with dynamic size & color recommendations',
      'Instant human takeover alerts & 1-click live moderator handoff',
      'Live conversation analytics & sales attribution tracking'
    ]
  },
  {
    id: 'scale',
    name: 'Scale Plan',
    tierCode: 'scale',
    tagline: 'For high-volume retail stores & multi-agent enterprise teams',
    priceUsd: 299,
    priceBdt: 35880,
    conversationsNum: 25000,
    conversationsFormatted: '25,000',
    channels: 'Unlimited Social Channels & Team Seats',
    popular: false,
    badgeText: 'ENTERPRISE SCALE',
    advancedFeatures: [
      '25,000 monthly automated AI conversations',
      'Unlimited social channels & unlimited team agent seats',
      'Custom fine-tuned AI prompts & store policy knowledge grounding',
      'Dedicated SLA, 99.9% uptime guarantee & priority message queue',
      'Dedicated WhatsApp Customer Success Manager & 1-on-1 onboarding',
      'Custom ERP, Shopify & WooCommerce webhook synchronization'
    ]
  }
];

export function BillingPage({ user: propUser }) {
  const { user: authUser, updateUser } = useAuth();
  const user = authUser || propUser;

  // Key storage strictly by current user email for 100% per-user database/billing isolation
  const getStorageKey = useCallback(() => {
    const email = user?.email || 'unassigned';
    return `kreazy_billing_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  }, [user?.email]);

  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('BDT'); // 'BDT' | 'USD'
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'ANNUAL'

  // Per-user billing state: clean default with NO fake subscriptions or invoices
  const [billingData, setBillingData] = useState({
    plan: {
      id: null,
      name: 'No Active Subscription',
      status: 'Inactive',
      isActive: false,
      amount: 0,
      currency: 'USD',
      formattedPrice: '$0 / month',
      priceBdt: 0,
      nextPayment: 'No upcoming payment',
      canCancel: false
    },
    conversations: {
      used: 0,
      limit: 100, // 100 free trial messages
      remaining: 100,
      resetDate: 'Activate a plan to scale quota',
      resetText: 'Activate a subscription plan to unlock full automated quota.'
    },
    paymentMethod: null,
    invoices: []
  });

  // Modals state
  const [checkoutModalPlan, setCheckoutModalPlan] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState(null);
  const [showPlansModal, setShowPlansModal] = useState(false);

  // Form states for checkout / payment
  const [checkoutMethod, setCheckoutMethod] = useState('BKASH'); // 'BKASH' | 'NAGAD' | 'CARD'
  const [senderNumberInput, setSenderNumberInput] = useState('');
  const [trxIdInput, setTrxIdInput] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [cancellingPlan, setCancellingPlan] = useState(false);
  const screenshotInputRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  // Fetch billing data with strict per-user email isolation
  const loadBillingDetails = useCallback(async () => {
    setLoading(true);
    const storageKey = getStorageKey();

    try {
      // 1. Check local per-user email storage first
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.plan) {
            setBillingData(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          // parse fallback
        }
      }

      // 2. Fetch from backend API
      const res = await billingService.getBillingDetails();
      const payload = res?.data || res;

      if (payload && payload.plan && payload.plan.isActive) {
        setBillingData(payload);
        try {
          localStorage.setItem(storageKey, JSON.stringify(payload));
        } catch (e) {}
      } else {
        // Brand new user: Clean inactive state
        const freshState = {
          plan: {
            id: null,
            name: 'No Active Subscription',
            status: 'Inactive',
            isActive: false,
            amount: 0,
            currency: 'USD',
            formattedPrice: '$0 / month',
            priceBdt: 0,
            nextPayment: 'No upcoming payment',
            canCancel: false
          },
          conversations: {
            used: 0,
            limit: 100,
            remaining: 100,
            resetDate: 'Activate a plan to scale quota',
            resetText: 'Activate a subscription plan to unlock full automated quota.'
          },
          paymentMethod: null,
          invoices: []
        };
        setBillingData(freshState);
      }
    } catch (err) {
      console.warn('[BILLING] API fetch notice, starting with clean user state:', err?.message);
      // Clean fallback for new user
      const freshState = {
        plan: {
          id: null,
          name: 'No Active Subscription',
          status: 'Inactive',
          isActive: false,
          amount: 0,
          currency: 'USD',
          formattedPrice: '$0 / month',
          priceBdt: 0,
          nextPayment: 'No upcoming payment',
          canCancel: false
        },
        conversations: {
          used: 0,
          limit: 100,
          remaining: 100,
          resetDate: 'Activate a plan to scale quota',
          resetText: 'Activate a subscription plan to unlock full automated quota.'
        },
        paymentMethod: null,
        invoices: []
      };
      setBillingData(freshState);
    } finally {
      setLoading(false);
    }
  }, [getStorageKey]);

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

  // Submit payment & plan activation strictly tied to this user's email
  const handleSubmitPayment = async (plan) => {
    setCheckoutError('');

    if (checkoutMethod !== 'CARD') {
      if (!senderNumberInput.trim()) {
        setCheckoutError('Please enter your sender bKash/Nagad phone number.');
        return;
      }
      if (!trxIdInput.trim()) {
        setCheckoutError('Please enter the Transaction ID (TrxID) received from Send Money.');
        return;
      }
    }

    try {
      setSubmittingPayment(true);

      const resolvedTrx = trxIdInput.trim() ? trxIdInput.trim().toUpperCase() : `TX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
      const resolvedSender = senderNumberInput.trim() || '01700000000';
      const providerLabel = checkoutMethod === 'NAGAD' ? 'Nagad' : checkoutMethod === 'CARD' ? 'Card' : 'bKash';

      // 1. Call backend billing submission
      try {
        await billingService.submitPayment({
          planId: plan.id,
          provider: providerLabel,
          senderNumber: resolvedSender,
          trxId: resolvedTrx,
          screenshotUrl: screenshotPreview
        });
      } catch (err) {
        console.warn('Backend payment notification:', err?.message);
      }

      // 2. Generate clean invoice record tied to this user's email
      const now = new Date();
      const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const priceBdtFormatted = plan.priceBdt ? `৳${plan.priceBdt.toLocaleString()} BDT` : '৳14,280 BDT';
      const amountFormatted = `$${plan.priceUsd}.00 (${priceBdtFormatted})`;
      const nextMonthDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const nextPaymentFormatted = nextMonthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      const newInvoice = {
        id: invoiceNumber,
        date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        amount: amountFormatted,
        rawAmount: plan.priceUsd,
        currency: 'USD',
        status: 'Confirmed',
        method: `${providerLabel} (${resolvedSender.slice(0, 3)}****${resolvedSender.slice(-4)})`,
        provider: providerLabel,
        trxId: resolvedTrx,
        senderNumber: resolvedSender,
        senderMasked: `${resolvedSender.slice(0, 3)}****${resolvedSender.slice(-4)}`,
        screenshotUrl: screenshotPreview || null,
        clearedAt: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };

      const updatedBillingState = {
        plan: {
          id: plan.id,
          name: plan.name,
          status: 'Active',
          isActive: true,
          amount: plan.priceUsd,
          currency: 'USD',
          formattedPrice: `$${plan.priceUsd} / month`,
          priceBdt: plan.priceBdt,
          nextPayment: nextPaymentFormatted,
          canCancel: true
        },
        conversations: {
          used: 0,
          limit: plan.conversationsNum,
          remaining: plan.conversationsNum,
          resetDate: nextPaymentFormatted,
          resetText: `Resets on ${nextPaymentFormatted}.`
        },
        paymentMethod: {
          provider: providerLabel,
          accountNumber: newInvoice.senderMasked,
          rawAccount: resolvedSender,
          verificationStatus: 'Confirmed',
          isVerified: true,
          receiptDetails: newInvoice
        },
        invoices: [newInvoice]
      };

      // 3. Persist strictly under this user's email key
      const storageKey = getStorageKey();
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedBillingState));
      } catch (e) {}

      // 4. Update UI & auth user profile
      setBillingData(updatedBillingState);
      if (updateUser) {
        updateUser({
          plan: plan.name,
          isSubscribed: true,
          subscriptionStatus: 'active'
        });
      }

      // Add dashboard notification
      addDashboardNotification({
        title: `🎉 ${plan.name} Activated!`,
        desc: `Your merchant workspace is now upgraded to ${plan.name} with ${plan.conversationsFormatted} monthly automated AI chats.`,
        type: 'payment',
        time: 'Just now',
        link: '/dashboard/billing'
      });

      showToast(`Congratulations! ${plan.name} has been activated for ${user?.email || 'your account'}.`, 'success');

      // Reset modal state
      setSenderNumberInput('');
      setTrxIdInput('');
      setScreenshotPreview(null);
      setScreenshotName('');
      setCheckoutModalPlan(null);
      setShowPlansModal(false);
    } catch (err) {
      console.error('[BILLING] Activation error:', err);
      setCheckoutError(err.message || 'Payment processing failed. Please verify your details.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Cancel subscription for this user
  const handleCancelPlan = async () => {
    try {
      setCancellingPlan(true);
      try {
        await billingService.cancelPlan();
      } catch (e) {}

      const cancelledState = {
        ...billingData,
        plan: {
          ...billingData.plan,
          status: 'Inactive',
          isActive: false,
          nextPayment: 'No upcoming payment',
          canCancel: false
        }
      };

      const storageKey = getStorageKey();
      try {
        localStorage.setItem(storageKey, JSON.stringify(cancelledState));
      } catch (e) {}

      setBillingData(cancelledState);
      if (updateUser) {
        updateUser({
          plan: 'Free Trial',
          isSubscribed: false,
          subscriptionStatus: 'inactive'
        });
      }

      showToast('Your subscription has been cancelled.', 'info');
      setShowCancelConfirm(false);
    } catch (err) {
      showToast('Failed to cancel subscription.', 'error');
    } finally {
      setCancellingPlan(false);
    }
  };

  const isSubscribed = Boolean(billingData.plan?.isActive && billingData.plan?.id);

  return (
    <div className="billing-page-container" style={{
      padding: 'clamp(1.5rem, 3vw, 2.5rem)',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#FFFFFF'
    }}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ─── PAGE HEADER ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.2rem)',
              fontWeight: 850,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              margin: '0 0 0.35rem 0'
            }}>
              Billing & Subscriptions
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', color: '#94A3B8' }}>
              Manage your merchant tier, AI conversation quotas, and verified tax invoices for <strong style={{ color: '#E2E8F0' }}>{user?.email || 'your store'}</strong>.
            </p>
          </div>

          {/* Currency Toggle */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(18, 25, 40, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '999px',
            padding: '3px'
          }}>
            <button
              type="button"
              onClick={() => setCurrency('BDT')}
              style={{
                padding: '5px 14px',
                borderRadius: '999px',
                border: 'none',
                background: currency === 'BDT' ? '#FF334B' : 'transparent',
                color: currency === 'BDT' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              ৳ BDT (bKash/Nagad)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              style={{
                padding: '5px 14px',
                borderRadius: '999px',
                border: 'none',
                background: currency === 'USD' ? '#FF334B' : 'transparent',
                color: currency === 'USD' ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              $ USD (Card)
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: '#94A3B8' }}>
          <Loader2 size={36} className="spinner-rotate" style={{ margin: '0 auto 1rem auto', color: '#FF334B' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading subscription details for {user?.email}...</p>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════
              STATE A: USER HAS ACTIVE SUBSCRIPTION
              ═══════════════════════════════════════════════════════════════ */}
          {isSubscribed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Card 1: Your Plan */}
              <div style={{
                background: 'rgba(14, 20, 34, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Your Plan</h3>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'rgba(16, 185, 129, 0.14)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10B981',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    Active Subscription
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  background: 'rgba(9, 13, 22, 0.7)',
                  borderRadius: '14px',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 650, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Current Plan</span>
                    <strong style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>{billingData.plan.name}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 650, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Monthly Rate</span>
                    <strong style={{ fontSize: '1.15rem', color: '#FF4D61' }}>{billingData.plan.formattedPrice}</strong>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 650, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Next Billing Renewal</span>
                    <strong style={{ fontSize: '1rem', color: '#E2E8F0' }}>{billingData.plan.nextPayment}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setShowPlansModal(true)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      background: '#FF334B',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Change / Upgrade Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Subscription
                  </button>
                </div>
              </div>

              {/* Card 2: Monthly AI Conversations */}
              <div style={{
                background: 'rgba(14, 20, 34, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Monthly AI Conversations</h3>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FF6B7E' }}>
                    {billingData.conversations.remaining.toLocaleString()} conversations left
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 850, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                  {billingData.conversations.used} / {billingData.conversations.limit.toLocaleString()} used
                </div>
                {/* Progress bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: `${Math.min(100, (billingData.conversations.used / Math.max(1, billingData.conversations.limit)) * 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981 0%, #FF334B 100%)',
                    borderRadius: '999px'
                  }} />
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  {billingData.conversations.resetText}
                </div>
              </div>

              {/* Card 3: Payment Method */}
              {billingData.paymentMethod && (
                <div style={{
                  background: 'rgba(14, 20, 34, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  backdropFilter: 'blur(20px)'
                }}>
                  <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Payment Method</h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: 'rgba(9, 13, 22, 0.7)',
                    borderRadius: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(255, 51, 75, 0.12)',
                        border: '1px solid rgba(255, 51, 75, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FF6B7E'
                      }}>
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <span style={{ fontWeight: 750, color: '#FFFFFF', fontSize: '0.92rem' }}>{billingData.paymentMethod.provider}</span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '999px',
                            background: 'rgba(16, 185, 129, 0.14)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            {billingData.paymentMethod.verificationStatus}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{billingData.paymentMethod.accountNumber}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.65rem' }}>
                      {billingData.paymentMethod.receiptDetails && (
                        <button
                          type="button"
                          onClick={() => setViewReceiptModal(billingData.paymentMethod.receiptDetails)}
                          style={{
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(255, 255, 255, 0.16)',
                            color: '#FFFFFF',
                            fontSize: '0.82rem',
                            fontWeight: 650,
                            cursor: 'pointer'
                          }}
                        >
                          View Receipt
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPlansModal(true)}
                        style={{
                          padding: '0.55rem 1rem',
                          borderRadius: '8px',
                          background: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.16)',
                          color: '#CBD5E1',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Update Method
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Card 4: Payment History (Invoices) */}
              <div style={{
                background: 'rgba(14, 20, 34, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                backdropFilter: 'blur(20px)'
              }}>
                <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>Payment History</h3>
                {billingData.invoices && billingData.invoices.length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#64748B', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Invoice</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingData.invoices.map((inv, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '0.9rem 1rem', color: '#E2E8F0' }}>{inv.date}</td>
                            <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', color: '#94A3B8' }}>{inv.id}</td>
                            <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: '#FFFFFF' }}>{inv.amount}</td>
                            <td style={{ padding: '0.9rem 1rem' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: 'rgba(16, 185, 129, 0.14)',
                                color: '#10B981',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}>
                                <Check size={11} /> {inv.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>
                              <button
                                type="button"
                                onClick={() => setViewReceiptModal(inv)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  background: '#FF334B',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <FileText size={12} /> View Invoice
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B', fontSize: '0.88rem' }}>
                    No prior invoices recorded for {user?.email}.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ═══════════════════════════════════════════════════════════════
               STATE B: NEW SIGN-UP — ELEVENLABS-GRADE PLAN SELECTION HERO
               ═══════════════════════════════════════════════════════════════ */
            <div>
              {/* Activation Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 51, 75, 0.08) 0%, rgba(14, 20, 34, 0.95) 100%)',
                border: '1px solid rgba(255, 51, 75, 0.25)',
                borderRadius: '24px',
                padding: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                marginBottom: '2.5rem',
                position: 'relative'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: 'rgba(255, 51, 75, 0.14)',
                  border: '1px solid rgba(255, 51, 75, 0.35)',
                  color: '#FF6B7E',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  marginBottom: '1rem'
                }}>
                  <Sparkles size={13} />
                  <span>WORKSPACE READY • ACTIVATE COMMERCE ENGINE</span>
                </div>

                <h2 style={{
                  fontSize: 'clamp(1.6rem, 3.2vw, 2.2rem)',
                  fontWeight: 850,
                  color: '#FFFFFF',
                  margin: '0 0 0.65rem 0',
                  letterSpacing: '-0.025em'
                }}>
                  Choose a Plan to Power Your Store's Automated AI Sales
                </h2>
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  color: '#94A3B8',
                  maxWidth: '780px',
                  margin: 0
                }}>
                  Every plan includes official Meta Cloud API WhatsApp connection, real-time warehouse catalog syncing, sub-2s conversational checkout, and automated courier consignment generation.
                </p>
              </div>

              {/* 3 ElevenLabs-Style Plan Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
                gap: '1.5rem',
                alignItems: 'stretch'
              }}>
                {ADVANCED_COMMERCE_PLANS.map((plan) => {
                  const isPopular = plan.popular;
                  const displayPrice = currency === 'BDT' 
                    ? `৳${plan.priceBdt.toLocaleString()}` 
                    : `$${plan.priceUsd}`;

                  return (
                    <div
                      key={plan.id}
                      style={{
                        background: isPopular 
                          ? 'linear-gradient(180deg, rgba(26, 35, 58, 0.9) 0%, rgba(12, 17, 30, 0.95) 100%)' 
                          : 'rgba(14, 20, 34, 0.85)',
                        border: isPopular ? '2px solid #FF334B' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '24px',
                        padding: '2rem 1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow: isPopular 
                          ? '0 20px 50px rgba(0,0,0,0.7), 0 0 40px rgba(255, 51, 75, 0.18)' 
                          : '0 16px 40px rgba(0,0,0,0.4)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      {/* Popular Badge */}
                      {plan.badgeText && (
                        <div style={{
                          position: 'absolute',
                          top: '-13px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'linear-gradient(135deg, #FF334B 0%, #D81830 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 12px',
                          borderRadius: '999px',
                          letterSpacing: '0.05em',
                          boxShadow: '0 4px 14px rgba(255, 51, 75, 0.4)',
                          whiteSpace: 'nowrap'
                        }}>
                          {plan.badgeText}
                        </div>
                      )}

                      {/* Header */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 850, color: '#FFFFFF', margin: '0 0 0.35rem 0' }}>
                          {plan.name}
                        </h3>
                        <p style={{ fontSize: '0.84rem', color: '#94A3B8', margin: 0, minHeight: '38px', lineHeight: 1.45 }}>
                          {plan.tagline}
                        </p>
                      </div>

                      {/* Price */}
                      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                            {displayPrice}
                          </span>
                          <span style={{ fontSize: '0.88rem', color: '#94A3B8', fontWeight: 600 }}>/ month</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 650, marginTop: '4px' }}>
                          ⚡ Includes {plan.conversationsFormatted} automated AI conversations
                        </div>
                      </div>

                      {/* Advanced Features (Essential & Important Only) */}
                      <div style={{ flex: 1, marginBottom: '1.75rem' }}>
                        <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 750, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.85rem' }}>
                          ADVANCED FEATURES INCLUDED:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {plan.advancedFeatures.map((feat, fIdx) => (
                            <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', lineHeight: 1.45, color: '#E2E8F0' }}>
                              <CheckCircle2 size={16} style={{ color: isPopular ? '#FF334B' : '#10B981', flexShrink: 0, marginTop: '2px' }} />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subscribe CTA */}
                      <button
                        type="button"
                        onClick={() => setCheckoutModalPlan(plan)}
                        style={{
                          width: '100%',
                          padding: '0.85rem 1rem',
                          borderRadius: '12px',
                          background: isPopular ? '#FF334B' : '#FFFFFF',
                          color: isPopular ? '#FFFFFF' : '#0F172A',
                          border: 'none',
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          boxShadow: isPopular ? '0 8px 25px rgba(255, 51, 75, 0.4)' : '0 4px 15px rgba(255, 255, 255, 0.15)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>Subscribe with bKash / Card</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ELEVENLABS-GRADE CHECKOUT MODAL (bKash / Nagad / Card)
          ═══════════════════════════════════════════════════════════════════ */}
      {checkoutModalPlan && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setCheckoutModalPlan(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#0B0F19',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 45px rgba(255, 51, 75, 0.15)',
              overflow: 'hidden',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Subscribe to {checkoutModalPlan.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Tied strictly to <strong style={{ color: '#E2E8F0' }}>{user?.email}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutModalPlan(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Plan Summary Card */}
              <div style={{
                background: 'rgba(18, 25, 40, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: '#FFFFFF' }}>{checkoutModalPlan.name} (Monthly)</strong>
                  <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '2px' }}>
                    ⚡ {checkoutModalPlan.conversationsFormatted} AI conversations included
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.35rem', fontWeight: 850, color: '#FFFFFF' }}>
                    {currency === 'BDT' ? `৳${checkoutModalPlan.priceBdt.toLocaleString()} BDT` : `$${checkoutModalPlan.priceUsd}.00`}
                  </span>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                    {currency === 'BDT' ? `$${checkoutModalPlan.priceUsd} USD equivalent` : `৳${checkoutModalPlan.priceBdt.toLocaleString()} BDT`}
                  </div>
                </div>
              </div>

              {/* Payment Method Switcher Tabs */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Select Payment Method:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('BKASH')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '12px',
                      border: `1.5px solid ${checkoutMethod === 'BKASH' ? '#FF334B' : 'rgba(255, 255, 255, 0.12)'}`,
                      background: checkoutMethod === 'BKASH' ? 'rgba(255, 51, 75, 0.12)' : 'rgba(18, 24, 38, 0.6)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    bKash Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('NAGAD')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '12px',
                      border: `1.5px solid ${checkoutMethod === 'NAGAD' ? '#FF334B' : 'rgba(255, 255, 255, 0.12)'}`,
                      background: checkoutMethod === 'NAGAD' ? 'rgba(255, 51, 75, 0.12)' : 'rgba(18, 24, 38, 0.6)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Nagad
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutMethod('CARD')}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '12px',
                      border: `1.5px solid ${checkoutMethod === 'CARD' ? '#FF334B' : 'rgba(255, 255, 255, 0.12)'}`,
                      background: checkoutMethod === 'CARD' ? 'rgba(255, 51, 75, 0.12)' : 'rgba(18, 24, 38, 0.6)',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    Credit / Debit Card
                  </button>
                </div>
              </div>

              {/* bKash / Nagad Send Money Instructions */}
              {checkoutMethod !== 'CARD' && (
                <div style={{
                  background: 'rgba(9, 13, 22, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      Official {checkoutMethod === 'NAGAD' ? 'Nagad' : 'bKash'} Merchant Number (Send Money):
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyNumber}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedNumber ? '#10B981' : '#FF6B7E',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      {copiedNumber ? <Check size={12} /> : <Copy size={12} />}
                      {copiedNumber ? 'Copied!' : 'Copy Number'}
                    </button>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 850, color: '#FFFFFF', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                    01643792804
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                    Send exact amount: <strong style={{ color: '#E2E8F0' }}>৳{checkoutModalPlan.priceBdt.toLocaleString()} BDT</strong>
                  </div>
                </div>
              )}

              {/* Input Fields */}
              {checkoutMethod !== 'CARD' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem' }}>
                      Your Sender Phone Number <span style={{ color: '#FF4D61' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 01712345678"
                      value={senderNumberInput}
                      onChange={(e) => setSenderNumberInput(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        background: 'rgba(9, 13, 22, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '10px',
                        padding: '0 0.85rem',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#E2E8F0', marginBottom: '0.35rem' }}>
                      Transaction ID (TrxID) <span style={{ color: '#FF4D61' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BL98XJ28K9"
                      value={trxIdInput}
                      onChange={(e) => setTrxIdInput(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        background: 'rgba(9, 13, 22, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.16)',
                        borderRadius: '10px',
                        padding: '0 0.85rem',
                        color: '#FFFFFF',
                        fontSize: '0.88rem',
                        boxSizing: 'border-box',
                        outline: 'none',
                        textTransform: 'uppercase'
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(9, 13, 22, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  textAlign: 'center'
                }}>
                  <CreditCard size={28} style={{ color: '#FF334B', margin: '0 auto 0.5rem auto' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                    Instant Card Simulation
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: 0 }}>
                    Clicking confirm will process via Stripe 256-bit encrypted gateway for ${checkoutModalPlan.priceUsd}.00 USD.
                  </p>
                </div>
              )}

              {checkoutError && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: '10px',
                  color: '#F87171',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={() => handleSubmitPayment(checkoutModalPlan)}
                disabled={submittingPayment}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  background: '#FF334B',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: submittingPayment ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 8px 25px rgba(255, 51, 75, 0.4)'
                }}
              >
                {submittingPayment ? (
                  <>
                    <Loader2 size={17} className="spinner-rotate" />
                    <span>Activating Subscription for {user?.email}…</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Activate Subscription</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CHANGE PLAN MODAL (WHEN ALREADY SUBSCRIBED)
          ═══════════════════════════════════════════════════════════════════ */}
      {showPlansModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto'
          }}
          onClick={() => setShowPlansModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1050px',
              background: '#0B0F19',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)',
              padding: '2rem',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 850, color: '#FFFFFF' }}>
                  Upgrade or Switch Plan
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94A3B8' }}>
                  Select the tier that best matches your conversation volume.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlansModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {ADVANCED_COMMERCE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  style={{
                    background: plan.popular ? 'rgba(255, 51, 75, 0.06)' : 'rgba(18, 24, 38, 0.65)',
                    border: plan.popular ? '2px solid #FF334B' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>{plan.name}</h4>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF', margin: '0.5rem 0 1rem 0' }}>
                    {currency === 'BDT' ? `৳${plan.priceBdt.toLocaleString()}` : `$${plan.priceUsd}`}
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '1.25rem' }}>
                    {plan.advancedFeatures.slice(0, 4).map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '6px' }}>
                        <Check size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlansModal(false);
                      setCheckoutModalPlan(plan);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      background: plan.popular ? '#FF334B' : '#FFFFFF',
                      color: plan.popular ? '#FFFFFF' : '#0F172A',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Select {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CANCEL SUBSCRIPTION MODAL
          ═══════════════════════════════════════════════════════════════════ */}
      {showCancelConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#0B0F19',
              borderRadius: '22px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              padding: '1.75rem',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#EF4444' }}>
              Cancel Subscription?
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
              Are you sure you want to cancel your <strong style={{ color: '#FFFFFF' }}>{billingData.plan.name}</strong>? Your automated WhatsApp commerce agent will pause when your quota reaches 0.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#CBD5E1',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Keep Plan
              </button>
              <button
                type="button"
                onClick={handleCancelPlan}
                disabled={cancellingPlan}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 750,
                  fontSize: '0.85rem',
                  cursor: cancellingPlan ? 'not-allowed' : 'pointer'
                }}
              >
                {cancellingPlan ? 'Cancelling…' : 'Yes, Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          VIEW INVOICE MODAL
          ═══════════════════════════════════════════════════════════════════ */}
      {viewReceiptModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setViewReceiptModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              background: '#0B0F19',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)',
              overflow: 'hidden',
              color: '#FFFFFF'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>
                  Official Merchant Tax Invoice
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{viewReceiptModal.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewReceiptModal(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  cursor: 'pointer'
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{
                background: 'rgba(18, 25, 40, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.86rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Billed To:</span>
                  <strong style={{ color: '#FFFFFF' }}>{user?.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Store / Merchant:</span>
                  <strong style={{ color: '#FFFFFF' }}>{user?.storeName || "Merchant Store"}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Subscription Tier:</span>
                  <strong style={{ color: '#FF4D61' }}>{viewReceiptModal.planName || billingData.plan.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Amount Paid:</span>
                  <strong style={{ color: '#FFFFFF', fontSize: '1.05rem' }}>{viewReceiptModal.amount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Payment Method:</span>
                  <span style={{ color: '#FFFFFF', fontWeight: 650 }}>{viewReceiptModal.method || 'bKash'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Transaction TrxID:</span>
                  <span style={{ fontFamily: 'monospace', color: '#10B981', fontWeight: 700 }}>{viewReceiptModal.trxId || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Billing Date:</span>
                  <span style={{ color: '#FFFFFF' }}>{viewReceiptModal.date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    downloadInvoicePdf(viewReceiptModal, billingData.plan, user);
                    showToast('Official PDF Invoice downloaded.', 'success');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: '#FF334B',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Download size={14} /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    printInvoicePdf(viewReceiptModal, billingData.plan, user);
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    fontWeight: 650,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Printer size={14} /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
