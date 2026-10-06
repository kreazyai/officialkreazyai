import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  CheckCheck, 
  Send, 
  Sparkles, 
  Wifi, 
  ChevronRight,
  MessageCircle
} from 'lucide-react';

const SCRIPT_MESSAGES = [
  // Conversation 1 - Product Availability
  {
    id: 'm1',
    pairId: 1,
    sender: 'customer',
    customerName: 'Sarah Vance',
    customerInitials: 'SV',
    avatarHue: 142,
    text: 'Hi, is this available in black?',
    time: '10:24 AM',
    channel: 'whatsapp'
  },
  {
    id: 'm2',
    pairId: 1,
    sender: 'ai',
    text: 'Yes, Black is available. What size would you like?',
    time: '10:24 AM',
    responseTime: '1.2s',
    channel: 'whatsapp'
  },
  // Conversation 2 - Shipping & Delivery
  {
    id: 'm3',
    pairId: 2,
    sender: 'customer',
    customerName: 'Marcus Reed',
    customerInitials: 'MR',
    avatarHue: 215,
    text: 'How much is delivery?',
    time: '10:25 AM',
    channel: 'instagram'
  },
  {
    id: 'm4',
    pairId: 2,
    sender: 'ai',
    text: 'Delivery starts from $5. It usually arrives within 1–2 business days.',
    time: '10:25 AM',
    responseTime: '1.1s',
    channel: 'instagram'
  },
  // Conversation 3 - Sizing & Order Intent
  {
    id: 'm5',
    pairId: 3,
    sender: 'customer',
    customerName: 'Jessica Lin',
    customerInitials: 'JL',
    avatarHue: 280,
    text: 'Can I order the Large size?',
    time: '10:26 AM',
    channel: 'messenger'
  },
  {
    id: 'm6',
    pairId: 3,
    sender: 'ai',
    text: 'Absolutely. Large is available. Would you like me to place the order?',
    time: '10:26 AM',
    responseTime: '1.3s',
    channel: 'messenger'
  },
  // Conversation 4 - Payment & Checkout
  {
    id: 'm7',
    pairId: 4,
    sender: 'customer',
    customerName: 'David Kim',
    customerInitials: 'DK',
    avatarHue: 38,
    text: 'Do you accept card payment?',
    time: '10:27 AM',
    channel: 'whatsapp'
  },
  {
    id: 'm8',
    pairId: 4,
    sender: 'ai',
    text: 'Yes. We accept card payment and other available checkout options.',
    time: '10:27 AM',
    responseTime: '1.0s',
    channel: 'whatsapp'
  }
];

