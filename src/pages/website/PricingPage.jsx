import React from 'react';
import { ShieldCheck, Check, Zap, HelpCircle } from 'lucide-react';
import { PricingWinningSection } from '../../components/website/PricingWinningSection';

export function PricingPage({ onNavigate }) {
  return (
    <div className="pricing-page-root" style={{ padding: 'var(--space-8) 0 var(--space-20) 0' }}>
      {/* Signature "Get used to winning" Pricing Component */}
      <PricingWinningSection onSelectPlan={(planId) => onNavigate('signup')} />

      {/* Feature Comparison Table */}
      <div className="container" style={{ marginTop: 'var(--space-12)' }}>
        <div className="section-header-centered" style={{ marginBottom: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
            Compare All Plan Capabilities
          </h3>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Transparent features with zero hidden add-on fees or bandwidth penalties.
          </p>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Capability / Feature</th>
                <th>Basic ($0)</th>
                <th>Enterprise ($12)</th>
                <th>Scale ($49)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Team Seats & Workspaces</td>
                <td>1 workspace / 25 users</td>
                <td>Unlimited workspaces</td>
                <td>Unlimited + Custom Roles</td>
              </tr>
              <tr>
                <td>Official Meta WhatsApp API</td>
                <td>Sandbox test</td>
                <td>Included & Live</td>
                <td>High-throughput cluster</td>
              </tr>
              <tr>
                <td>Instagram & Facebook Sync</td>
                <td>Limited</td>
                <td>Full Omnichannel</td>
                <td>Full Omnichannel</td>
              </tr>
              <tr>
                <td>Autonomous Order Capture</td>
                <td>Manual approval</td>
                <td>Autonomous Direct</td>
                <td>Autonomous + ERP Sync</td>
              </tr>
              <tr>
                <td>Live Support & SLA</td>
                <td>Email (24h)</td>
                <td>Email & Live Chat</td>
                <td>Dedicated Account Manager</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Value Guarantee Note */}
        <div style={{ marginTop: 'var(--space-12)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', color: '#64748B', fontSize: '0.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <ShieldCheck size={18} color="#2563EB" /> 14-day free trial on all plans
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Check size={18} color="#2563EB" /> No credit card required to start
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Zap size={18} color="#2563EB" /> Cancel or change plan anytime
          </span>
        </div>
      </div>
    </div>
  );
}
