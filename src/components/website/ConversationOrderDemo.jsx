import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  User,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Headphones,
  Check,
  Send,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

const CONVERSATION_SCENARIOS = {
  whatsapp: {
    channelName: 'WhatsApp Business',
    channelColor: '#22c55e',
    channelBg: 'rgba(34, 197, 94, 0.15)',
    avatar: 'WA',
    steps: [
      {
        id: 1,
        sender: 'customer',
        text: 'Hi! Do you have the Oxford Cotton Overshirt in black, size L?',
        time: '10:24 AM',
        annotation: 'Customer inquiry from click-to-WhatsApp Meta ad'
      },
      {
        id: 2,
        sender: 'ai',
        speed: '1.2s',
        text: 'Yes! Black is in stock in size L. The price is ৳1,490 with free home delivery. Would you like me to reserve it and place your order?',
        time: '10:24 AM',
        annotation: 'AI checks live inventory & quotes catalog price instantly'
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Yes please! Cash on Delivery to Dhaka.',
        time: '10:25 AM',
        annotation: 'Purchase intent confirmed'
      },
      {
        id: 4,
        sender: 'ai',
        speed: '1.1s',
        text: 'Wonderful! Please confirm your full delivery address and contact phone number to finalize.',
        time: '10:25 AM',
        annotation: 'AI collects structured shipping details'
      },
      {
        id: 5,
        sender: 'customer',
        text: 'House 18, Road 4, Dhanmondi, Dhaka. Phone: 01712-345678.',
        time: '10:26 AM',
        annotation: 'Customer provides verified shipping data'
      },
      {
        id: 6,
        sender: 'ai-order',
        speed: '0.8s',
        orderData: {
          orderId: '#KZ-8291',
          item: 'Oxford Cotton Overshirt',
          variant: 'Black • Size L',
          quantity: 1,
          total: '৳1,490',
          paymentMethod: 'Cash on Delivery (COD)',
          destination: 'Dhanmondi, Dhaka (01712-345678)',
          deliveryEstimate: '2–3 Business Days'
        },
        text: 'Your order is confirmed! Here are your order details. We will notify you on WhatsApp once dispatched.',
        time: '10:26 AM',
        annotation: 'Order created in OMS & conversion reported to Meta CAPI'
      }
    ]
  },
  instagram: {
    channelName: 'Instagram Direct',
    channelColor: '#ec4899',
    channelBg: 'rgba(236, 72, 153, 0.15)',
    avatar: 'IG',
    steps: [
      {
        id: 1,
        sender: 'customer',
        text: 'Hey! Loved your story post. How much is the Silk Floral Kimono?',
        time: '02:15 PM',
        annotation: 'Story reply automatically captured into Instagram DM'
      },
      {
        id: 2,
        sender: 'ai',
        speed: '1.4s',
        text: 'Hey there! The Silk Floral Kimono is ৳2,450. We currently have sizes M and L ready to ship.',
        time: '02:15 PM',
        annotation: 'Instant story reply within 1.4s'
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Does Medium fit a 38 chest?',
        time: '02:16 PM',
        annotation: 'Sizing question based on brand fit chart'
      },
      {
        id: 4,
        sender: 'ai',
        speed: '1.0s',
        text: 'Yes! Size Medium is tailored for 38–40 chest with a relaxed silhouette. Should I book one for you?',
        time: '02:16 PM',
        annotation: 'AI references grounded brand sizing specs'
      },
      {
        id: 5,
        sender: 'customer',
        text: 'Book it! Send to Banani, Dhaka. 01819-223344.',
        time: '02:17 PM',
        annotation: 'Customer ready to checkout'
      },
      {
        id: 6,
        sender: 'ai-order',
        speed: '0.9s',
        orderData: {
          orderId: '#KZ-9142',
          item: 'Silk Floral Kimono',
          variant: 'Multi • Size M',
          quantity: 1,
          total: '৳2,450',
          paymentMethod: 'bKash / COD',
          destination: 'Banani, Dhaka (01819-223344)',
          deliveryEstimate: 'Next Day Delivery'
        },
        text: 'Done! Your order has been registered and reserved in inventory.',
        time: '02:17 PM',
        annotation: 'Order recorded with zero wait time'
      }
    ]
  },
  messenger: {
    channelName: 'Facebook Messenger',
    channelColor: '#3b82f6',
    channelBg: 'rgba(59, 130, 246, 0.15)',
    avatar: 'FB',
    steps: [
      {
        id: 1,
        sender: 'customer',
        text: 'Price koto? Delivery charge Chittagong e koto ashbe?',
        time: '08:40 PM',
        annotation: 'Banglish inquiry from Facebook Page / Ad'
      },
      {
        id: 2,
        sender: 'ai',
        speed: '1.3s',
        text: 'Assalamu Alaikum! Eita ৳1,200. Chittagong e home delivery charge ৳120, total ৳1,320. Size shob gulo available ache.',
        time: '08:40 PM',
        annotation: 'AI natively speaks Banglish & accurately quotes delivery'
      },
      {
        id: 3,
        sender: 'customer',
        text: 'Acha L size ta pathan. Address: GEC Circle, Chittagong. 01911-554433.',
        time: '08:41 PM',
        annotation: 'Direct local order placement'
      },
      {
        id: 4,
        sender: 'ai-order',
        speed: '0.8s',
        orderData: {
          orderId: '#KZ-7053',
          item: 'Casual Denim Overshirt',
          variant: 'Vintage Blue • Size L',
          quantity: 1,
          total: '৳1,320 (incl. Chittagong delivery)',
          paymentMethod: 'Cash on Delivery (COD)',
          destination: 'GEC Circle, Chittagong (01911-554433)',
          deliveryEstimate: '3–4 Business Days'
        },
        text: 'Order confirm kora hoyeche! Courier e deyar por tracking code Messenger e peye jaben.',
        time: '08:41 PM',
        annotation: 'Captured automatically at night without staff active'
      }
    ]
  }
};

