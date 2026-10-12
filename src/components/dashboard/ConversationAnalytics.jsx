import React, { useState } from 'react';
import { MessageSquare, ArrowUpRight, Bot, Users } from 'lucide-react';

/**
 * ConversationAnalytics — Inbound conversations breakdown with SVG ring chart
 * Displays: Total conversations, Resolved, Pending, AI handled, Human handled.
 */
export function ConversationAnalytics({
  total = 142,
  resolved = 131,
  pending = 11,
  aiHandled = 128,
  humanHandled = 14,
  onOpenMessages
}) {
  const [hoveredSeg, setHoveredSeg] = useState(null);

  const radius = 54;
  const strokeWidth = 13;
  const circumference = 2 * Math.PI * radius;

  // Segments: AI Handled vs Human Handled
  const totalHandled = aiHandled + humanHandled;
  const aiRatio = totalHandled > 0 ? aiHandled / totalHandled : 0;
  const humanRatio = totalHandled > 0 ? humanHandled / totalHandled : 0;

  const aiDash = `${aiRatio * circumference} ${circumference}`;
  const humanDash = `${humanRatio * circumference} ${circumference}`;
  const humanOffset = -aiRatio * circumference;

  return (
    <div className="card conversation-analytics-card">
      <div className="card-header-flex">
        <div>
          <div className="chart-title-wrap">
            <h3 className="card-title">Conversation Analytics</h3>
            <span className="infrastructure-badge">Resolution SLA</span>
          </div>
          <p className="card-subtitle">AI copilot vs human escalation efficiency</p>
        </div>

        <div className="agent-badge-icon">
          <MessageSquare size={18} color="var(--bright-olive)" />
        </div>
      </div>

      <div className="donut-content-layout">
        {/* Ring Chart */}
        <div className="donut-svg-wrap">
          <svg
            className="donut-svg"
            viewBox="0 0 140 140"
            width="130"
            height="130"
          >
            {/* Background ring */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke="rgba(69, 88, 64, 0.25)"
              strokeWidth={strokeWidth}
            />

            {/* AI Handled Arc (only when > 0) */}
            {aiRatio > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="var(--bright-olive, #8FA45A)"
                strokeWidth={hoveredSeg === 'ai' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={aiDash}
                strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredSeg && hoveredSeg !== 'ai' ? 0.45 : 1
                }}
                onMouseEnter={() => setHoveredSeg('ai')}
                onMouseLeave={() => setHoveredSeg(null)}
              />
            )}

            {/* Human Handled Arc (only when > 0) */}
            {humanRatio > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke="var(--accent-amber, #D6A85C)"
                strokeWidth={hoveredSeg === 'human' ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={humanDash}
                strokeDashoffset={humanOffset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: hoveredSeg && hoveredSeg !== 'human' ? 0.45 : 1
                }}
                onMouseEnter={() => setHoveredSeg('human')}
                onMouseLeave={() => setHoveredSeg(null)}
              />
            )}
          </svg>

          {/* Center text */}
          <div className="donut-center-info">
            <span className="donut-center-number">{total}</span>
            <span className="donut-center-label">Total Chats</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="convo-stats-grid">
          <div className="convo-stat-box">
            <span className="stat-label">Resolved</span>
            <strong className="stat-val text-olive">{resolved}</strong>
          </div>
          <div className="convo-stat-box">
            <span className="stat-label">Pending</span>
            <strong className="stat-val">{pending}</strong>
          </div>
          <div
            className={`convo-stat-box ${hoveredSeg === 'ai' ? 'active-seg' : ''}`}
            onMouseEnter={() => setHoveredSeg('ai')}
            onMouseLeave={() => setHoveredSeg(null)}
          >
            <div className="stat-label-with-dot">
              <span className="legend-dot" style={{ backgroundColor: '#8FA45A' }}></span>
              <span>AI Handled</span>
            </div>
            <strong className="stat-val text-bright">
              {aiHandled} <small>({Math.round(aiRatio * 100)}%)</small>
            </strong>
          </div>
          <div
            className={`convo-stat-box ${hoveredSeg === 'human' ? 'active-seg' : ''}`}
            onMouseEnter={() => setHoveredSeg('human')}
            onMouseLeave={() => setHoveredSeg(null)}
          >
            <div className="stat-label-with-dot">
              <span className="legend-dot" style={{ backgroundColor: '#D6A85C' }}></span>
              <span>Human Handled</span>
            </div>
            <strong className="stat-val text-amber">
              {humanHandled} <small>({Math.round(humanRatio * 100)}%)</small>
            </strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="card-footer-action">
        <button
          type="button"
          className="btn-inline-action"
          onClick={onOpenMessages}
        >
          <span>Open Live Inbox</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
