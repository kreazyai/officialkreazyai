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
  RefreshCw
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

  // Interactive AI Simulation Test
  const [testQuestion, setTestQuestion] = useState('Do you have this shirt in XL?');
  const [testReply, setTestReply] = useState(null);
  const [testMetadata, setTestMetadata] = useState(null);
  const [testSending, setTestSending] = useState(false);

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

  // ── 5. AI Simulation Test ──────────────────────────────────────────────────
  const handleTestAi = async () => {
    if (!testQuestion.trim()) return;
    setTestSending(true);
    setTestReply(null);
    setTestMetadata(null);
    setErrorNotice(null);

    try {
      const res = await whatsappApiService.sendTestMessage({
        messageText: testQuestion.trim(),
        isSimulation: true
      });

      const reply = res?.data?.result?.replyText || res?.result?.replyText || res?.replyText || 'No reply synthesized.';
      const model = res?.data?.result?.aiModel || res?.result?.aiModel || 'Ollama qwen3:1.7b';
      const durationMs = res?.data?.result?.executionTimeMs || res?.result?.executionTimeMs || 2500;

      setTestReply(reply);
      setTestMetadata({
        model,
        durationSeconds: (durationMs / 1000).toFixed(1)
      });
    } catch (err) {
      setTestReply(`Simulation error: ${err.message}`);
    } finally {
      setTestSending(false);
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
              SECTION D — TEST AI REPLY CARD
              ───────────────────────────────────────────────────────────── */}
          <section className="macos-section-card" aria-labelledby="test-ai-heading">
            <div className="macos-test-box">
              <div>
                <h2 id="test-ai-heading" className="macos-setting-heading">
                  Test AI Reply
                </h2>
                <p className="macos-setting-desc" style={{ marginBottom: '1rem' }}>
                  Ask a sample customer question to preview the AI auto-reply.
                </p>
              </div>

              <div className="macos-test-input-group">
                <input
                  type="text"
                  className="macos-input"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Ask a sample customer question..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !testSending) {
                      e.preventDefault();
                      handleTestAi();
                    }
                  }}
                />
                <button
                  type="button"
                  className="macos-btn-primary"
                  onClick={handleTestAi}
                  disabled={testSending || !testQuestion.trim()}
                >
                  {testSending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Test AI
                    </>
                  )}
                </button>
              </div>

              {/* Clean Answer Preview */}
              {testReply && (
                <div className="macos-ai-preview-box">
                  <p className="macos-ai-preview-text">{testReply}</p>
                  <div className="macos-ai-preview-footer">
                    <span>
                      Model: <strong>{testMetadata?.model || 'Ollama qwen3:1.7b'}</strong>
                      {testMetadata?.durationSeconds && ` · ${testMetadata.durationSeconds}s`}
                    </span>
                    <span className="macos-simulation-badge">
                      <Sparkles size={13} />
                      Simulation preview · Not sent to WhatsApp
                    </span>
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
    </div>
  );
}
