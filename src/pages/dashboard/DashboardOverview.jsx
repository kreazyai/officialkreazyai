import React, { useState } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  MessageSquare,
  Bot,
  Zap,
  Sparkles,
  Network,
  Boxes,
  Activity,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

// Modular Command Center Components
import { KpiCard } from '../../components/dashboard/KpiCard';
import { CommerceChartCard } from '../../components/dashboard/CommerceChartCard';
import { ActivityTimeline } from '../../components/dashboard/ActivityTimeline';
import { AutomationCard } from '../../components/dashboard/AutomationCard';
import { ChannelPerformance } from '../../components/dashboard/ChannelPerformance';
import { OrderStatusChart } from '../../components/dashboard/OrderStatusChart';
import { OrderTable } from '../../components/dashboard/OrderTable';
import { ChannelHealth } from '../../components/dashboard/ChannelHealth';
import { ProductPerformance } from '../../components/dashboard/ProductPerformance';
import { ConversationAnalytics } from '../../components/dashboard/ConversationAnalytics';
import { OrderQuickModal } from '../../components/dashboard/OrderQuickModal';
import { Share2, Plus, Settings } from 'lucide-react';

/**
 * DashboardOverview — Enterprise AI Commerce Operations Command Center
 * Combines high-density operations layout with Kreazy AI dark forest green visual identity.
 */
