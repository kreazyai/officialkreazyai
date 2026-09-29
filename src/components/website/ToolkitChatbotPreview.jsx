import React, { useState } from 'react';
import { MessageSquare, Zap, BarChart3, Bot, Check, ArrowRight, Sparkles } from 'lucide-react';

export function ToolkitChatbotPreview() {
  const [activeTab, setActiveTab] = useState('chatbots');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Welcome! How can we help you today?',
      time: '10:00 AM'
    },
    {
      sender: 'user',
      text: 'AI Enhance your Finance Operations',
      time: '10:01 AM'
    },
    {
      sender: 'bot',
      text: 'Connecting to real-time Shopify & Stripe accounting. We found 4 pending invoices and verified $3,420 in autonomous collections.',
      time: '10:01 AM'
    }
  ]);

  const handlePromptClick = (text) => {
    setChatMessages(prev => [
      ...prev,
      { sender: 'user', text, time: 'Just now' },
      { 
        sender: 'bot', 
        text: `Understood! KreazyAI autonomous agent is processing: "${text}" with 99.8% precision.`, 
        time: 'Just now' 
      }
    ]);
  };

  const tabs = [
    {
      id: 'chatbots',
      icon: MessageSquare,
      title: 'AI Chatbots',
      desc: 'Powerful and production-ready, our cloud platform has the solutions you need to succeed.'
    },
    {
      id: 'automations',
      icon: Zap,
      title: 'Workflow Automations',
      desc: 'Connect triggers, business logic and autonomous execution without code across WhatsApp, Shopify, and CRM.'
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Executive Intelligence',
      desc: 'Deep telemetry on conversation conversion, customer sentiment, and operational cost savings.'
    }
  ];

  return (
    <div className="toolkit-section-grid">
      {/* LEFT: Realistic AI Chatbot UI Mockup */}
      <div className="toolkit-chat-mockup-wrapper">
        <div className="toolkit-chat-card">
          {/* Header */}
          <div className="toolkit-chat-header">
            <div className="toolkit-chat-badge">
              <Bot size={14} />
              <span>AI CHATBOTS</span>
            </div>
            <div className="toolkit-chat-status">
              <span className="pulse-dot"></span>
              <span>Online</span>
            </div>
          </div>

          {/* Chat Bubble Window */}
          <div className="toolkit-chat-body">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`toolkit-msg-row ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="toolkit-avatar-bot">
                    <Sparkles size={14} color="#FFFFFF" />
                  </div>
                )}
                <div className={`toolkit-msg-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                  <span className="toolkit-msg-time">{msg.time}</span>
                </div>
              </div>
            ))}

            {/* Suggestion Chips */}
            <div className="toolkit-prompt-chips">
              <button 
                type="button" 
                className="toolkit-chip"
                onClick={() => handlePromptClick('What is KreazyAI')}
              >
                What is KreazyAI
              </button>
              <button 
                type="button" 
                className="toolkit-chip"
                onClick={() => handlePromptClick('AI Enhance your business')}
              >
                AI Enhance your business
              </button>
              <button 
                type="button" 
                className="toolkit-chip active"
                onClick={() => handlePromptClick('Automate Order Fulfillment')}
              >
                Automate Order Fulfillment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Feature Tabs & Narrative */}
      <div className="toolkit-content-side">
        <div className="section-eyebrow-pill">
          <span>TOOLKIT</span>
        </div>

        <h2 className="toolkit-heading">
          Complete toolkit for AI automation
        </h2>

        <div className="toolkit-tabs-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div 
                key={tab.id}
                className={`toolkit-tab-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="toolkit-tab-header">
                  <Icon size={20} className="toolkit-tab-icon" />
                  <h3 className="toolkit-tab-title">{tab.title}</h3>
                </div>
                <p className="toolkit-tab-desc">
                  {tab.desc}
                </p>
                {isActive && <div className="toolkit-active-indicator" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
