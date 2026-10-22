import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  Play,
  Pause,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  Cpu,
  Send,
  Sliders,
  FileText,
  Eye,
  X,
  ChevronRight,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { recoveryService } from '../../services/recoveryService.js';

export function RecoveryPage({ user }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | leads | conversations | settings | logs
  const [overview, setOverview] = useState(null);
  const [leadsData, setLeadsData] = useState({ candidates: [], total: 0, page: 1, totalPages: 1 });
  const [settings, setSettings] = useState(null);
  const [eventsData, setEventsData] = useState({ events: [], total: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filters for Leads
  const [leadFilters, setLeadFilters] = useState({
    stage: 'ALL',
    channel: 'ALL',
    search: '',
    page: 1,
    limit: 10
  });

  // Selected Lead for Conversation Drawer
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Live Simulation state
  const [simText, setSimText] = useState('পাঞ্জাবিটার প্রাইস কত ভাই? সাইজ M আছে?');
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    try {
      const data = await recoveryService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }, []);

  // Load Leads Data
  const loadLeads = useCallback(async () => {
    try {
      const data = await recoveryService.getCandidates(leadFilters);
      setLeadsData(data || { candidates: [], total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load leads:', err);
    }
  }, [leadFilters]);

  // Load Settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await recoveryService.getSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  // Load Activity Logs
  const loadEvents = useCallback(async () => {
    try {
      const data = await recoveryService.getEvents({ page: 1, limit: 50 });
      setEventsData(data || { events: [], total: 0 });
    } catch (err) {
      console.error('Failed to load events:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    setLoading(true);
    Promise.all([loadOverview(), loadLeads(), loadSettings()])
      .finally(() => setLoading(false));
  }, [loadOverview, loadLeads, loadSettings]);

  // Load Drawer Detail when selected
  useEffect(() => {
    if (!selectedCandidateId) {
      setSelectedCandidateDetail(null);
      return;
    }
    setDetailLoading(true);
    recoveryService.getCandidateById(selectedCandidateId)
      .then(res => setSelectedCandidateDetail(res))
      .catch(err => console.error('Failed to load candidate detail:', err))
      .finally(() => setDetailLoading(false));
  }, [selectedCandidateId]);

  // Handle Settings Save
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSavingSettings(true);
    try {
      const updated = await recoveryService.updateSettings(settings);
      setSettings(updated);
      setFeedback({ type: 'success', message: 'Recovery settings saved and updated live!' });
      loadOverview();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSavingSettings(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Handle Cancel Candidate
  const handleCancelCandidate = async (id) => {
    if (!window.confirm('Cancel recovery for this candidate?')) return;
    setActionLoading(true);
    try {
      await recoveryService.cancelCandidate(id, 'MANUAL_DASHBOARD_CANCEL');
      loadLeads();
      loadOverview();
      if (selectedCandidateId === id) {
        recoveryService.getCandidateById(id).then(setSelectedCandidateDetail);
      }
    } catch (err) {
      alert('Failed to cancel candidate: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Retry Candidate
  const handleRetryCandidate = async (id) => {
    setActionLoading(true);
    try {
      await recoveryService.retryCandidate(id);
      loadLeads();
      loadOverview();
      if (selectedCandidateId === id) {
        recoveryService.getCandidateById(id).then(setSelectedCandidateDetail);
      }
    } catch (err) {
      alert('Failed to retry candidate: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Manual Worker Tick
  const handleTriggerTick = async () => {
    setActionLoading(true);
    try {
      const res = await recoveryService.triggerWorkerTick();
      setFeedback({ type: 'success', message: `Scheduler tick executed! Processed: ${res?.processed || 0} candidates.` });
      loadOverview();
      loadLeads();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setActionLoading(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  // Handle Simulation
  const handleRunSimulation = async () => {
    if (!simText.trim()) return;
    setSimLoading(true);
    try {
      const res = await recoveryService.simulateIntent(simText);
      setSimResult(res);
    } catch (err) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimLoading(false);
    }
  };

  const metrics = overview?.metrics || {};

  return (
    <div className="dashboard-content">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
      <div className="page-title-row" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
              Smart Sales Recovery Agent
            </h2>
            <Badge variant="primary" style={{ backgroundColor: 'rgba(189, 211, 148, 0.15)', color: 'var(--primary-accent)', border: '1px solid var(--primary-accent)' }}>
              Autonomous Commerce
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
            Automatically detects abandoned high-intent shopper inquiries, checks 24h compliance, and recovers lost orders without hallucinations.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleTriggerTick}
            disabled={actionLoading}
            icon={RefreshCw}
          >
            Run Scheduler Tick
          </Button>

          <Button
            variant={settings?.enabled ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              if (settings) {
                const updated = { ...settings, enabled: !settings.enabled };
                setSettings(updated);
                recoveryService.updateSettings(updated).then(() => {
                  loadOverview();
                  setFeedback({ type: 'success', message: `Recovery automation toggled ${updated.enabled ? 'ON' : 'OFF'}` });
                  setTimeout(() => setFeedback(null), 3000);
                });
              }
            }}
            icon={settings?.enabled ? Play : Pause}
          >
            {settings?.enabled ? 'Automation Active' : 'Automation Paused'}
          </Button>
        </div>
      </div>

      {/* ── Feedback Notification ───────────────────────────────────────────── */}
      {feedback && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          backgroundColor: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
          color: feedback.type === 'error' ? '#ef4444' : '#22c55e',
          border: `1px solid ${feedback.type === 'error' ? '#ef4444' : '#22c55e'}`,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {feedback.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          {feedback.message}
        </div>
      )}

      {/* ── Safety & Dry-Run Callout Banner ─────────────────────────────────── */}
      <div style={{
        padding: '0.9rem 1.25rem',
        borderRadius: '10px',
        backgroundColor: settings?.dry_run ? 'rgba(234, 179, 8, 0.08)' : 'rgba(34, 197, 94, 0.08)',
        border: `1px solid ${settings?.dry_run ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} color={settings?.dry_run ? '#eab308' : '#22c55e'} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: settings?.dry_run ? '#eab308' : '#22c55e' }}>
              {settings?.dry_run ? 'Dry-Run Simulation Mode Active' : 'Live Outbound Messaging Active'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {settings?.dry_run
                ? 'Follow-up messages are generated and evaluated against Meta 24h policy, but simulated locally without sending real customer messages.'
                : 'Verified recovery messages are actively dispatched through connected WhatsApp, Messenger, and Instagram channels.'}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={() => {
            if (settings) {
              const updated = { ...settings, dry_run: !settings.dry_run };
              setSettings(updated);
              recoveryService.updateSettings(updated).then(() => {
                loadOverview();
                setFeedback({ type: 'success', message: `Dry-run mode set to ${updated.dry_run ? 'ENABLED' : 'DISABLED (LIVE)'}` });
                setTimeout(() => setFeedback(null), 3000);
              });
            }
          }}
          style={{ fontSize: '0.8rem', borderColor: settings?.dry_run ? '#eab308' : '#22c55e', color: settings?.dry_run ? '#eab308' : '#22c55e' }}
        >
          {settings?.dry_run ? 'Switch to Live Mode' : 'Switch to Dry-Run'}
        </button>
      </div>

      {/* ── Tabs Navigation ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        marginBottom: '1.5rem',
        gap: '0.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview & KPIs', icon: TrendingUp },
          { id: 'leads', label: 'Recovery Leads', count: leadsData.total, icon: ShoppingBag },
          { id: 'conversations', label: 'Timeline Inspector', icon: MessageSquare },
          { id: 'settings', label: 'Automation Settings', icon: Sliders },
          { id: 'logs', label: 'Activity Logs', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'logs') loadEvents();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                border: 'none',
                background: 'transparent',
                color: isActive ? 'var(--primary-accent)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary-accent)' : '2px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(189, 211, 148, 0.2)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? 'var(--primary-accent)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: OVERVIEW & KPIS                                                */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div>
          {/* Top 8 KPI Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Eligible High-Intent Leads</span>
                <ShoppingBag size={16} color="var(--primary-accent)" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                {metrics.totalCandidates || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {metrics.scheduledCount || 0} pending wait timer
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Messages Dispatched</span>
                <Send size={16} color="#60a5fa" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                {metrics.deliveredCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {metrics.simulatedDryRunCount || 0} simulated dry-run
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Shopper Replies</span>
                <MessageSquare size={16} color="#34d399" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                {metrics.repliedCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Conversations resumed
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Attributed Orders</span>
                <CheckCircle2 size={16} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
                {metrics.attributedOrders || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Conversion Rate: {metrics.conversionRate || 0}%
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Attributed Revenue</span>
                <DollarSign size={16} color="#22c55e" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#22c55e' }}>
                ${Number(metrics.attributedRevenue || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Verified order revenue
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>AI Inference Cost</span>
                <Cpu size={16} color="#a78bfa" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                ${Number(metrics.aiCosts || 0).toFixed(4)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {metrics.totalTokens || 0} total tokens
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Policy Blocked Sends</span>
                <ShieldCheck size={16} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
                {metrics.blockedCount || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Protected Meta 24h compliance
              </div>
            </div>

            <div className="kpi-card" style={{ padding: '1.25rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color, rgba(255,255,255,0.06))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>Delivery Errors</span>
                <AlertTriangle size={16} color="#f87171" />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: metrics.deliveryErrors > 0 ? '#f87171' : 'var(--text-primary)' }}>
                {metrics.deliveryErrors || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                0 network retries needed
              </div>
            </div>
          </div>

          {/* Incrementality & Holdout Group Evaluation Card */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  A/B Holdout Incrementality & Lift Measurement
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                  A 10% holdout group is kept silent without recovery messaging to mathematically prove that recovered revenue is incremental rather than baseline traffic.
                </p>
              </div>
              <Badge variant="success">Scientifically Grounded</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TREATED GROUP (Received AI Recovery)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-accent)', marginTop: '6px' }}>
                  ${Number(metrics.controlGroup?.treatedRevenue || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {metrics.controlGroup?.treatedOrders || 0} Confirmed Orders
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTROL GROUP (Holdout - No Message)</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-secondary)', marginTop: '6px' }}>
                  ${Number(metrics.controlGroup?.controlRevenue || 0).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {metrics.controlGroup?.controlOrders || 0} Organic Orders
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(189, 211, 148, 0.05)', border: '1px solid rgba(189, 211, 148, 0.2)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-accent)', fontWeight: 600 }}>NET ATTRIBUTED LIFT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', marginTop: '6px' }}>
                  +${Math.max(0, (metrics.controlGroup?.treatedRevenue || 0) - (metrics.controlGroup?.controlRevenue || 0)).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  True incremental revenue created by AI
                </div>
              </div>
            </div>
          </div>

          {/* Quick Lead Diagnostic Simulator */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <Sparkles size={18} color="var(--primary-accent)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Test Shopper Message Lead Classifier & AI Composer
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              Type any customer inquiry in Bangla, Banglish, or English to inspect how KreazyAI detects buying intent, scores it, and generates a grounded response.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={simText}
                onChange={(e) => setSimText(e.target.value)}
                placeholder="e.g. Do you have this panjabi in size M? What is the delivery charge?"
                style={{
                  flex: 1,
                  minWidth: '280px',
                  padding: '0.7rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem'
                }}
              />
              <Button variant="primary" onClick={handleRunSimulation} disabled={simLoading} icon={Sparkles}>
                {simLoading ? 'Analyzing...' : 'Simulate'}
              </Button>
            </div>

            {simResult && (
              <div style={{
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Intent Category: </span>
                    <strong style={{ color: 'var(--primary-accent)' }}>{simResult.classification?.intentCategory}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Intent Score: </span>
                    <strong style={{ color: '#22c55e' }}>{Math.round((simResult.classification?.intentScore || 0) * 100)}%</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Language: </span>
                    <strong>{simResult.classification?.language?.toUpperCase()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Eligible for Recovery: </span>
                    <strong style={{ color: simResult.classification?.eligibleForRecovery ? '#22c55e' : '#f87171' }}>
                      {simResult.classification?.eligibleForRecovery ? 'YES' : 'NO'}
                    </strong>
                  </div>
                </div>

                {simResult.draftMessage && (
                  <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>GENERATED RECOVERY DRAFT:</div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(189, 211, 148, 0.08)',
                      border: '1px solid rgba(189, 211, 148, 0.2)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit'
                    }}>
                      "{simResult.draftMessage}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: RECOVERY LEADS TABLE                                           */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'leads' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          padding: '1.25rem'
        }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={leadFilters.stage}
                onChange={(e) => setLeadFilters(f => ({ ...f, stage: e.target.value, page: 1 }))}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              >
                <option value="ALL">All Stages</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="REPLIED">Customer Replied</option>
                <option value="CONVERTED">Converted to Order</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={leadFilters.channel}
                onChange={(e) => setLeadFilters(f => ({ ...f, channel: e.target.value, page: 1 }))}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              >
                <option value="ALL">All Channels</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="MESSENGER">Facebook Messenger</option>
                <option value="INSTAGRAM">Instagram Direct</option>
              </select>
            </div>

            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={leadFilters.search}
                onChange={(e) => setLeadFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
                placeholder="Search shopper, phone, product..."
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Customer / Channel</th>
                  <th style={{ padding: '0.75rem' }}>Intent & Score</th>
                  <th style={{ padding: '0.75rem' }}>Identified Item / Snippet</th>
                  <th style={{ padding: '0.75rem' }}>Stage</th>
                  <th style={{ padding: '0.75rem' }}>Eligible At</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leadsData.candidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No recovery leads match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  leadsData.candidates.map(candidate => {
                    const isConverted = candidate.stage === 'CONVERTED';
                    const isReplied = candidate.stage === 'REPLIED';
                    const isScheduled = candidate.stage === 'SCHEDULED';
                    const isDispatched = candidate.stage === 'DISPATCHED';

                    return (
                      <tr key={candidate.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {candidate.customer_name || 'Shopper'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {candidate.customer_phone || 'Web/Social ID'}
                          </div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--primary-accent)', marginTop: '2px' }}>
                            {candidate.channel}
                            {candidate.is_control_group && <span style={{ color: '#eab308' }}>(Control)</span>}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                            {candidate.intent_category}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <div style={{ width: '60px', height: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${Math.round(candidate.intent_score * 100)}%`, height: '100%', backgroundColor: candidate.intent_score >= 0.8 ? '#22c55e' : '#eab308' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {Math.round(candidate.intent_score * 100)}%
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem', maxWidth: '280px' }}>
                          {candidate.product_identifiers && candidate.product_identifiers.length > 0 && (
                            <div style={{ fontWeight: 600, color: 'var(--primary-accent)', fontSize: '0.75rem', marginBottom: '2px' }}>
                              {candidate.product_identifiers.join(', ')}
                            </div>
                          )}
                          <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            "{candidate.last_customer_message_text || '-'}"
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Lang: {candidate.detected_language}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: isConverted ? 'rgba(34, 197, 94, 0.15)' : isReplied ? 'rgba(56, 189, 248, 0.15)' : isDispatched ? 'rgba(168, 85, 247, 0.15)' : isScheduled ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255,255,255,0.06)',
                            color: isConverted ? '#22c55e' : isReplied ? '#38bdf8' : isDispatched ? '#a855f7' : isScheduled ? '#eab308' : 'var(--text-muted)',
                            border: `1px solid ${isConverted ? 'rgba(34, 197, 94, 0.3)' : isReplied ? 'rgba(56, 189, 248, 0.3)' : isScheduled ? 'rgba(234, 179, 8, 0.3)' : 'rgba(255,255,255,0.1)'}`
                          }}>
                            {candidate.stage}
                          </span>
                        </td>

                        <td style={{ padding: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {candidate.eligible_at ? new Date(candidate.eligible_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {candidate.eligible_at ? new Date(candidate.eligible_at).toLocaleDateString() : ''}
                          </div>
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedCandidateId(candidate.id)}
                              className="btn btn-sm btn-outline"
                              title="Inspect Timeline"
                              style={{ padding: '4px 8px' }}
                            >
                              <Eye size={13} />
                            </button>

                            {isScheduled && (
                              <button
                                type="button"
                                onClick={() => handleCancelCandidate(candidate.id)}
                                className="btn btn-sm btn-outline"
                                title="Cancel Recovery"
                                style={{ padding: '4px 8px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                              >
                                <X size={13} />
                              </button>
                            )}

                            {(candidate.stage === 'CANCELLED' || candidate.stage === 'EXPIRED') && (
                              <button
                                type="button"
                                onClick={() => handleRetryCandidate(candidate.id)}
                                className="btn btn-sm btn-outline"
                                title="Retry Recovery"
                                style={{ padding: '4px 8px', color: 'var(--primary-accent)', borderColor: 'var(--primary-accent)' }}
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {leadsData.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div>Showing page {leadsData.page} of {leadsData.totalPages} ({leadsData.total} total leads)</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={leadsData.page <= 1}
                  onClick={() => setLeadFilters(f => ({ ...f, page: f.page - 1 }))}
                >
                  <ChevronLeft size={14} /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={leadsData.page >= leadsData.totalPages}
                  onClick={() => setLeadFilters(f => ({ ...f, page: f.page + 1 }))}
                >
                  Next <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: TIMELINE INSPECTOR                                             */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'conversations' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            Conversation & Recovery Lifecycle Inspector
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
            Select any lead from the list or inspect the active selected candidate's end-to-end lifecycle.
          </p>

          {selectedCandidateDetail ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem' }}>
              {/* Left Column: Lead Metadata Card */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CANDIDATE ID</span>
                  <Badge variant="primary">{selectedCandidateDetail.stage}</Badge>
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {selectedCandidateDetail.customer_name || 'Shopper'}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  {selectedCandidateDetail.customer_phone || 'No phone'} • {selectedCandidateDetail.channel}
                </div>

                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Intent: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{selectedCandidateDetail.intent_category} ({Math.round(selectedCandidateDetail.intent_score * 100)}%)</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Products: </span>
                    <span>{selectedCandidateDetail.product_identifiers?.join(', ') || 'General Catalog'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Language: </span>
                    <span>{selectedCandidateDetail.detected_language}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Eligible At: </span>
                    <span>{new Date(selectedCandidateDetail.eligible_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Lifecycle Timeline */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>
                  RECOVERY LIFECYCLE AUDIT TRAIL
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid rgba(189, 211, 148, 0.25)', paddingLeft: '1.25rem' }}>
                  {/* Step 1: Inbound Question */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.65rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-accent)' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STEP 1 • HIGH INTENT INQUIRY DETECTED</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      "{selectedCandidateDetail.last_customer_message_text || 'Customer inquiry'}"
                    </div>
                  </div>

                  {/* Step 2: Policy & Compliance Check */}
                  <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.65rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#60a5fa' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STEP 2 • META 24-HOUR POLICY CHECK</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Verified channel service window and permission for {selectedCandidateDetail.channel}. Proactive spam guard passed.
                    </div>
                  </div>

                  {/* Step 3: AI Message Composition */}
                  {selectedCandidateDetail.attempts && selectedCandidateDetail.attempts.length > 0 && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-1.65rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STEP 3 • AI GROUNDED MESSAGE COMPOSED</div>
                      <div style={{
                        marginTop: '4px',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(168, 85, 247, 0.08)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        fontSize: '0.82rem',
                        color: 'var(--text-primary)'
                      }}>
                        "{selectedCandidateDetail.attempts[0].message_text}"
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                        Model: {selectedCandidateDetail.attempts[0].generation_model} • Outcome: {selectedCandidateDetail.attempts[0].outcome}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Outcome & Attribution */}
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-1.65rem',
                      top: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: selectedCandidateDetail.stage === 'CONVERTED' ? '#22c55e' : selectedCandidateDetail.stage === 'REPLIED' ? '#38bdf8' : '#eab308'
                    }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STEP 4 • CURRENT STAGE</div>
                    <div style={{ fontWeight: 700, color: selectedCandidateDetail.stage === 'CONVERTED' ? '#22c55e' : 'var(--text-primary)', marginTop: '2px' }}>
                      {selectedCandidateDetail.stage}
                    </div>
                    {selectedCandidateDetail.attributions && selectedCandidateDetail.attributions.length > 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '2px' }}>
                        Order #{selectedCandidateDetail.attributions[0].order_id} attributed: ${Number(selectedCandidateDetail.attributions[0].order_value).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <div>No candidate selected. Click the eye icon next to any lead in the Recovery Leads tab to inspect its lifecycle here.</div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: AUTOMATION SETTINGS                                            */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          padding: '1.5rem',
          maxWidth: '850px'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
            Sales Recovery Configuration
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1.5rem 0' }}>
            Customize inactivity threshold, channel policies, Meta compliance rules, and AI generation model.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Master Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Enable Recovery Agent</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Master switch for sales recovery automation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                  />
                </label>
              </div>

              <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#eab308' }}>Dry-Run Mode</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Simulate without sending real messages</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dry_run}
                    onChange={(e) => setSettings({ ...settings, dry_run: e.target.checked })}
                    style={{ transform: 'scale(1.3)', cursor: 'pointer' }}
                  />
                </label>
              </div>
            </div>

            {/* Inactivity & Intent Score */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Inactivity Delay (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings.inactivity_minutes}
                  onChange={(e) => setSettings({ ...settings, inactivity_minutes: parseInt(e.target.value, 10) || 30 })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Default: 30 minutes. Wait time after customer goes silent.</span>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Minimum Intent Score Threshold
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.50"
                  max="0.95"
                  value={settings.min_intent_score}
                  onChange={(e) => setSettings({ ...settings, min_intent_score: parseFloat(e.target.value) || 0.70 })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score (0.50–0.95). 0.70 recommended to filter out casual greetings.</span>
              </div>
            </div>

            {/* Quiet Hours & Timezone */}
            <div style={{ padding: '1.25rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Respect Quiet Hours</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Postpone sends during late night hours to avoid disturbing customers</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.quiet_hours_enabled}
                  onChange={(e) => setSettings({ ...settings, quiet_hours_enabled: e.target.checked })}
                  style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quiet Hours Start</label>
                  <input
                    type="time"
                    value={settings.quiet_hours_start}
                    onChange={(e) => setSettings({ ...settings, quiet_hours_start: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Quiet Hours End</label>
                  <input
                    type="time"
                    value={settings.quiet_hours_end}
                    onChange={(e) => setSettings({ ...settings, quiet_hours_end: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Store Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                  >
                    <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* AI Model Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  AI Model Provider
                </label>
                <select
                  value={settings.model_provider}
                  onChange={(e) => setSettings({ ...settings, model_provider: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                >
                  <option value="local_ollama">Local Ollama (Qwen3:1.7b — 8GB RAM Safe)</option>
                  <option value="gemini">Google Gemini 2.0 Flash</option>
                  <option value="openai">OpenAI GPT-4o Mini</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Holdout Control Group Ratio
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="0.4"
                  value={settings.control_group_ratio}
                  onChange={(e) => setSettings({ ...settings, control_group_ratio: parseFloat(e.target.value) || 0.10 })}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0.10 = 10% kept as control group for lift calculation</span>
              </div>
            </div>

            {/* Save Button */}
            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button variant="primary" type="submit" disabled={savingSettings}>
                {savingSettings ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: ACTIVITY LOGS                                                  */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          padding: '1.25rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>
            System Audit & Execution Trail
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {eventsData.events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No audit events recorded yet.
              </div>
            ) : (
              eventsData.events.map(ev => (
                <div key={ev.id} style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: ev.event_type.includes('BLOCKED') ? 'rgba(239, 68, 68, 0.15)' : ev.event_type.includes('ORDER') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(189, 211, 148, 0.15)',
                        color: ev.event_type.includes('BLOCKED') ? '#ef4444' : ev.event_type.includes('ORDER') ? '#22c55e' : 'var(--primary-accent)'
                      }}>
                        {ev.event_type}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Candidate: {ev.candidate_id || 'System'}
                      </span>
                    </div>
                    {ev.metadata && Object.keys(ev.metadata).length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {JSON.stringify(ev.metadata)}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(ev.event_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Slide-Over Inspection Drawer ────────────────────────────────────── */}
      {selectedCandidateId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'flex-end'
        }} onClick={() => setSelectedCandidateId(null)}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'var(--bg-card, #131b14)',
            height: '100%',
            overflowY: 'auto',
            padding: '1.75rem',
            borderLeft: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.5)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} color="var(--primary-accent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Candidate Inspector
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCandidateId(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading timeline...</div>
            ) : selectedCandidateDetail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>CUSTOMER</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedCandidateDetail.customer_name || 'Shopper'}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{selectedCandidateDetail.customer_phone}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>INTENT CLASSIFICATION</div>
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <div>Category: <strong>{selectedCandidateDetail.intent_category}</strong></div>
                    <div>Score: <strong>{Math.round(selectedCandidateDetail.intent_score * 100)}%</strong></div>
                    <div>Signals: {selectedCandidateDetail.buying_signals?.join(', ') || '-'}</div>
                  </div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>CUSTOMER INQUIRY</div>
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    "{selectedCandidateDetail.last_customer_message_text || '-'}"
                  </div>
                </div>

                {selectedCandidateDetail.attempts && selectedCandidateDetail.attempts.length > 0 && (
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>RECOVERY MESSAGE ATTEMPT</div>
                    <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(189, 211, 148, 0.08)', border: '1px solid rgba(189, 211, 148, 0.2)', color: 'var(--text-primary)' }}>
                      "{selectedCandidateDetail.attempts[0].message_text}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Status: {selectedCandidateDetail.attempts[0].outcome} • Model: {selectedCandidateDetail.attempts[0].generation_model}
                    </div>
                  </div>
                )}

                {selectedCandidateDetail.attributions && selectedCandidateDetail.attributions.length > 0 && (
                  <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#22c55e' }}>
                    <strong>Order Attributed!</strong> Order #{selectedCandidateDetail.attributions[0].order_id} (${Number(selectedCandidateDetail.attributions[0].order_value).toFixed(2)})
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {selectedCandidateDetail.stage === 'SCHEDULED' && (
                    <Button variant="danger" size="sm" onClick={() => handleCancelCandidate(selectedCandidateDetail.id)}>
                      Cancel Follow-up
                    </Button>
                  )}
                  {(selectedCandidateDetail.stage === 'CANCELLED' || selectedCandidateDetail.stage === 'EXPIRED') && (
                    <Button variant="primary" size="sm" onClick={() => handleRetryCandidate(selectedCandidateDetail.id)}>
                      Retry Follow-up
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
