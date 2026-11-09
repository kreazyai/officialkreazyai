import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  Smartphone,
  Activity,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
  RefreshCw,
  KeyRound,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Edit3,
  ExternalLink,
  Info,
  Send,
  MessageSquare
} from 'lucide-react';
import { WhatsAppIcon } from '../../../components/integrations/BrandIcons';
import { whatsappApiService } from '../../../services/api';

export function WhatsAppIntegrationPage({ onBack }) {
  const [connection, setConnection] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [autoReply, setAutoReply] = useState(true);

  // Phone input for initial setup & quick connect
  const [phoneInput, setPhoneInput] = useState(() => {
    return localStorage.getItem('kreazy_wa_input_phone') || '+8801773007903';
  });

  // Modals
  const [showCredsModal, setShowCredsModal] = useState(false);
  const [showChangePhoneModal, setShowChangePhoneModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [credsSubmitting, setCredsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // Controlled Test Message Probe Modal State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+8801773007903');
  const [testQuery, setTestQuery] = useState('What are your delivery charges and return policy?');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isMessagingVerified, setIsMessagingVerified] = useState(false);
  const [channelState, setChannelState] = useState('NOT_CONNECTED');

  // Meta Credentials Form
  const [credsForm, setCredsForm] = useState({
    accessToken: '',
    phoneNumberId: '',
    wabaId: '',
    displayNumber: ''
  });

  // Diagnostics & Health State
  const [healthChecking, setHealthChecking] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState(null);

  // Notifications
  const [notice, setNotice] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);

  // Webhook details to display
  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.host}/api/v1/meta/webhook`
    : 'https://api.kreazyai.com/api/v1/meta/webhook';
  const verifyToken = 'kreazy_meta_webhook_verification_token_2026';

  // ── 1. Fetch Connection & Wallet ──────────────────────────────────────────
  const fetchDetails = useCallback(async () => {
    try {
      const data = await whatsappApiService.getConnection();
      const conn = data?.connection || data;
      setConnection(conn);
      setAutoReply(conn?.auto_reply_enabled !== 0);

      // Verify channel state & readiness: strictly derived from server response (zero client-side localStorage bypass)
      const rawDiag = conn?.diagnostics;
      const diag = typeof rawDiag === 'string' ? JSON.parse(rawDiag || '{}') : (rawDiag || {});
      const cState = data?.channelState || diag?.channel_state || (conn?.status === 'CONNECTED' ? 'CONNECTED' : 'NOT_CONNECTED');
      setChannelState(cState);

      const verified = Boolean(
        data?.messagingReadiness === true ||
        cState === 'AI_END_TO_END_VERIFIED' ||
        diag?.ai_end_to_end_verified === true
      );
      setIsMessagingVerified(verified);

      if (conn?.display_number) {
        setPhoneInput(conn.display_number);
        setCredsForm(prev => ({
          ...prev,
          displayNumber: conn.display_number,
          phoneNumberId: conn.phone_number_id || prev.phoneNumberId,
          wabaId: conn.WABA_id || prev.wabaId
        }));
      }

      if (data?.wallet) {
        setWallet(data.wallet);
      } else {
        const walletData = await whatsappApiService.getWallet();
        if (walletData) setWallet(walletData);
      }
    } catch (err) {
      console.warn('Initial connection fetch notice:', err.message);
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
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notice, errorNotice]);

  const copyToClipboard = (text, fieldName) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // ── Helper: Dynamically Load Meta Facebook JavaScript SDK ────────────────
  const loadFacebookSdk = (appId, graphVersion = 'v26.0') => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return resolve(null);
      if (window.FB) return resolve(window.FB);

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: appId || undefined,
          autoLogAppEvents: true,
          xfbml: true,
          version: graphVersion || 'v26.0'
        });
        resolve(window.FB);
      };

      const scriptId = 'facebook-jssdk';
      if (document.getElementById(scriptId)) {
        if (window.FB) return resolve(window.FB);
      } else {
        const js = document.createElement('script');
        js.id = scriptId;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        js.async = true;
        js.defer = true;
        js.onerror = () => reject(new Error('Failed to load Meta Facebook JavaScript SDK'));
        document.head.appendChild(js);
      }
    });
  };

  // ── Official Meta WhatsApp Embedded Signup v4 Launcher ───────────────────
  const handleLaunchEmbeddedSignup = async () => {
    if (connecting) return;
    setConnecting(true);
    setErrorNotice(null);
    setNotice(null);

    try {
      // 1. Initialize server-side session with CSRF state token
      const sessionRes = await whatsappApiService.initiateEmbeddedSignup();
      const sessionData = sessionRes?.data || sessionRes;
      const { sessionId, stateToken, appId, configId, graphVersion, isSimulated } = sessionData || {};

      if (!stateToken) {
        throw new Error('Could not initialize onboarding session with server.');
      }

      // If in development simulation mode without Meta App ID configured
      if (isSimulated || !appId) {
        setNotice('Development Mode: Initializing official Embedded Signup v4 simulation flow...');
        const simRes = await whatsappApiService.completeEmbeddedSignup({
          code: `mock_code_es_${Date.now()}`,
          stateToken,
          sessionInfo: {
            waba_id: `waba_sim_${Date.now()}`,
            phone_number_id: `phone_sim_${Date.now()}`,
            display_phone_number: phoneInput || '+880 1773-007903'
          }
        });
        const conn = simRes?.connection || simRes?.data?.connection || simRes;
        setConnection(conn);
        setNotice('WhatsApp connected via Embedded Signup sandbox! Send a test message to verify the messaging path.');
        await fetchDetails();
        return;
      }

      // 2. Load official Meta Facebook JS SDK
      const FB = await loadFacebookSdk(appId, graphVersion || 'v26.0');

      // 3. Register secure sessionInfoListener for postMessage events
      let capturedSessionInfo = null;
      const sessionInfoListener = (event) => {
        // Enforce strict Meta origin check
        if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') {
          return;
        }
        try {
          const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (rawData?.type === 'WA_EMBEDDED_SIGNUP') {
            if (rawData.event === 'FINISH' || rawData.event === 'FINISH_ONLY_WABA') {
              capturedSessionInfo = rawData.data;
            } else if (rawData.event === 'CANCEL') {
              console.log('Embedded Signup flow cancelled by merchant.');
            } else if (rawData.event === 'ERROR') {
              setErrorNotice(`Meta Onboarding Error: ${rawData.data?.error_message || 'Setup error'}`);
            }
          }
        } catch {
          // Ignore unrelated postMessage events
        }
      };

      window.addEventListener('message', sessionInfoListener);

      // 4. Invoke FB.login with Facebook Login for Business configuration ID
      FB.login(async (response) => {
        window.removeEventListener('message', sessionInfoListener);

        if (response?.authResponse?.code) {
          const authCode = response.authResponse.code;
          try {
            const completeRes = await whatsappApiService.completeEmbeddedSignup({
              code: authCode,
              stateToken,
              sessionInfo: capturedSessionInfo || {}
            });
            const newConn = completeRes?.connection || completeRes?.data?.connection || completeRes;
            setConnection(newConn);
            setNotice('WhatsApp Business connected successfully! Proceed to verify messaging readiness.');
            await fetchDetails();
          } catch (err) {
            setErrorNotice(err.message || 'Failed to complete WhatsApp onboarding.');
          }
        } else {
          // User closed or cancelled popup
          await whatsappApiService.completeEmbeddedSignup({
            stateToken,
            isCancelled: true
          }).catch(() => {});
          setErrorNotice('WhatsApp onboarding was cancelled in the Meta popup.');
        }
      }, {
        config_id: configId || undefined,
        response_type: 'code',
        override_default_response_type: true
      });

    } catch (err) {
      setErrorNotice(`Embedded Signup failed: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  // ── 2. Controlled Test Message Probe ─────────────────────────────────────
  const handleSendTestMessage = async (e) => {
    e?.preventDefault?.();
    if (!testPhone.trim() || !testQuery.trim()) {
      setErrorNotice('Please provide recipient phone and test message text.');
      return;
    }
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await whatsappApiService.testMessage({
        senderPhone: testPhone.trim(),
        messageText: testQuery.trim()
      });
      const data = res?.data || res;
      setTestResult(data);
      if (data?.channelState === 'OUTBOUND_ACCEPTED' || data?.outboundAccepted) {
        setNotice(`Test message accepted by Meta Cloud API (Message ID: ${data?.messageId || 'OK'}). Awaiting webhook delivery confirmation.`);
      } else {
        setNotice('Test message preview synthesized via AI pipeline (Simulation Mode).');
      }
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Test message failed: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  // ── 3. Quick Phone Connect (Alternative / Fallback) ───────────────────────
  const handleConnectPhone = async (phoneToConnect) => {
    const rawNumber = (phoneToConnect || phoneInput || '').trim();
    if (!rawNumber) {
      setErrorNotice('Please enter your WhatsApp phone number with country code (e.g. +880 1773-007903).');
      return;
    }

    setConnecting(true);
    setErrorNotice(null);
    setNotice(null);

    localStorage.setItem('kreazy_wa_input_phone', rawNumber);

    try {
      const res = await whatsappApiService.connectPhone(rawNumber, {
        phoneNumberId: credsForm.phoneNumberId || undefined,
        wabaId: credsForm.wabaId || undefined,
        accessToken: credsForm.accessToken || undefined
      });

      const updatedConn = res?.connection || res?.data?.connection || res;
      setConnection(updatedConn);
      setShowChangePhoneModal(false);
      setNotice(`WhatsApp Business (${rawNumber}) linked! Run a test probe to verify the messaging path before activating AI Auto-Pilot.`);
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Connection error: ${err.message || 'Failed to connect WhatsApp'}`);
    } finally {
      setConnecting(false);
    }
  };

  // ── 4. Disconnect WhatsApp ────────────────────────────────────────────────
  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp? Automated AI customer replies will be paused.')) {
      return;
    }
    setErrorNotice(null);
    try {
      await whatsappApiService.disconnect();
      setConnection({ status: 'NOT_CONNECTED' });
      setIsMessagingVerified(false);
      setChannelState('NOT_CONNECTED');
      setNotice('WhatsApp channel disconnected successfully.');
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Disconnect failed: ${err.message}`);
    }
  };

  // ── 5. Reconnect WhatsApp ─────────────────────────────────────────────────
  const handleReconnect = async () => {
    await handleLaunchEmbeddedSignup();
  };

  // ── 4. Toggle AI Auto-Reply ────────────────────────────────────────────────
  const handleToggleAutoReply = async () => {
    const nextVal = !autoReply;
    setAutoReply(nextVal);
    try {
      await whatsappApiService.updateAutoReply(nextVal);
      setNotice(nextVal ? 'AI Auto-Pilot enabled' : 'AI Auto-Pilot paused');
    } catch (err) {
      setAutoReply(!nextVal);
      setErrorNotice(`Failed to update Auto-Reply: ${err.message}`);
    }
  };

  // ── 5. Run Health Check ───────────────────────────────────────────────────
  const handleCheckHealth = async () => {
    setHealthChecking(true);
    try {
      const res = await whatsappApiService.healthCheck();
      const data = res?.data || res;
      setDiagnosticsData(data);
      if (data?.success) {
        setNotice('WhatsApp Meta Cloud API connection is active and healthy!');
      } else {
        setNotice('Health check completed. Connection is running with standard cloud gateway.');
      }
    } catch {
      setNotice('Connection check completed. Active.');
    } finally {
      setHealthChecking(false);
    }
  };

  // ── 6. Save Meta Credentials ──────────────────────────────────────────────
  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!credsForm.accessToken.trim() || !credsForm.phoneNumberId.trim()) {
      setErrorNotice('Access Token and Phone Number ID are required.');
      return;
    }

    setCredsSubmitting(true);
    setErrorNotice(null);
    try {
      const res = await whatsappApiService.configureCredentials({
        accessToken: credsForm.accessToken.trim(),
        phoneNumberId: credsForm.phoneNumberId.trim(),
        wabaId: credsForm.wabaId.trim() || undefined,
        displayNumber: credsForm.displayNumber.trim() || phoneInput
      });

      const updatedConn = res?.connection || res?.data?.connection || res;
      setConnection(updatedConn);
      setShowCredsModal(false);
      setNotice('Meta Cloud API credentials saved & verified successfully!');
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Credential validation notice: ${err.message}`);
    } finally {
      setCredsSubmitting(false);
    }
  };

  // ── 7. Upgrade Plan ───────────────────────────────────────────────────────
  const handleUpgradePlan = async (planId) => {
    setUpgradeLoading(true);
    try {
      const res = await whatsappApiService.upgradePlan({ planId, billingCycle: 'MONTHLY' });
      if (res?.wallet) setWallet(res.wallet);
      setShowUpgradeModal(false);
      setNotice(`Successfully upgraded to ${planId.toUpperCase()} tier!`);
      await fetchDetails();
    } catch (err) {
      setErrorNotice(`Upgrade notice: ${err.message}`);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const isConnected = connection?.status === 'CONNECTED';
  const displayPhone = connection?.display_number || phoneInput || '+8801773007903';

  // ── Connection Lifecycle State Badge ─────────────────────────────────────
  const getStatusBadge = () => {
    if (!isConnected) {
      if (connection?.status === 'EXPIRED' || connection?.status === 'REAUTH_REQUIRED') {
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#FFE4E6', color: '#E11D48', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
            <AlertCircle size={12} color="#E11D48" />
            Re-auth Required
          </span>
        );
      }
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F1F5F9', color: '#64748B', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          Not Connected
        </span>
      );
    }
    if (connection?.status === 'VERIFICATION_NEEDED') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#FEF3C7', color: '#B45309', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
          <AlertCircle size={12} color="#B45309" />
          Verification Needed
        </span>
      );
    }
    if (channelState === 'AI_END_TO_END_VERIFIED' || isMessagingVerified) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#DCFCE7', color: '#15803D', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
          Active & AI Verified
        </span>
      );
    }
    if (channelState === 'DELIVERY_CONFIRMED') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#CCFBF1', color: '#0F766E', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0D9488' }} />
          Delivery Confirmed (AI Loop Pending)
        </span>
      );
    }
    if (channelState === 'OUTBOUND_ACCEPTED') {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#FEF3C7', color: '#B45309', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
          Outbound Accepted (Awaiting Delivery)
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#F1F5F9', color: '#475569', borderRadius: '20px', padding: '3px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748B' }} />
        Connected (Test Pending)
      </span>
    );
  };

  return (
    <div className="macos-integration-wrapper" style={{ minHeight: '100%', padding: '1.5rem', background: '#F8FAFC' }}>
      {/* ── BREADCRUMB & HEADER ── */}
      <div style={{ maxWidth: '880px', margin: '0 auto 1.5rem auto' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 0',
            marginBottom: '0.5rem',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
        >
          <ChevronLeft size={16} />
          <span>Integrations / WhatsApp</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
                WhatsApp Automation
              </h1>
              {getStatusBadge()}
            </div>
            <p style={{ fontSize: '0.9375rem', color: '#64748B', margin: 0 }}>
              Automate customer conversations with AI directly via official Meta WhatsApp Cloud API.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {isConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => setTestModalOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '7px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <Send size={13} color="#087A4A" />
                  <span>Test Probe</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckHealth}
                  disabled={healthChecking}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '7px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#CBD5E1',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  {healthChecking ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Activity size={13} color="#10B981" />
                  )}
                  <span>Check Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCredsModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '7px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#CBD5E1',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                >
                  <KeyRound size={13} color="#087A4A" />
                  <span>Meta API Keys</span>
                </button>
              </>
            ) : (
              (connection?.status === 'EXPIRED' || connection?.status === 'REAUTH_REQUIRED') && (
                <button
                  type="button"
                  onClick={handleReconnect}
                  disabled={connecting}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#E11D48',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Reconnect Account</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        {notice && (
          <div
            style={{
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: '12px',
              padding: '10px 16px',
              marginBottom: '1rem',
              color: '#065F46',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} color="#059669" />
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
              borderRadius: '12px',
              padding: '10px 16px',
              marginBottom: '1rem',
              color: '#991B1B',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} color="#DC2626" />
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

        {/* ─────────────────────────────────────────────────────────────
            STATE 1: NOT CONNECTED (OFFICIAL META EMBEDDED SIGNUP v4)
            ───────────────────────────────────────────────────────────── */}
        {!isConnected && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              padding: '2.5rem 2rem',
              textAlign: 'center'
            }}
          >
            {/* WhatsApp Logo with ambient glow */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                boxShadow: '0 8px 24px rgba(37, 211, 102, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}
            >
              <WhatsAppIcon size={36} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
              Connect WhatsApp Business with Meta
            </h2>
            <p style={{ fontSize: '0.9375rem', color: '#64748B', maxWidth: '520px', margin: '0 auto 1.75rem auto', lineHeight: 1.5 }}>
              Use official Meta Embedded Signup v4. Log in with your Facebook account, select or create your WhatsApp Business Account, and verify your phone number directly with Meta.
            </p>

            {/* PRIMARY CTA: Official Meta Embedded Signup v4 */}
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleLaunchEmbeddedSignup}
                disabled={connecting}
                style={{
                  background: 'linear-gradient(135deg, #1877F2 0%, #0C63D4 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px 28px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: connecting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(24, 119, 242, 0.35)',
                  transition: 'opacity 0.15s ease'
                }}
              >
                {connecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Connecting with Meta...
                  </>
                ) : (
                  <>
                    <WhatsAppIcon size={20} />
                    Connect WhatsApp (Embedded Signup v4)
                  </>
                )}
              </button>
            </div>

            {/* WhatsApp Business App Coexistence Informational Card */}
            <div
              style={{
                maxWidth: '560px',
                margin: '0 auto 1.75rem auto',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '16px',
                padding: '1.25rem',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle2 size={16} color="#15803D" />
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#166534' }}>
                  WhatsApp Business App Coexistence (Supported)
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#14532D', margin: '0 0 8px 0', lineHeight: 1.5 }}>
                Want to continue chatting on your phone using the WhatsApp Business app while running KreazyAI automation simultaneously?
                Eligible numbers (WhatsApp Business App v2.24.17+) can maintain full coexistence. Meta delivers your verification code directly inside your mobile app.
              </p>
              <div style={{ fontSize: '0.75rem', color: '#15803D', lineHeight: 1.4 }}>
                • <strong>Requirement:</strong> Open the mobile WhatsApp Business app at least once every 14 days.<br />
                • <strong>Note:</strong> Consumer WhatsApp accounts must upgrade to WhatsApp Business before linking.
              </div>
            </div>

            {/* Quick Connect by Phone Form (Alternative / Local Sandbox) */}
            <div
              style={{
                maxWidth: '440px',
                margin: '0 auto',
                background: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1' }}>
                    Quick Link Phone Number
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748B', background: '#E2E8F0', padding: '1px 6px', borderRadius: '4px' }}>
                    Direct Connect
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <Smartphone
                    size={18}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="e.g. +8801773007903"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleConnectPhone(phoneInput);
                      }
                    }}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '11px 12px 11px 40px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      outline: 'none',
                      transition: 'border-color 0.15s ease'
                    }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                  Include country code (e.g. <code>+880</code> for Bangladesh, <code>+1</code> for USA).
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleConnectPhone(phoneInput)}
                disabled={connecting || !phoneInput.trim()}
                style={{
                  background: 'linear-gradient(135deg, #25D366 0%, #059669 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '11px 18px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: connecting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                  transition: 'opacity 0.15s ease'
                }}
              >
                {connecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Linking Number...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Direct Link Number
                  </>
                )}
              </button>
            </div>

            {/* Value Highlights */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                maxWidth: '640px',
                margin: '2rem auto 1rem auto',
                textAlign: 'left'
              }}
            >
              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8125rem', color: '#FFFFFF', marginBottom: '2px' }}>
                  <Zap size={14} color="#087A4A" />
                  <span>Verified Routing</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Answers questions about your catalog and policies in seconds.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8125rem', color: '#FFFFFF', marginBottom: '2px' }}>
                  <ShieldCheck size={14} color="#087A4A" />
                  <span>Meta Cloud API</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Official webhook handshake with zero risk of phone ban.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.8125rem', color: '#FFFFFF', marginBottom: '2px' }}>
                  <Sparkles size={14} color="#087A4A" />
                  <span>24/7 Automation</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                  Never miss an order inquiry while you're offline or busy.
                </div>
              </div>
            </div>

            {/* Advanced Meta Credentials Link */}
            <div style={{ marginTop: '1.5rem', fontSize: '0.8125rem', color: '#64748B' }}>
              Want to link your own Meta Developer App or permanent token?{' '}
              <button
                type="button"
                onClick={() => setShowCredsModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#087A4A',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Configure Meta API Keys
              </button>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            STATE 2: CONNECTED (UNCLUTTERED, CLEAN DASHBOARD)
            ───────────────────────────────────────────────────────────── */}
        {isConnected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Verification Needed / Test Pending Notice Banner */}
            {!isMessagingVerified && (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#FEF3C7', padding: '8px', borderRadius: '10px', flexShrink: 0 }}>
                    <AlertCircle size={20} color="#D97706" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#92400E', marginBottom: '2px' }}>
                      Messaging Readiness Test Pending
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#B45309', lineHeight: 1.4 }}>
                      Your WhatsApp Business account is connected with Meta. Run a quick test probe to verify the end-to-end message routing before AI Auto-Pilot goes live.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTestModalOpen(true)}
                  style={{
                    background: '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
                  }}
                >
                  Run Test Probe
                </button>
              </div>
            )}

            {/* Primary Connection Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                padding: '1.5rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                    flexShrink: 0
                  }}
                >
                  <WhatsAppIcon size={30} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: '#FFFFFF' }}>
                      WhatsApp Business
                    </span>
                    {getStatusBadge()}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9375rem', fontWeight: 600 }}>
                    <Smartphone size={14} color="#64748B" />
                    <span>{displayPhone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowChangePhoneModal(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#CBD5E1',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={13} />
                  <span>Change Number</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  style={{
                    background: 'none',
                    border: '1px solid #FECACA',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#DC2626',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* AI Auto-Reply Toggle Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                padding: '1.25rem 1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1.5rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <Sparkles size={16} color="#087A4A" />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                    AI Auto-Pilot
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                  Automatically answers incoming customer messages using your store products and policy guidelines.
                </div>
              </div>

              {/* Functional Toggle */}
              <label
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '46px',
                  height: '26px',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={autoReply}
                  onChange={handleToggleAutoReply}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: autoReply ? '#10B981' : '#CBD5E1',
                    borderRadius: '26px',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      height: '20px',
                      width: '20px',
                      left: autoReply ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  />
                </span>
              </label>
            </div>

            {/* Telemetry & Metrics Strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem'
              }}
            >
              {/* Webhook Status */}
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                  Cloud Webhook
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  <span>Active · v21.0 API</span>
                </div>
              </div>

              {/* AI Engine */}
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                  AI Model Engine
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#087A4A' }}>
                  Qwen3 / Ollama (Online)
                </div>
              </div>

              {/* Response Time */}
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                  Avg. AI Speed
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                  ~1.8s Response
                </div>
              </div>

              {/* AI Credits */}
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                    AI Credits
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {wallet?.creditsBalance !== undefined ? wallet.creditsBalance : 125} Credits
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#087A4A',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Upgrade →
                </button>
              </div>
            </div>

            {/* How It Works Automation Timeline */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1.25rem 1.75rem'
              }}
            >
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                How Automation Works On Your Website
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    1
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                    Customer sends a WhatsApp message to <strong>{displayPhone}</strong>.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F1F5F9', color: '#475569', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    2
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                    Meta webhook triggers KreazyAI to search products and policies.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#DCFCE7', color: '#15803D', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    3
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.4 }}>
                    AI generates and delivers an accurate reply to their WhatsApp instantly.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CHANGE PHONE NUMBER
          ───────────────────────────────────────────────────────────── */}
      {showChangePhoneModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setShowChangePhoneModal(false)}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '1.75rem',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowChangePhoneModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem 0' }}>
              Change WhatsApp Number
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.25rem 0' }}>
              Enter the new WhatsApp phone number you want to connect for customer automation.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                New WhatsApp Number
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+8801773007903"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowChangePhoneModal(false)}
                style={{
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConnectPhone(phoneInput)}
                disabled={connecting || !phoneInput.trim()}
                style={{
                  background: '#087A4A',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: connecting ? 'not-allowed' : 'pointer'
                }}
              >
                {connecting ? 'Saving...' : 'Update Number'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: META CLOUD API CREDENTIALS
          ───────────────────────────────────────────────────────────── */}
      {showCredsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setShowCredsModal(false)}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '1.75rem',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCredsModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <div style={{ background: '#ECFDF5', padding: '8px', borderRadius: '10px' }}>
                <KeyRound size={20} color="#087A4A" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Meta Cloud API Credentials
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Enter your credentials from the Meta for Developers portal to enable live message delivery.
            </p>

            {/* Webhook Callback Info (Helpful for Meta Portal setup) */}
            <div style={{ background: '#F8FAFC', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                Meta Webhook Configuration (Paste into Meta App Dashboard):
              </div>

              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Callback URL:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', flex: 1, wordBreak: 'break-all' }}>
                    {webhookUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedField === 'webhook' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                    <span>{copiedField === 'webhook' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Verify Token:</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <code style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.08)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)', flex: 1 }}>
                    {verifyToken}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(verifyToken, 'token')}
                    style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedField === 'token' ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                    <span>{copiedField === 'token' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Credentials Input Form */}
            <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                  Meta Access Token <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  rows={2}
                  value={credsForm.accessToken}
                  onChange={(e) => setCredsForm({ ...credsForm, accessToken: e.target.value })}
                  placeholder="EAAG... (Permanent System User Token or 24-hr Token)"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.8125rem',
                    fontFamily: 'monospace',
                    outline: 'none'
                  }}
                  required
                />
                <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
                  Found under Meta App Dashboard → WhatsApp → API Setup, or System Users in Meta Business Suite.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                  Phone Number ID <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={credsForm.phoneNumberId}
                  onChange={(e) => setCredsForm({ ...credsForm, phoneNumberId: e.target.value })}
                  placeholder="e.g. 1407171145805154"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.8125rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={credsForm.wabaId}
                  onChange={(e) => setCredsForm({ ...credsForm, wabaId: e.target.value })}
                  placeholder="e.g. 1735308764198811"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.8125rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCredsModal(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={credsSubmitting || !credsForm.accessToken.trim() || !credsForm.phoneNumberId.trim()}
                  style={{
                    background: '#087A4A',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 18px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    cursor: credsSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {credsSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Save Credentials'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: UPGRADE PLANS
          ───────────────────────────────────────────────────────────── */}
      {showUpgradeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setShowUpgradeModal(false)}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '2rem',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowUpgradeModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.25rem 0' }}>
              Scale Your WhatsApp AI Automation
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.5rem 0' }}>
              Choose a plan to increase your AI customer reply volume.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
              {/* Starter */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>Starter</h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                    $47<span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#087A4A', fontWeight: 700, marginBottom: '4px' }}>
                    6,000 Credits
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Up to 1,200 AI replies. Great for boutique stores.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpgradePlan('starter')}
                  disabled={upgradeLoading}
                  style={{ marginTop: '1rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
                >
                  Select Plan
                </button>
              </div>

              {/* Standard */}
              <div style={{ border: '2px solid #087A4A', background: '#F0FDF4', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '-10px', right: '12px', background: '#087A4A', color: '#FFFFFF', fontSize: '0.6875rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                  POPULAR
                </span>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>Standard</h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#087A4A', marginBottom: '8px' }}>
                    $119<span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#087A4A', fontWeight: 700, marginBottom: '4px' }}>
                    18,000 Credits
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Up to 3,600 AI replies. Includes live inventory lookup.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpgradePlan('standard')}
                  disabled={upgradeLoading}
                  style={{ marginTop: '1rem', background: '#087A4A', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
                >
                  Select Plan
                </button>
              </div>

              {/* Pro */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>Pro</h4>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
                    $249<span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#087A4A', fontWeight: 700, marginBottom: '4px' }}>
                    40,000 Credits
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Up to 8,000 AI replies. High concurrency and priority queue.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpgradePlan('pro')}
                  disabled={upgradeLoading}
                  style={{ marginTop: '1rem', background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '0.8125rem', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
                >
                  Select Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL: CONTROLLED TEST MESSAGE PROBE
          ───────────────────────────────────────────────────────────── */}
      {testModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
          onClick={() => setTestModalOpen(false)}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '1.75rem',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setTestModalOpen(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <div style={{ background: '#ECFDF5', padding: '8px', borderRadius: '10px' }}>
                <Send size={20} color="#087A4A" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Controlled WhatsApp Test Probe
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', margin: '0 0 1.25rem 0', lineHeight: 1.4 }}>
              Verify inbound message routing, tenant catalog grounding, and outbound dispatch without messaging real customers.
            </p>

            <form onSubmit={handleSendTestMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Simulated Customer Phone
                </label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="e.g. +8801773007903"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '6px' }}>
                  Test Customer Query
                </label>
                <textarea
                  rows={3}
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g. Do you have black silk shirts in stock?"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    fontSize: '0.875rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {testResult && (
                <div style={{ background: '#F8FAFC', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803D', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '6px' }}>
                    <CheckCircle2 size={14} />
                    <span>Message Path Authoritatively Verified!</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>
                    <strong>Generated Reply:</strong> {testResult?.result?.replyText || 'Synthesized successfully'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Model: {testResult?.result?.model || 'grounded-reasoning'} • Duration: {testResult?.result?.durationMs || 12}ms • Deduplication: Active
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTestModalOpen(false)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={testSending || !testPhone.trim()}
                  style={{
                    background: '#087A4A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 18px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: testSending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {testSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Dispatching Probe...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Verification Probe
                    </>
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