export function ConversationOrderDemo({ onNavigate }) {
  const [activeChannel, setActiveChannel] = useState('whatsapp');
  const [currentStepIndex, setCurrentStepIndex] = useState(2); // Initial reveal
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [humanTakeover, setHumanTakeover] = useState(false);
  const [customReplyText, setCustomReplyText] = useState('');
  const chatScrollRef = useRef(null);

  const scenario = CONVERSATION_SCENARIOS[activeChannel] || CONVERSATION_SCENARIOS.whatsapp;
  const currentSteps = scenario.steps;

  // Auto-play progressive conversation stepper
  useEffect(() => {
    if (!isAutoPlaying || humanTakeover) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= currentSteps.length) {
          return 2; // Loop back cleanly after a pause
        }
        return prev + 1;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, [isAutoPlaying, humanTakeover, currentSteps.length]);

  // Reset when changing channel
  const handleSelectChannel = (chan) => {
    setActiveChannel(chan);
    setCurrentStepIndex(2);
    setHumanTakeover(false);
    setCustomReplyText('');
  };

  // Smooth scroll downward
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [currentStepIndex, humanTakeover, customReplyText]);

  return (
    <div className="conv-demo-wrapper">
      {/* Top Header: Channel Selector + Mode Controls */}
      <div className="conv-demo-topbar">
        <div className="conv-channels-tabs">
          <button
            type="button"
            onClick={() => handleSelectChannel('whatsapp')}
            className={`conv-tab-btn ${activeChannel === 'whatsapp' ? 'active-wa' : ''}`}
          >
            <span className="conv-tab-dot" style={{ backgroundColor: '#22c55e' }} />
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectChannel('instagram')}
            className={`conv-tab-btn ${activeChannel === 'instagram' ? 'active-ig' : ''}`}
          >
            <span className="conv-tab-dot" style={{ backgroundColor: '#ec4899' }} />
            <span>Instagram DM</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectChannel('messenger')}
            className={`conv-tab-btn ${activeChannel === 'messenger' ? 'active-fb' : ''}`}
          >
            <span className="conv-tab-dot" style={{ backgroundColor: '#3b82f6' }} />
            <span>Messenger</span>
          </button>
        </div>

        {/* Playback Controls & Human Handoff Simulator */}
        <div className="conv-controls-bar">
          <button
            type="button"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="conv-btn-ctrl"
            title={isAutoPlaying ? 'Pause Auto-play' : 'Play Simulation'}
          >
            {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isAutoPlaying ? 'Auto-Playing' : 'Paused'}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStepIndex(2)}
            className="conv-btn-ctrl"
            title="Restart Simulation"
          >
            <RotateCcw size={13} />
            <span>Restart</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setHumanTakeover(!humanTakeover);
              setIsAutoPlaying(false);
            }}
            className={`conv-btn-ctrl ${humanTakeover ? 'active-human' : ''}`}
          >
            <Headphones size={13} />
            <span>{humanTakeover ? 'Human Active' : 'Simulate Human Handoff'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chat Stream Simulator + Real-Time Conversion Telemetry */}
      <div className="conv-demo-canvas">
        {/* Left Column: Realistic Chat Thread */}
        <div className="conv-chat-col">
          {/* Header of Chat Thread */}
          <div className="conv-thread-header">
            <div className="conv-sender-meta">
              <div
                className="conv-sender-avatar"
                style={{ backgroundColor: scenario.channelBg, color: scenario.channelColor }}
              >
                {scenario.avatar}
              </div>
              <div>
                <div className="conv-sender-name">
                  <span>{scenario.channelName}</span>
                  <Check size={11} className="conv-verified-badge" />
                </div>
                <div className="conv-sender-status">
                  <span className="conv-status-pulse" />
                  <span>
                    {humanTakeover
                      ? 'Human Moderator Connected • AI Paused'
                      : 'KreazyAI Sales Agent • Responds in < 1.5s'}
                  </span>
                </div>
              </div>
            </div>

            <div className="conv-channel-tag" style={{ color: scenario.channelColor }}>
              {scenario.channelName}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="conv-messages-box" ref={chatScrollRef}>
            {currentSteps.slice(0, currentStepIndex).map((step, idx) => {
              const isCust = step.sender === 'customer';
              const isOrder = step.sender === 'ai-order';

              return (
                <div key={idx} className={`conv-msg-row ${isCust ? 'incoming' : 'outgoing'}`}>
                  {!isCust && (
                    <div className="conv-msg-agent-tag">
                      <Bot size={11} color="var(--bright-olive)" />
                      <span>KreazyAI</span>
                      <span className="conv-speed-tag">{step.speed}</span>
                    </div>
                  )}

                  <div className={`conv-bubble ${isCust ? 'bubble-cust' : 'bubble-ai'}`}>
                    <p className="conv-bubble-text">{step.text}</p>

                    {/* Verified Order Created Card */}
                    {isOrder && step.orderData && (
                      <div className="conv-order-receipt-card">
                        <div className="receipt-header">
                          <div className="receipt-badge">
                            <CheckCircle2 size={14} color="#22c55e" />
                            <span>ORDER CONFIRMED &amp; CREATED</span>
                          </div>
                          <span className="receipt-id">{step.orderData.orderId}</span>
                        </div>

                        <div className="receipt-body">
                          <div className="receipt-item-row">
                            <span className="receipt-item-name">{step.orderData.item}</span>
                            <span className="receipt-item-price">{step.orderData.total}</span>
                          </div>
                          <div className="receipt-meta-row">{step.orderData.variant}</div>

                          <div className="receipt-divider" />

                          <div className="receipt-detail-grid">
                            <div>
                              <span className="detail-label">Payment</span>
                              <span className="detail-val">{step.orderData.paymentMethod}</span>
                            </div>
                            <div>
                              <span className="detail-label">Destination</span>
                              <span className="detail-val">{step.orderData.destination}</span>
                            </div>
                          </div>

                          <div className="receipt-delivery-pill">
                            <Zap size={12} color="#72B034" />
                            <span>Est. Delivery: {step.orderData.deliveryEstimate}</span>
                          </div>
                        </div>

                        <div className="receipt-footer-sync">
                          <Check size={12} color="#72B034" />
                          <span>Synced to KreazyAI Order Management &amp; Meta CAPI</span>
                        </div>
                      </div>
                    )}

                    <div className="conv-msg-meta">
                      <span>{step.time}</span>
                      {!isCust && <CheckCheck size={12} className="conv-read-ticks" />}
                    </div>
                  </div>

                  {/* Micro Context Annotation */}
                  {step.annotation && (
                    <div className={`conv-annotation ${isCust ? 'anno-left' : 'anno-right'}`}>
                      <span>{step.annotation}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Human Takeover Interactive Chat Bubble */}
            {humanTakeover && (
              <div className="conv-human-takeover-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.8rem' }}>
                  <Headphones size={15} />
                  <span>Human Team Member Took Over</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  AI politely steps back with complete context preserved. Your staff can type directly into the conversation.
                </p>
              </div>
            )}
          </div>

          {/* Quick Step Stepper Buttons */}
          <div className="conv-step-progress-row">
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Jump to Step:
            </span>
            <div className="conv-step-pills">
              {currentSteps.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setCurrentStepIndex(idx + 1);
                    setIsAutoPlaying(false);
                  }}
                  className={`conv-step-btn ${currentStepIndex >= idx + 1 ? 'passed' : ''} ${currentStepIndex === idx + 1 ? 'current' : ''}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Key Commercial Benefits Callout */}
        <div className="conv-breakdown-col">
          <div className="conv-breakdown-header">
            <span className="eyebrow" style={{ color: 'var(--bright-olive)' }}>THE 5-SECOND STORY</span>
            <h3 className="conv-breakdown-title">
              How Every Message Becomes an Order
            </h3>
            <p className="conv-breakdown-desc">
              No slow replies. No lost midnight leads. Customers get instant answers and checkout directly in their favorite messaging app.
            </p>
          </div>

          <div className="conv-features-flow">
            <div className="conv-flow-card">
              <div className="conv-flow-num">1</div>
              <div>
                <h4 className="conv-flow-heading">Instant Product &amp; Sizing Answers</h4>
                <p className="conv-flow-text">
                  AI reads your product specs, stock levels, and sizing guides to give exact answers in under 1.5 seconds.
                </p>
              </div>
            </div>

            <div className="conv-flow-card">
              <div className="conv-flow-num">2</div>
              <div>
                <h4 className="conv-flow-heading">Automatic Order &amp; Address Collection</h4>
                <p className="conv-flow-text">
                  Collects recipient name, phone, full address, and payment preferences without forcing them to visit an external website.
                </p>
              </div>
            </div>

            <div className="conv-flow-card">
              <div className="conv-flow-num">3</div>
              <div>
                <h4 className="conv-flow-heading">1-Click Human Team Handoff</h4>
                <p className="conv-flow-text">
                  If a buyer asks for custom alterations or wants a real person, your team takes over smoothly with full chat history intact.
                </p>
              </div>
            </div>

            <div className="conv-flow-card">
              <div className="conv-flow-num">4</div>
              <div>
                <h4 className="conv-flow-heading">Meta Ad Attribution (CAPI)</h4>
                <p className="conv-flow-text">
                  Sends purchase conversions back to Meta Ads so your ad algorithms optimize for buyers who actually buy.
                </p>
              </div>
            </div>
          </div>

          <div className="conv-breakdown-cta-wrap">
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={() => onNavigate && onNavigate('signup')}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Start 7-Day Free Trial</span>
              <ArrowRight size={15} />
            </button>
            <div className="conv-sub-trust">
              <span>Connects in 5 minutes</span>
              <span>•</span>
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