const CHANNELS_CONFIG = {
  whatsapp: { label: 'WhatsApp', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', icon: '📱' },
  instagram: { label: 'Instagram', color: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', icon: '📸' },
  messenger: { label: 'Messenger', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: '💬' },
  shopify: { label: 'Shopify Sync', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: '🛍️' }
};

export function MobilePhoneMockup({ activeChannel = 'all', onSelectChannel }) {
  // Step in the script: 0 to SCRIPT_MESSAGES.length
  // Shows messages up to current step
  const [visibleCount, setVisibleCount] = useState(2);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');
  const chatBodyRef = useRef(null);

  // Set realistic system clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Live messaging progression & loop
  useEffect(() => {
    let timeoutId;

    if (visibleCount < SCRIPT_MESSAGES.length) {
      const nextIndex = visibleCount;
      const nextMsg = SCRIPT_MESSAGES[nextIndex];
      const isNextAi = nextMsg.sender === 'ai';

      if (isNextAi) {
        // AI is about to reply -> show typing indicator for 1.1s
        timeoutId = setTimeout(() => {
          setIsTyping(true);
          timeoutId = setTimeout(() => {
            setIsTyping(false);
            setVisibleCount(prev => prev + 1);
          }, 1100);
        }, 500);
      } else {
        // Customer sends next message after 2.6s
        timeoutId = setTimeout(() => {
          setVisibleCount(prev => prev + 1);
        }, 2600);
      }
    } else {
      // All messages shown -> hold for 5.5 seconds, then restart loop cleanly
      timeoutId = setTimeout(() => {
        setVisibleCount(2); // reset back to initial pair
      }, 5500);
    }

    return () => clearTimeout(timeoutId);
  }, [visibleCount]);

  // Smooth scroll upward to keep newest message visible
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [visibleCount, isTyping]);

  // Current active channel config
  const channelKey = activeChannel !== 'all' ? activeChannel : 'whatsapp';
  const channelInfo = CHANNELS_CONFIG[channelKey] || CHANNELS_CONFIG.whatsapp;

  return (
    <div className="phone-mockup-frame">
      {/* Physical Titanium Phone Chassis */}
      <div className="phone-chassis">
        {/* Exterior physical volume & power buttons on rim */}
        <div className="phone-btn-volume-up" aria-hidden="true" />
        <div className="phone-btn-volume-down" aria-hidden="true" />
        <div className="phone-btn-power" aria-hidden="true" />

        {/* OLED Display Screen */}
        <div className="phone-screen">
          {/* Subtle Dynamic Island Notch */}
          <div className="phone-notch">
            <div className="notch-camera"></div>
            <div className="notch-status-pill">
              <span className="live-dot-pulse"></span>
              <span className="notch-ai-text">AI Live</span>
            </div>
          </div>

          {/* iOS Status Bar */}
          <div className="phone-status-bar">
            <span className="phone-clock">{currentTime}</span>
            <div className="phone-status-right">
              {/* Signal Bars */}
              <div className="phone-signal-bars" title="5G Full Reception">
                <span className="bar bar-1"></span>
                <span className="bar bar-2"></span>
                <span className="bar bar-3"></span>
                <span className="bar bar-4"></span>
              </div>
              <Wifi size={13} className="phone-wifi-icon" />
              {/* Battery Indicator */}
              <div className="phone-battery">
                <div className="phone-battery-fill"></div>
              </div>
            </div>
          </div>

          {/* Chat Header matching Kreazy AI Dashboard Messages */}
          <div className="phone-chat-header">
            <div className="phone-header-left">
              <div className="phone-avatar-wrap">
                <div className="phone-avatar">
                  <Bot size={18} color="#a3e635" />
                </div>
                <span className="phone-avatar-online" title="Autonomous AI Online"></span>
              </div>
              <div className="phone-header-meta">
                <div className="phone-header-title">
                  <span>KreazyAI Assistant</span>
                  <span className="phone-verified-tick" title="Verified Business AI">✓</span>
                </div>
                <div className="phone-header-sub">
                  <span className="phone-active-dot"></span>
                  <span className="phone-sub-status">Online • Instant response</span>
                </div>
              </div>
            </div>

            {/* Current Active Channel Pill */}
            <div 
              className="phone-channel-pill"
              style={{
                backgroundColor: channelInfo.bg,
                color: channelInfo.color,
                borderColor: `${channelInfo.color}33`
              }}
            >
              <span>{channelInfo.icon}</span>
              <span>{channelInfo.label}</span>
            </div>
          </div>

          {/* Messages Body */}
          <div className="phone-chat-body" ref={chatBodyRef}>
            {/* Timestamp Separator */}
            <div className="phone-date-divider">
              <span>Today • Meta Cloud Verified Stream</span>
            </div>

            {/* Rendered Visible Messages */}
            {SCRIPT_MESSAGES.slice(0, visibleCount).map((msg) => {
              const isCustomer = msg.sender === 'customer';

              return (
                <div 
                  key={msg.id}
                  className={`phone-msg-row ${isCustomer ? 'incoming' : 'outgoing'}`}
                >
                  {isCustomer && (
                    <div 
                      className="phone-customer-avatar"
                      style={{
                        backgroundColor: `hsl(${msg.avatarHue}, 38%, 22%)`,
                        borderColor: `hsl(${msg.avatarHue}, 50%, 35%)`,
                        color: `hsl(${msg.avatarHue}, 85%, 85%)`
                      }}
                      title={msg.customerName}
                    >
                      {msg.customerInitials}
                    </div>
                  )}

                  <div className="phone-msg-content">
                    {/* Sender Identity Tag for AI */}
                    {!isCustomer && (
                      <div className="phone-ai-sender-tag">
                        <Bot size={11} color="var(--bright-olive)" />
                        <span>KreazyAI</span>
                        <span className="phone-ai-speed">• ⚡ {msg.responseTime}</span>
                      </div>
                    )}

                    {/* Chat Bubble matching Dashboard Messages Page */}
                    <div className={`phone-bubble ${isCustomer ? 'bubble-customer' : 'bubble-ai'}`}>
                      <p className="phone-bubble-text">{msg.text}</p>
                    </div>

                    {/* Timestamp & Read Receipt */}
                    <div className={`phone-bubble-meta ${isCustomer ? 'meta-left' : 'meta-right'}`}>
                      <span className="phone-msg-time">{msg.time}</span>
                      {!isCustomer && (
                        <CheckCheck size={12} color="var(--bright-olive)" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Typing / Replying Indicator */}
            {isTyping && (
              <div className="phone-msg-row outgoing phone-typing-row">
                <div className="phone-msg-content">
                  <div className="phone-ai-sender-tag">
                    <Bot size={11} color="var(--bright-olive)" />
                    <span>KreazyAI is replying...</span>
                  </div>
                  <div className="phone-bubble bubble-ai phone-typing-bubble">
                    <span className="typing-dot dot-1"></span>
                    <span className="typing-dot dot-2"></span>
                    <span className="typing-dot dot-3"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Chat Composer Bar */}
          <div className="phone-chat-footer">
            <button 
              type="button" 
              className="phone-footer-sparkle" 
              title="AI Copilot Active"
              tabIndex={-1}
            >
              <Sparkles size={14} color="var(--bright-olive)" />
            </button>
            <div className="phone-input-fake">
              <span>Message KreazyAI Assistant...</span>
            </div>
            <button 
              type="button" 
              className="phone-footer-send-btn" 
              title="Autonomous Send"
              tabIndex={-1}
            >
              <Send size={13} color="#0c160f" />
            </button>
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="phone-home-indicator-wrap">
            <div className="phone-home-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}
