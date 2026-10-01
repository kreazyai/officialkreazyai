import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { leadService } from '../../services/api';

export function WebsiteChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('welcome'); // 'welcome' | 'form' | 'success'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close with Escape key & listen for external trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    const handleExternalOpen = () => {
      setIsOpen(true);
      setView('welcome');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('kreazy-open-chat', handleExternalOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('kreazy-open-chat', handleExternalOpen);
    };
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!formData.company.trim()) {
      setError('Please enter your company name.');
      return;
    }

    setLoading(true);
    try {
      await leadService.submitContactInquiry({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim() || 'Chat widget inquiry',
        company: formData.company.trim(),
        inquiryType: 'Live Chat Widget'
      });
      setLoading(false);
      setView('success');
    } catch (err) {
      setLoading(false);
      setError('Unable to send message right now. Please try again.');
    }
  };

  const handleReset = () => {
    setFormData({ name: '', phone: '', message: '', company: '' });
    setError('');
    setView('welcome');
  };

  return (
    <div className="kreazy-chat-widget-root">
      {/* ─── CHAT POPOVER WINDOW ────────────────────────────────────────── */}
      {isOpen && (
        <div 
          className="kreazy-chat-popover" 
          role="dialog" 
          aria-labelledby="kreazy-chat-title"
        >
          {/* VIEW 1: WELCOME SCREEN */}
          {view === 'welcome' && (
            <div className="kreazy-chat-view kreazy-chat-view-welcome">
              {/* Header */}
              <div className="kreazy-chat-header">
                <button 
                  type="button" 
                  className="kreazy-chat-close-btn" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>

                <div className="kreazy-chat-avatar-wrap">
                  <div className="kreazy-chat-avatar">
                    <Sparkles size={24} className="kreazy-chat-sparkle-icon" />
                  </div>
                  <span className="kreazy-chat-status-dot" title="Online now" />
                </div>

                <h3 id="kreazy-chat-title" className="kreazy-chat-title">Hi there</h3>
                <p className="kreazy-chat-subtitle">Welcome to KreazyAI</p>
              </div>

              {/* Body */}
              <div className="kreazy-chat-body">
                <div 
                  className="kreazy-chat-action-card" 
                  onClick={() => setView('form')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setView('form'); }}
                >
                  <div className="kreazy-chat-card-text">
                    <div className="kreazy-chat-card-title">Chat with us</div>
                    <div className="kreazy-chat-card-desc">We typically reply within minutes.</div>
                  </div>
                  <div className="kreazy-chat-send-icon-wrap">
                    <Send size={16} />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="kreazy-chat-footer">
                <span>POWERED BY <strong>KREAZYAI</strong></span>
              </div>
            </div>
          )}

          {/* VIEW 2: CONTACT / INQUIRY FORM */}
          {view === 'form' && (
            <div className="kreazy-chat-view kreazy-chat-view-form">
              {/* Header with back button */}
              <div className="kreazy-chat-form-top">
                <button 
                  type="button" 
                  className="kreazy-chat-icon-btn" 
                  onClick={() => setView('welcome')}
                  aria-label="Back to welcome"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="kreazy-chat-form-top-avatar">
                  <Sparkles size={16} />
                </div>
                <button 
                  type="button" 
                  className="kreazy-chat-icon-btn" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="kreazy-chat-form-body">
                <p className="kreazy-chat-form-notice">
                  We'll get back to you when one of our agents is able to respond. Please provide your details so we can get in touch with you.
                </p>

                {error && (
                  <div className="kreazy-chat-error-banner">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="kreazy-chat-form">
                  <div className="kreazy-chat-field">
                    <input
                      type="text"
                      className="kreazy-chat-input"
                      placeholder="Name *"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="kreazy-chat-field">
                    <input
                      type="tel"
                      className="kreazy-chat-input"
                      placeholder="Phone *"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="kreazy-chat-field">
                    <textarea
                      className="kreazy-chat-input kreazy-chat-textarea"
                      placeholder="Message"
                      rows={3}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                  </div>

                  <div className="kreazy-chat-field">
                    <input
                      type="text"
                      className="kreazy-chat-input"
                      placeholder="Company *"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="kreazy-chat-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* VIEW 3: SUCCESS STATE */}
          {view === 'success' && (
            <div className="kreazy-chat-view kreazy-chat-view-success">
              <div className="kreazy-chat-form-top" style={{ justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="kreazy-chat-icon-btn" 
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="kreazy-chat-success-body">
                <div className="kreazy-chat-success-icon">
                  <CheckCircle2 size={44} />
                </div>
                <h4>Message Received!</h4>
                <p>
                  Thank you, <strong>{formData.name}</strong>. Our AI assistant and merchant growth team will get in touch with you at <strong>{formData.phone}</strong> promptly.
                </p>
                <button 
                  type="button" 
                  className="kreazy-chat-reset-btn"
                  onClick={handleReset}
                >
                  Send another message
                </button>
              </div>

              <div className="kreazy-chat-footer">
                <span>POWERED BY <strong>KREAZYAI</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── FLOATING LAUNCHER (BOTTOM-RIGHT) ─────────────────────────── */}
      <div className="kreazy-chat-launcher-wrap">
        {!isOpen && (
          <button 
            type="button" 
            className="kreazy-chat-launcher-pill"
            onClick={() => { setIsOpen(true); setView('welcome'); }}
            aria-label="Chat with us"
          >
            Chat with us
          </button>
        )}

        <button
          type="button"
          className={`kreazy-chat-launcher-circle ${isOpen ? 'active' : ''}`}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
            } else {
              setIsOpen(true);
              setView('welcome');
            }
          }}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <X size={24} className="kreazy-chat-toggle-icon" />
          ) : (
            <div className="kreazy-chat-bubble-wrap">
              <MessageSquare size={22} className="kreazy-chat-toggle-icon" />
              <span className="kreazy-chat-launcher-badge" />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
