import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Smartphone,
  Activity,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { WhatsAppIcon } from '../../../components/integrations/BrandIcons';
import { whatsappApiService } from '../../../services/api';

/**
 * Loads official Meta Facebook JavaScript SDK dynamically if not already loaded
 */
function loadMetaSdk(appId) {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      return resolve(window.FB);
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId || 'mock_app_id',
        cookie: true,
        xfbml: true,
        version: 'v21.0'
      });
      resolve(window.FB);
    };

    const existingScript = document.getElementById('facebook-jssdk');
    if (existingScript) {
      if (window.FB) return resolve(window.FB);
    } else {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('Failed to load Meta JavaScript SDK'));
      document.head.appendChild(script);
    }
  });
}

export function WhatsAppIntegrationPage({ onBack }) {
  const [connection, setConnection] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [autoReply, setAutoReply] = useState(true);

  // Upgrade Plan Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Interactive Live Phone AI Test
  const [recipientPhone, setRecipientPhone] = useState(() => {
    return localStorage.getItem('kreazy_user_phone') || '';
  });
  const [testQuestion, setTestQuestion] = useState('Do you have this shirt in XL?');
  const [testReply, setTestReply] = useState(null);
  const [testMetadata, setTestMetadata] = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [liveDispatchResult, setLiveDispatchResult] = useState(null);

  // Manual Meta Credentials Configuration Modal
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [credsSubmitting, setCredsSubmitting] = useState(false);
  const [credsForm, setCredsForm] = useState({
    accessToken: '',
    phoneNumberId: '1407171145805154',
    wabaId: '1735308764198811',
    displayNumber: '+1 (555) 839-2041'
  });

  // Connection Health Check & Diagnostics
  const [healthChecking, setHealthChecking] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);

  // Feedback notifications
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  // ── 1. Fetch live connection and wallet details ────────────────────────────
  const fetchDetails = useCallback(async () => {
    try {
      const data = await whatsappApiService.getConnection();
      const conn = data?.connection || data;
      setConnection(conn);
      setAutoReply(conn?.auto_reply_enabled !== 0);

      if (data?.wallet) {
        setWallet(data.wallet);
      } else {
        const walletData = await whatsappApiService.getWallet();
        if (walletData) setWallet(walletData);
      }
    } catch (err) {
      console.error('Failed to load WhatsApp details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Auto-dismiss notices after 5 seconds
  useEffect(() => {
    if (notice || errorNotice) {
      const timer = setTimeout(() => {
        setNotice(null);
        setErrorNotice(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notice, errorNotice]);

  // ── 2. Official Meta Embedded Signup Flow ──────────────────────────────────
  const handleConnectWhatsApp = async () => {
    setConnecting(true);
    setErrorNotice(null);
    setNotice(null);

    let sessionInfoListener = null;

    try {
      // Step A: Initiate server-side session with CSRF state token
      const sessionRes = await whatsappApiService.initiateEmbeddedSignup();
      const session = sessionRes?.data || sessionRes;
      const { stateToken, appId, configId, isSimulated } = session;

      if (!stateToken) {
        throw new Error('Failed to generate secure onboarding session.');
      }

      // Step B: Listen for Meta window message event
      let capturedSessionInfo = {};
      sessionInfoListener = (event) => {
        if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return;
        try {
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (data?.type === 'WA_EMBEDDED_SIGNUP' && data.event === 'FINISH') {
            capturedSessionInfo = data.data || {};
          }
        } catch {}
      };
      window.addEventListener('message', sessionInfoListener);

      // Step C: Trigger Meta Login for Business Popup
      if (appId && !isSimulated) {
        await loadMetaSdk(appId);

        window.FB.login(
          async (response) => {
            try {
              if (response.authResponse?.code) {
                // Exchange code on server
                const exchangeRes = await whatsappApiService.completeEmbeddedSignup({
                  code: response.authResponse.code,
                  stateToken,
                  sessionInfo: capturedSessionInfo
                });

                const updatedConn = exchangeRes?.connection || exchangeRes?.data?.connection;
                if (updatedConn) setConnection(updatedConn);
                setNotice('WhatsApp Business connected successfully via Meta Official Signup.');
                await fetchDetails();
              } else {
                await whatsappApiService.completeEmbeddedSignup({
                  isCancelled: true,
                  stateToken
                });
                setNotice('Connection popup was closed before completing onboarding.');
              }
            } catch (exchangeErr) {
              setErrorNotice(`Connection error: ${exchangeErr.message || 'Authorization failed'}`);
            } finally {
              setConnecting(false);
              if (sessionInfoListener) window.removeEventListener('message', sessionInfoListener);
            }
          },
          {
            config_id: configId || undefined,
            response_type: 'code',
            override_default_response_type: true,
            extras: {
              feature: 'whatsapp_embedded_signup',
              sessionInfoVersion: '2'
            }
          }
        );
      } else {
        // Development / Test sandbox simulation
        const exchangeRes = await whatsappApiService.completeEmbeddedSignup({
          code: 'mock_auth_code_embedded_signup_demo',
          stateToken,
          sessionInfo: {
            waba_id: '1735308764198811',
            phone_number_id: '1407171145805154',
            display_phone_number: '+1 (555) 653-9685'
          }
        });

        const updatedConn = exchangeRes?.connection || exchangeRes?.data?.connection || exchangeRes;
        if (updatedConn) setConnection(updatedConn);
        setNotice('WhatsApp Business connected successfully via Meta Embedded Signup.');
        await fetchDetails();
        setConnecting(false);
      }
    } catch (err) {
      setErrorNotice(`Embedded Signup failed: ${err.message}`);
      setConnecting(false);
      if (sessionInfoListener) window.removeEventListener('message', sessionInfoListener);
    }
  };

  // ── 3. Disconnect WhatsApp ────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp Business? Automated AI replies will be paused.')) {
      return;
    }
    setErrorNotice(null);
    setNotice(null);
    try {
      await whatsappApiService.disconnect();
      setConnection({ status: 'NOT_CONNECTED' });
      setDiagnosticsData(null);
      setTestReply(null);
      setNotice('WhatsApp disconnected and credentials purged.');
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Disconnect failed: ${err.message}`);
    }
  };

  // ── 4. Toggle AI Auto-Reply ────────────────────────────────────────────────
  const handleToggleAutoReply = async () => {
    const nextVal = !autoReply;
    setAutoReply(nextVal);
    try {
      await whatsappApiService.updateAutoReply(nextVal);
    } catch (err) {
      setAutoReply(!nextVal);
      setErrorNotice(`Failed to update auto-reply: ${err.message}`);
    }
  };

  // ── 5. Real Phone WhatsApp Dispatch Pipeline ──────────────────────────────
  const handleSendLiveToPhone = async () => {
    if (!testQuestion.trim()) return;
    if (!recipientPhone.trim()) {
      setErrorNotice('Please enter your WhatsApp phone number to receive this message on your device.');
      return;
    }

    setTestSending(true);
    setTestReply(null);
    setTestMetadata(null);
    setLiveDispatchResult(null);
    setErrorNotice(null);

    // Persist phone for user convenience
    localStorage.setItem('kreazy_user_phone', recipientPhone.trim());

    try {
      const res = await whatsappApiService.sendTestMessage({
        messageText: testQuestion.trim(),
        recipientPhone: recipientPhone.trim(),
        sendLiveToPhone: true,
        sendAiReply: true
      });

      const resData = res?.data || res;
      const textSent = resData?.textSent || resData?.replyText || 'Message dispatched to your phone.';
      const messageId = resData?.messageId || null;
      const aiMeta = resData?.aiMetadata || null;

      setTestReply(textSent);
      setLiveDispatchResult({
        success: true,
        recipientPhone: recipientPhone.trim(),
        messageId,
        aiMeta
      });
      setNotice(`AI reply successfully delivered directly to your WhatsApp (${recipientPhone.trim()})!`);
      await fetchDetails();
    } catch (err) {
      console.error('Send to phone error:', err);
      const errMsg = err?.response?.data?.error?.message || err?.message || 'Failed to dispatch WhatsApp message to phone.';
      const isMock = err?.response?.data?.error?.details?.isMockToken;

      setErrorNotice(errMsg);
      setLiveDispatchResult({
        success: false,
        error: errMsg,
        isMockToken: Boolean(isMock)
      });

      if (isMock) {
        setShowCredsModal(true);
      }
    } finally {
      setTestSending(false);
    }
  };

  // ── 5b. Manual Meta Cloud API Credentials Configuration ─────────────────────
  const handleSaveCredentials = async (e) => {
    if (e) e.preventDefault();
    if (!credsForm.accessToken.trim() || !credsForm.phoneNumberId.trim()) {
      setErrorNotice('Access Token and Phone Number ID are required.');
      return;
    }

    setCredsSubmitting(true);
    setErrorNotice(null);

    try {
      await whatsappApiService.configureCredentials({
        accessToken: credsForm.accessToken.trim(),
        phoneNumberId: credsForm.phoneNumberId.trim(),
        wabaId: credsForm.wabaId.trim() || undefined,
        displayNumber: credsForm.displayNumber.trim() || undefined
      });

      setShowCredsModal(false);
      setNotice('Meta Cloud API credentials verified & linked successfully! You can now send live messages to your phone.');
      await fetchDetails();
    } catch (err) {
      const errMsg = err?.response?.data?.error?.message || err?.message || 'Verification failed';
      setErrorNotice(`Meta API verification failed: ${errMsg}`);
    } finally {
      setCredsSubmitting(false);
    }
  };

  // ── 6. Health Check Diagnostic ─────────────────────────────────────────────
  const handleCheckConnection = async () => {
    setHealthChecking(true);
    setErrorNotice(null);
    try {
      const res = await whatsappApiService.healthCheck();
      const data = res?.data || res;
      setDiagnosticsData(data);
      setDiagnosticsOpen(true);
      if (data?.status === 'CONNECTED') {
        setNotice('Connection health check passed. Channel is active.');
      } else if (data?.status === 'REAUTH_REQUIRED') {
        setErrorNotice('Meta token expired (Code 190 / Subcode 463). Please click Reconnect.');
      }
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Health check error: ${err.message}`);
    } finally {
      setHealthChecking(false);
    }
  };

  // ── 7. Upgrade Plan ────────────────────────────────────────────────────────
  const handleUpgradePlan = async (planId) => {
    setUpgradeLoading(true);
    setErrorNotice(null);
    try {
      const res = await whatsappApiService.upgradePlan({ planId, billingCycle: 'MONTHLY' });
      setShowUpgradeModal(false);
      setNotice(`Subscription upgraded to ${res?.plan || planId}. New credits added!`);
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Upgrade failed: ${err.message}`);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const isConnected = connection?.status === 'CONNECTED';
  const isReauth = connection?.status === 'REAUTH_REQUIRED';
  const phoneNumber = connection?.display_number || connection?.display_phone || null;

  // Credit metrics from live backend data
  const creditsBalance = wallet?.creditsBalance ?? 125;
  const trialDaysLeft = wallet?.trialDaysRemaining ?? 7;
  const repliesUsed = wallet?.successfulRepliesCount ?? 0;
  const maxTrialReplies = wallet?.maxTrialReplies ?? 25;

  return (
    <div className="macos-integrations-wrapper">
      <div className="macos-integrations-container">
        {/* Breadcrumb Back Navigation */}
        <div className="macos-header">
          <nav className="macos-breadcrumb" aria-label="Breadcrumb">
            <button
              type="button"
              className="macos-breadcrumb-btn"
              onClick={onBack}
            >
              <ChevronLeft size={16} />
              Integrations
            </button>
            <span className="macos-breadcrumb-separator">/</span>
            <span className="macos-breadcrumb-current">WhatsApp</span>
          </nav>
          <h1 className="macos-title">WhatsApp Automation</h1>
          <p className="macos-subtitle">
            Automate customer conversations with AI on WhatsApp.
          </p>
        </div>

        {/* Transient Notice / Error Banners */}
        {notice && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '14px',
              padding: '10px 16px',
              marginBottom: '1.25rem',
              color: '#065F46',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'macosFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10B981" />
              <span>{notice}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              style={{ background: 'none', border: 'none', color: '#065F46', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {errorNotice && (
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '14px',
              padding: '10px 16px',
              marginBottom: '1.25rem',
              color: '#991B1B',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'macosFadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#EF4444" />
              <span>{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="macos-sections-stack">
          {/* ─────────────────────────────────────────────────────────────
              SECTION A — WHATSAPP CONNECTION CARD
              ───────────────────────────────────────────────────────────── */}
          <section className="macos-section-card" aria-labelledby="wa-conn-heading">
            <div className="macos-conn-row">
              <div className="macos-conn-identity">
                <div className="macos-brand-icon-box" style={{ background: '#25D366' }}>
                  <WhatsAppIcon size={44} />
                </div>
                <div>
                  <h2 id="wa-conn-heading" className="macos-conn-title">
                    WhatsApp Business
                    <span
                      className={`macos-status-pill ${
                        isConnected ? 'connected' : isReauth ? 'reauth' : 'disconnected'
                      }`}
                    >
                      <span className="macos-status-dot" />
                      <span>
                        {isConnected
                          ? 'Connected'
                          : isReauth
                          ? 'Reauth Required'
                          : 'Not Connected'}
                      </span>
                    </span>
                  </h2>
                  <p className="macos-conn-meta">
                    {phoneNumber ? (
                      <>
                        <Smartphone size={14} />
                        <span>{phoneNumber}</span>
                      </>
                    ) : (
                      <span>Official Meta WhatsApp Cloud API</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Actions Area */}
              <div className="macos-conn-actions">
                <button
                  type="button"
                  className="macos-btn-secondary"
                  onClick={() => setShowCredsModal(true)}
                  title="Configure Meta Cloud API Access Token and Phone Number ID"
                >
                  <KeyRound size={14} />
                  Configure Token
                </button>

                {!isConnected && !isReauth && (
                  <button
                    type="button"
                    className="macos-btn-whatsapp"
                    onClick={handleConnectWhatsApp}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect WhatsApp'
                    )}
                  </button>
                )}

                {isReauth && (
                  <>
                    <button
                      type="button"
                      className="macos-btn-whatsapp"
                      onClick={handleConnectWhatsApp}
                      disabled={connecting}
                    >
                      {connecting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Reconnecting...
                        </>
                      ) : (
                        'Reconnect WhatsApp'
                      )}
                    </button>
                    <button
                      type="button"
                      className="macos-btn-danger-ghost"
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </button>
                  </>
                )}

                {isConnected && (
                  <>
                    <button
                      type="button"
                      className="macos-btn-secondary"
                      onClick={handleConnectWhatsApp}
                      disabled={connecting}
                    >
                      Reconnect
                    </button>
                    <button
                      type="button"
                      className="macos-btn-danger-ghost"
                      onClick={handleDisconnect}
                    >
                      Disconnect
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION B — AI CREDIT BALANCE (MINIMAL HORIZONTAL STRIP)
              ───────────────────────────────────────────────────────────── */}
          <section className="macos-section-card macos-credit-strip" aria-label="AI Credit Balance">
            <div className="macos-credit-stats">
              <div className="macos-credit-metric">
                <span className="macos-credit-metric-val">{creditsBalance}</span>
                <span className="macos-credit-metric-lbl">Credits</span>
              </div>

              <div className="macos-credit-divider" />

              <div className="macos-credit-metric">
                <span className="macos-credit-metric-val">{trialDaysLeft}</span>
                <span className="macos-credit-metric-lbl">Days Left</span>
              </div>

              <div className="macos-credit-divider" />

              <div className="macos-credit-metric">
                <span className="macos-credit-metric-val">
                  {repliesUsed} / {maxTrialReplies}
                </span>
                <span className="macos-credit-metric-lbl">Replies</span>
              </div>

              <span className="macos-credit-cost-hint">
                · 5 credits per AI reply
              </span>
            </div>

            {/* Upgrade Plan action as simple text-style button */}
            <button
              type="button"
              className="macos-upgrade-link"
              onClick={() => setShowUpgradeModal(true)}
            >
              Upgrade Plan →
            </button>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION C — AI AUTO-REPLY SETTINGS CARD
              ───────────────────────────────────────────────────────────── */}
          <section className="macos-section-card" aria-labelledby="auto-reply-heading">
            <div className="macos-setting-row">
              <div className="macos-setting-text">
                <h2 id="auto-reply-heading" className="macos-setting-heading">
                  AI Auto-Reply
                </h2>
                <p className="macos-setting-desc">
                  Automatically respond to incoming customer messages.
                </p>
              </div>

              {/* Functional macOS-Style Toggle */}
              <label className="macos-toggle-switch" aria-label="Toggle AI Auto-Reply">
                <input
                  type="checkbox"
                  checked={autoReply}
                  onChange={handleToggleAutoReply}
                />
                <span className="macos-toggle-track" />
              </label>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION D — SEND AI MESSAGE DIRECTLY TO YOUR PHONE
              ───────────────────────────────────────────────────────────── */}
          <section className="macos-section-card" aria-labelledby="live-phone-heading">
            <div className="macos-test-box">
              <div>
                <h2 id="live-phone-heading" className="macos-setting-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Smartphone size={18} color="#087A4A" />
                  Send AI Message Directly to Your Phone
                </h2>
                <p className="macos-setting-desc" style={{ marginBottom: '1.25rem' }}>
                  Enter your mobile WhatsApp number. When you test a question, KreazyAI generates an AI response and delivers it directly to your WhatsApp.
                </p>
              </div>

              {/* Phone Number Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Your WhatsApp Phone Number</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748B' }}>(Include country code, e.g. +88017... or +1...)</span>
                </label>
                <div style={{ maxWidth: '380px' }}>
                  <input
                    type="tel"
                    className="macos-input"
                    value={recipientPhone}
                    onChange={(e) => {
                      setRecipientPhone(e.target.value);
                      localStorage.setItem('kreazy_user_phone', e.target.value);
                    }}
                    placeholder="+8801712345678"
                    style={{ width: '100%', fontFamily: 'inherit' }}
                  />
                </div>
              </div>

              {/* Customer Inquiry Input & Send Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155' }}>
                  Sample Customer Question
                </label>
                <div className="macos-test-input-group">
                  <input
                    type="text"
                    className="macos-input"
                    value={testQuestion}
                    onChange={(e) => setTestQuestion(e.target.value)}
                    placeholder="e.g. Do you have this shirt in XL?"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !testSending) {
                        e.preventDefault();
                        handleSendLiveToPhone();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="macos-btn-primary"
                    onClick={handleSendLiveToPhone}
                    disabled={testSending || !testQuestion.trim() || !recipientPhone.trim()}
                    style={{ minWidth: '190px' }}
                  >
                    {testSending ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Sending to Phone...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send to My WhatsApp
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Sample Prompts */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Quick questions:</span>
                  {[
                    'Do you have this shirt in XL?',
                    'What is your return policy?',
                    'How long does delivery take?'
                  ].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setTestQuestion(sample)}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Delivery Result */}
              {liveDispatchResult?.success && (
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    animation: 'macosFadeIn 0.25s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#16A34A" />
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#166534' }}>
                        Delivered directly to {liveDispatchResult.recipientPhone} on WhatsApp
                      </span>
                    </div>
                    {liveDispatchResult.messageId && (
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#15803D', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
                        ID: {liveDispatchResult.messageId}
                      </span>
                    )}
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #DCFCE7', borderRadius: '12px', padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '4px', fontWeight: 600 }}>
                      AI Response Sent to Your Phone:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1F2937', lineHeight: 1.5 }}>
                      {testReply}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: '#15803D' }}>
                    <span>
                      Model: <strong>{liveDispatchResult.aiMeta?.model || 'qwen3:1.7b'}</strong>
                      {liveDispatchResult.aiMeta?.executionTimeMs && ` · ${(liveDispatchResult.aiMeta.executionTimeMs / 1000).toFixed(1)}s`}
                    </span>
                    <span style={{ fontWeight: 600 }}>Official Meta Cloud API Live Send</span>
                  </div>
                </div>
              )}

              {/* Delivery Failure Card */}
              {liveDispatchResult?.success === false && (
                <div
                  style={{
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    animation: 'macosFadeIn 0.25s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={18} color="#DC2626" />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991B1B' }}>
                      Message could not be delivered to phone
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#B91C1C', lineHeight: 1.4 }}>
                    {liveDispatchResult.error}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="macos-btn-secondary"
                      onClick={() => setShowCredsModal(true)}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      <KeyRound size={13} />
                      Configure Meta Cloud API Token
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              SECTION E — CONNECTION HEALTH
              ───────────────────────────────────────────────────────────── */}
          <div className="macos-health-footer">
            <button
              type="button"
              className="macos-health-toggle-btn"
              onClick={handleCheckConnection}
              disabled={healthChecking}
            >
              {healthChecking ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Checking Connection...
                </>
              ) : (
                <>
                  <Activity size={14} />
                  Check Connection
                </>
              )}
            </button>

            {diagnosticsData && (
              <button
                type="button"
                onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {diagnosticsOpen ? 'Hide diagnostics' : 'Show diagnostics'}
              </button>
            )}
          </div>

          {/* Detailed Diagnostic Information (Requested only) */}
          {diagnosticsOpen && diagnosticsData && (
            <div className="macos-diagnostics-drawer">
              <div className="macos-diag-item">
                <span className="macos-diag-label">
                  <Activity size={14} /> Channel Status
                </span>
                <span className="macos-diag-val" style={{ color: isConnected ? '#087A4A' : isReauth ? '#D97706' : '#64748B' }}>
                  {diagnosticsData?.status || connection?.status || 'NOT_CONNECTED'}
                </span>
              </div>

              <div className="macos-diag-item">
                <span className="macos-diag-label">
                  <Smartphone size={14} /> Phone Number ID
                </span>
                <span className="macos-diag-val">
                  {diagnosticsData?.phoneIdentity?.phoneNumberId || connection?.phone_number_id || 'Not Linked'}
                </span>
              </div>

              <div className="macos-diag-item">
                <span className="macos-diag-label">
                  <Sparkles size={14} /> Local AI Runtime (Ollama)
                </span>
                <span className="macos-diag-val" style={{ color: '#087A4A' }}>
                  {diagnosticsData?.aiHealth?.model || 'qwen3:1.7b'} (Online)
                </span>
              </div>

              <div className="macos-diag-item">
                <span className="macos-diag-label">
                  <RefreshCw size={14} /> Real-Time Webhook
                </span>
                <span className="macos-diag-val">
                  {diagnosticsData?.webhookHealth?.status || 'Active v21.0'}
                </span>
              </div>

              {diagnosticsData?.diagnostics?.metaApiError && (
                <div style={{ fontSize: '0.75rem', color: '#B45309', background: '#FEF3C7', padding: '8px 12px', borderRadius: '8px', marginTop: '4px' }}>
                  Meta Notice: {diagnosticsData.diagnostics.metaApiError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          UPGRADE PLAN MODAL (MACOS SHEET)
          ───────────────────────────────────────────────────────────── */}
      {showUpgradeModal && (
        <div className="macos-modal-backdrop" onClick={() => setShowUpgradeModal(false)}>
          <div className="macos-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="macos-modal-close"
              onClick={() => setShowUpgradeModal(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: '#17212B' }}>
              Upgrade Your AI Automation Plan
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
              Scale your autonomous AI customer replies with dedicated credits.
            </p>

            <div className="macos-plans-grid">
              {/* Starter */}
              <div className="macos-plan-card">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#17212B' }}>
                    Starter
                  </h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#17212B', marginBottom: '0.5rem' }}>
                    $47<span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#087A4A', fontWeight: 700, marginBottom: '0.5rem' }}>
                    6,000 AI Credits
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: '#64748B', lineHeight: 1.4 }}>
                    Up to 1,200 AI replies. Ideal for boutique stores.
                  </div>
                </div>
                <button
                  type="button"
                  className="macos-btn-secondary"
                  style={{ marginTop: '1.25rem' }}
                  onClick={() => handleUpgradePlan('starter')}
                  disabled={upgradeLoading}
                >
                  Select Plan
                </button>
              </div>

              {/* Standard (Popular) */}
              <div className="macos-plan-card popular">
                <span className="macos-plan-tag">Popular</span>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#17212B' }}>
                    Standard
                  </h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#087A4A', marginBottom: '0.5rem' }}>
                    $119<span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#087A4A', fontWeight: 700, marginBottom: '0.5rem' }}>
                    18,000 AI Credits
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: '#64748B', lineHeight: 1.4 }}>
                    Up to 3,600 AI replies. Includes catalog & inventory lookup.
                  </div>
                </div>
                <button
                  type="button"
                  className="macos-btn-primary"
                  style={{ marginTop: '1.25rem' }}
                  onClick={() => handleUpgradePlan('standard')}
                  disabled={upgradeLoading}
                >
                  Select Plan
                </button>
              </div>

              {/* Pro */}
              <div className="macos-plan-card">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 700, color: '#17212B' }}>
                    Pro
                  </h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#17212B', marginBottom: '0.5rem' }}>
                    $249<span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#087A4A', fontWeight: 700, marginBottom: '0.5rem' }}>
                    40,000 AI Credits
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: '#64748B', lineHeight: 1.4 }}>
                    Up to 8,000 AI replies. High concurrency & custom tone.
                  </div>
                </div>
                <button
                  type="button"
                  className="macos-btn-secondary"
                  style={{ marginTop: '1.25rem' }}
                  onClick={() => handleUpgradePlan('pro')}
                  disabled={upgradeLoading}
                >
                  Select Plan
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8' }}>
              Credits activate immediately upon plan selection. Cancel anytime.
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CONFIGURE META CLOUD API CREDENTIALS
          ───────────────────────────────────────────────────────────── */}
      {showCredsModal && (
        <div className="macos-modal-backdrop" onClick={() => setShowCredsModal(false)}>
          <div
            className="macos-modal-sheet"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="macos-modal-close"
              onClick={() => setShowCredsModal(false)}
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
              <div style={{ background: '#ECFDF5', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                <KeyRound size={22} color="#087A4A" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 2px 0', color: '#17212B' }}>
                  Meta Cloud API Credentials
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
                  Enter your Meta credentials to deliver live WhatsApp messages to your real phone.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Meta Access Token <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  className="macos-input"
                  rows={3}
                  placeholder="Paste your Meta System User Token or Temporary Access Token (starts with EAA...)"
                  value={credsForm.accessToken}
                  onChange={(e) => setCredsForm({ ...credsForm, accessToken: e.target.value })}
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  From Meta App Dashboard → WhatsApp → API Setup, or System Users in Meta Business Manager.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Phone Number ID <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="macos-input"
                  placeholder="e.g. 1407171145805154"
                  value={credsForm.phoneNumberId}
                  onChange={(e) => setCredsForm({ ...credsForm, phoneNumberId: e.target.value })}
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  className="macos-input"
                  placeholder="e.g. 1735308764198811"
                  value={credsForm.wabaId}
                  onChange={(e) => setCredsForm({ ...credsForm, wabaId: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Display Phone Number
                </label>
                <input
                  type="text"
                  className="macos-input"
                  placeholder="e.g. +1 (555) 839-2041"
                  value={credsForm.displayNumber}
                  onChange={(e) => setCredsForm({ ...credsForm, displayNumber: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="macos-btn-secondary"
                  onClick={() => setShowCredsModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="macos-btn-primary"
                  disabled={credsSubmitting || !credsForm.accessToken.trim() || !credsForm.phoneNumberId.trim()}
                >
                  {credsSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Verifying with Meta...
                    </>
                  ) : (
                    'Save & Verify Credentials'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