export function DashboardOverview({ user, onNavigateModule }) {
  const isDemo = Boolean(user?.isDemo);

  // Default to empty initial state because store currently has no orders or messaging
  const [useZeroState, setUseZeroState] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeChannelFilter, setActiveChannelFilter] = useState('all');
  const [currency, setCurrency] = useState('BDT'); // 'BDT' | 'USD' | 'EUR'

  const getCurrencySign = (c) => {
    if (c === 'BDT') return '৳';
    if (c === 'EUR') return '€';
    return '$';
  };

  const formatFinancialMetric = (usdBase) => {
    if (useZeroState) {
      return `${getCurrencySign(currency)}0`;
    }
    if (currency === 'BDT') {
      return `৳${Math.round(usdBase * 120).toLocaleString()}`;
    }
    if (currency === 'EUR') {
      return `€${Math.round(usdBase * 0.92).toLocaleString()}`;
    }
    return `$${usdBase.toLocaleString()}`;
  };

  const toggleTelemetryMode = () => {
    setUseZeroState((prev) => !prev);
  };

  const channelFilters = [
    { id: 'all', label: 'All' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'facebook', label: 'Messenger' },
    { id: 'handoff', label: 'Human Handoff' },
    { id: 'catalog', label: 'Catalog Sync' }
  ];

  return (
    <div className="dashboard-content">
      {/* Page Title */}
      <div className="page-title-row">
        <h1 className="dashboard-main-heading">
          Dashboard
        </h1>
      </div>

      {/* ==============================================================
          REFERENCE DESIGN: OVERSIZED METRICS & CIRCULAR GAUGE BANNER
          ============================================================== */}
      <div className="overview-reference-hero">
        <div className="overview-hero-left">
          <h2 className="overview-hero-title">
            Autonomous<br />Commerce
          </h2>

          {/* Circular Progress Gauge */}
          <div className="overview-circular-gauge">
            <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="rgba(214, 229, 215, 0.12)"
                strokeWidth="5"
                strokeDasharray="4 4"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                fill="none"
                stroke="var(--primary-accent)"
                strokeWidth="5"
                strokeDasharray="163"
                strokeDashoffset={useZeroState ? 163 : 18}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <span className="overview-gauge-val">
              {useZeroState ? '0%' : '94%'}
            </span>
          </div>
        </div>

        {/* Financial Metrics in a dedicated Box with Currency Conversion Mode */}
        <div className="overview-financial-box">
          <div className="overview-financial-box-header">
            <span className="overview-financial-box-title">
              Financial Overview
            </span>
            <div className="overview-currency-mode-selector" role="group" aria-label="Select currency mode">
              {['BDT', 'USD', 'EUR'].map((curr) => (
                <button
                  key={curr}
                  type="button"
                  onClick={() => setCurrency(curr)}
                  className={`overview-currency-mode-btn ${currency === curr ? 'active' : ''}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="overview-financial-grid">
            <div className="overview-financial-card">
              <span className="overview-metric-label">Overall balance</span>
              <div className="overview-metric-number">
                {formatFinancialMetric(990815)}
              </div>
            </div>

            <div className="overview-financial-card">
              <span className="overview-metric-label">Monthly profits</span>
              <div className="overview-metric-number">
                {formatFinancialMetric(170520)}
              </div>
            </div>

            <div className="overview-financial-card">
              <span className="overview-metric-label">Monthly payments</span>
              <div className="overview-metric-number">
                {formatFinancialMetric(64520)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          CAPSULE CHANNEL FILTER ROW (Reference Style: Pill Tabs + Action Icons)
          ============================================================== */}
      <div className="overview-capsule-filters">
        <div className="capsule-filter-group">
          {channelFilters.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`capsule-filter-btn ${activeChannelFilter === tab.id ? 'active' : ''}`}
              onClick={() => setActiveChannelFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            className="capsule-filter-btn"
            onClick={() => onNavigateModule('integrations')}
            title="Connect new channel"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="capsule-actions-group">
          <button
            type="button"
            className="capsule-action-btn"
            title="Export telemetry"
            onClick={() => onNavigateModule('revenue')}
          >
            <Share2 size={15} />
          </button>
          <button
            type="button"
            className="capsule-action-btn"
            title="Operations settings"
            onClick={() => onNavigateModule('settings')}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* ==============================================================
          8. 4 KPI CARDS IN ONE HORIZONTAL ROW (High-Density Operations)
          ============================================================== */}
      <div className="kpi-grid-4">
        {/* Card 1: Automated Revenue */}
        <KpiCard
          title="Automated Revenue"
          value={useZeroState ? '$0.00' : '$3,600.00'}
          supportingText={useZeroState ? 'Awaiting first automated order' : '+18.4% vs previous 30 days'}
          icon={TrendingUp}
          trend={useZeroState ? null : { value: '+18.4%', isPositive: true }}
          onClick={() => onNavigateModule('revenue')}
        />

        {/* Card 2: Conversations Handled */}
        <KpiCard
          title="Conversations Handled"
          value={useZeroState ? '0' : '71'}
          supportingText={useZeroState ? '0 active customer conversations' : '92.4% resolved autonomously'}
          icon={MessageSquare}
          trend={useZeroState ? null : { value: '+31%', isPositive: true }}
          onClick={() => onNavigateModule('messages')}
        />

        {/* Card 3: Orders via Social */}
        <KpiCard
          title="Orders via Social"
          value={useZeroState ? '0' : '24'}
          supportingText={useZeroState ? 'No social orders recorded yet' : '$150.00 avg. order value'}
          icon={ShoppingBag}
          trend={useZeroState ? null : { value: '+24%', isPositive: true }}
          onClick={() => onNavigateModule('orders')}
        />

        {/* Card 4: Avg Response Speed */}
        <KpiCard
          title="Avg Response Speed"
          value={useZeroState ? 'Ready' : '1.8 sec'}
          supportingText={useZeroState ? 'Standby for incoming messages' : '24/7 instantaneous answering'}
          icon={Zap}
          trend={useZeroState ? null : { value: '< 2s SLA', isPositive: true }}
          onClick={() => onNavigateModule('analytics')}
        />
      </div>

      {/* ==============================================================
          MAIN OPERATIONS COMMAND CENTER GRID (Asymmetric Multi-Card)
          ============================================================== */}
      <div className="operations-command-grid">
        {/* ROW 1: Large Analytics Card + Live AI Agent Activity */}
        <div className="operations-grid-row-1">
          <CommerceChartCard isZeroState={useZeroState} />
          <ActivityTimeline
            isStandby={useZeroState}
            onOpenInbox={() => onNavigateModule('messages')}
          />
        </div>

        {/* ROW 2: AI Automation + Channel Performance + Order Status */}
        <div className="operations-grid-row-2">
          {/* AI Automation */}
          <AutomationCard
            inquiriesHandled={useZeroState ? 0 : 142}
            ordersProcessed={useZeroState ? 0 : 24}
            automatedResponses={useZeroState ? 0 : 389}
            conversionRate={useZeroState ? '0%' : '12.4%'}
            status="READY"
            onConfigureAi={() => onNavigateModule('ai-assistant')}
          />

          {/* Channel Performance (Commerce Infrastructure) */}
          <ChannelPerformance
            channels={
              useZeroState
                ? [
                    { id: 'whatsapp', name: 'WhatsApp', badge: 'whatsapp', messages: 0, orders: 0, conversion: '0%', ratio: 0 },
                    { id: 'instagram', name: 'Instagram', badge: 'instagram', messages: 0, orders: 0, conversion: '0%', ratio: 0 },
                    { id: 'facebook', name: 'Facebook', badge: 'facebook', messages: 0, orders: 0, conversion: '0%', ratio: 0 }
                  ]
                : [
                    { id: 'whatsapp', name: 'WhatsApp', badge: 'whatsapp', messages: 128, orders: 12, conversion: '9.4%', ratio: 94 },
                    { id: 'instagram', name: 'Instagram', badge: 'instagram', messages: 94, orders: 8, conversion: '8.5%', ratio: 85 },
                    { id: 'facebook', name: 'Facebook', badge: 'facebook', messages: 62, orders: 5, conversion: '8.1%', ratio: 81 }
                  ]
            }
            onManageChannels={() => onNavigateModule('integrations')}
          />

          {/* Order Status Circular Donut Chart */}
          <OrderStatusChart
            completed={useZeroState ? 0 : 14}
            processing={useZeroState ? 0 : 6}
            pending={useZeroState ? 0 : 3}
            cancelled={useZeroState ? 0 : 1}
            onViewOrders={() => onNavigateModule('orders')}
          />
        </div>

        {/* ROW 3: Left (Recent Orders + Top Products) & Right (Channel Health + Conversation Analytics) */}
        <div className="operations-grid-row-3">
          {/* Main Left Stack */}
          <div className="operations-col-stack">
            {/* Recent Orders Table */}
            <OrderTable
              orders={
                useZeroState
                  ? []
                  : [
                      {
                        id: '#KA-10482',
                        customer: 'Customer #1048',
                        customerName: 'Elena Rostova',
                        channel: 'instagram',
                        amount: '$129.00',
                        status: 'processing',
                        date: '10 min ago',
                        item: 'Minimalist Stoneware Carafe (x2)'
                      },
                      {
                        id: '#KA-10481',
                        customer: 'Customer #1047',
                        customerName: 'Marcus Vance',
                        channel: 'whatsapp',
                        amount: '$84.00',
                        status: 'confirmed',
                        date: '38 min ago',
                        item: 'Artisan Linen Overshirt - Olive / L'
                      },
                      {
                        id: '#KA-10480',
                        customer: 'Customer #1046',
                        customerName: 'Tariq Mansoor',
                        channel: 'facebook',
                        amount: '$210.00',
                        status: 'completed',
                        date: '2 hrs ago',
                        item: 'Botanical Eau De Parfum (50ml)'
                      },
                      {
                        id: '#KA-10479',
                        customer: 'Customer #1045',
                        customerName: 'Sarah Jenkins',
                        channel: 'whatsapp',
                        amount: '$45.00',
                        status: 'shipped',
                        date: '4 hrs ago',
                        item: 'Minimalist Stoneware Carafe'
                      },
                      {
                        id: '#KA-10478',
                        customer: 'Customer #1044',
                        customerName: 'David Kim',
                        channel: 'instagram',
                        amount: '$189.00',
                        status: 'completed',
                        date: 'Yesterday',
                        item: 'Heavyweight Cotton Throw & Cardholder'
                      }
                    ]
              }
              onSelectOrder={(order) => setSelectedOrder(order)}
              onViewAllOrders={() => onNavigateModule('orders')}
            />

            {/* Top Products */}
            <ProductPerformance
              products={
                useZeroState
                  ? [
                      { id: 'p-1', name: 'Artisan Linen Overshirt', category: 'Apparel', orders: 0, revenue: '$0.00', trend: '0%', isPositive: true },
                      { id: 'p-2', name: 'Minimalist Stoneware Carafe', category: 'Home & Living', orders: 0, revenue: '$0.00', trend: '0%', isPositive: true },
                      { id: 'p-3', name: 'Vegetable-Tanned Cardholder', category: 'Accessories', orders: 0, revenue: '$0.00', trend: '0%', isPositive: true }
                    ]
                  : [
                      { id: 'p-1', name: 'Artisan Linen Overshirt', category: 'Apparel', orders: 24, revenue: '$1,240', trend: '+18%', isPositive: true },
                      { id: 'p-2', name: 'Minimalist Stoneware Carafe', category: 'Home & Living', orders: 18, revenue: '$920', trend: '+11%', isPositive: true },
                      { id: 'p-3', name: 'Vegetable-Tanned Cardholder', category: 'Accessories', orders: 12, revenue: '$640', trend: '+7%', isPositive: true },
                      { id: 'p-4', name: 'Botanical Eau De Parfum (50ml)', category: 'Fragrance', orders: 9, revenue: '$480', trend: '+5%', isPositive: true }
                    ]
              }
              onManageProducts={() => onNavigateModule('products')}
            />
          </div>

          {/* Right Stack */}
          <div className="operations-col-stack">
            {/* Channel Ingestion & Health */}
            <ChannelHealth
              channels={
                useZeroState
                  ? [
                      { id: 'whatsapp', name: 'WhatsApp', badge: 'whatsapp', account: 'Not connected', connected: false, messagesToday: 0 },
                      { id: 'instagram', name: 'Instagram', badge: 'instagram', account: 'Not connected', connected: false, messagesToday: 0 },
                      { id: 'facebook', name: 'Facebook', badge: 'facebook', account: 'Not connected', connected: false, messagesToday: 0 }
                    ]
                  : [
                      { id: 'whatsapp', name: 'WhatsApp', badge: 'whatsapp', account: '+1 (555) 839-2041', connected: true, messagesToday: 342 },
                      { id: 'instagram', name: 'Instagram', badge: 'instagram', account: '@kreazy_retail', connected: true, messagesToday: 218 },
                      { id: 'facebook', name: 'Facebook', badge: 'facebook', account: 'Kreazy Brand Official Page', connected: true, messagesToday: 89 }
                    ]
              }
              onManageChannels={() => onNavigateModule('integrations')}
            />

            {/* Conversation Analytics */}
            <ConversationAnalytics
              total={useZeroState ? 0 : 142}
              resolved={useZeroState ? 0 : 131}
              pending={useZeroState ? 0 : 11}
              aiHandled={useZeroState ? 0 : 128}
              humanHandled={useZeroState ? 0 : 14}
              onOpenMessages={() => onNavigateModule('messages')}
            />
          </div>
        </div>
      </div>

      {/* Interactive Order Details Modal */}
      {selectedOrder && (
        <OrderQuickModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOpenChat={() => onNavigateModule('messages')}
          onNavigateOrders={() => onNavigateModule('orders')}
        />
      )}
    </div>
  );
}
