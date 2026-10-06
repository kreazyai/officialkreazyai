import React from 'react';
import { Bot, ArrowUpRight, CheckCircle2, Clock, Sparkles, MessageSquare, ShoppingBag, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

/**
 * ActivityTimeline — Live AI Agent Activity card
 * Shows real-time autonomous agent decisions, channel context, and standby states.
 */
export function ActivityTimeline({
  activities = [],
  onOpenInbox,
  isStandby = false
}) {
  const defaultActivities = [
    {
      id: 'act-1',
      agent: 'AI Agent',
      action: 'Analyzed customer inquiry',
      detail: 'Answered sizing & fabric query from catalog knowledge',
      time: '2 min ago',
      channel: 'whatsapp',
      status: 'success'
    },
    {
      id: 'act-2',
      agent: 'AI Agent',
      action: 'Updated product availability',
      detail: 'Synchronized stock count for Artisan Linen Overshirt (44 units)',
      time: '8 min ago',
      channel: 'instagram',
      status: 'info'
    },
    {
      id: 'act-3',
      agent: 'AI Agent',
      action: 'Checked incoming order',
      detail: 'Verified delivery address & issued Stripe payment link',
      time: '14 min ago',
      channel: 'facebook',
      status: 'success'
    },
    {
      id: 'act-4',
      agent: 'AI Agent',
      action: 'Waiting for customer message',
      detail: 'Webhook listener active across all official Meta endpoints',
      time: '21 min ago',
      channel: 'whatsapp',
      status: 'standby'
    }
  ];

  const items = activities.length > 0 ? activities : (isStandby ? [] : defaultActivities);

  return (
    <div className="card activity-timeline-card">
      {/* Header */}
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">Live AI Agent Activity</h3>
            <span className={`status-pill ${isStandby ? 'standby' : 'active'}`}>
              <span className="telemetry-dot"></span>
              {isStandby ? 'Standby' : 'Live Stream'}
            </span>
          </div>
          <p className="card-subtitle">Real-time activity across autonomous AI operations.</p>
        </div>

        <div className="agent-badge-icon">
          <Bot size={18} color="var(--bright-olive)" />
        </div>
      </div>

      {/* Activity List or Empty Standby State */}
      <div className="timeline-body">
        {items.length > 0 ? (
          <div className="activity-list">
            {items.map((item) => (
              <div key={item.id} className="activity-row">
                <div className="activity-timeline-indicator">
                  <div className={`activity-bullet ${item.status || 'info'}`}>
                    <span className="inner-dot"></span>
                  </div>
                  <div className="timeline-connector"></div>
                </div>

                <div className="activity-content">
                  <div className="activity-main-line">
                    <span className="activity-agent-label">{item.agent || 'AI Agent'}</span>
                    <span className="activity-action-name">{item.action || item.title}</span>
                    {item.channel && (
                      <Badge variant={item.channel.toLowerCase()}>
                        {item.channel.toUpperCase()}
                      </Badge>
                    )}
                  </div>

                  {(item.detail || item.description) && (
                    <p className="activity-detail-text">
                      {item.detail || item.description}
                    </p>
                  )}

                  <span className="activity-time-stamp">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty / Standby State as specified in prompt */
          <div className="activity-empty-standby">
            <div className="standby-icon-ring">
              <Bot size={22} color="var(--bright-olive)" />
            </div>
            <h4 className="standby-title">No customer activity recorded yet</h4>
            <p className="standby-description">
              AI Sales Agent is standing by.
              Connected channels will stream autonomous inquiry responses, stock checks, and order notifications here in real-time.
            </p>
            <div className="standby-status-pill">
              <span className="pulse-beacon"></span>
              Autonomous Agent: Ready & Listening
            </div>
          </div>
        )}
      </div>

      {/* Card Footer Action */}
      <div className="card-footer-action">
        <button
          type="button"
          className="btn-inline-action"
          onClick={onOpenInbox}
        >
          <span>Open Live Inbox</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
