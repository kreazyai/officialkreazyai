import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Mail, 
  Building, 
  Phone,
  Video,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input, Select, Textarea } from '../../components/common/Input';
import { leadService } from '../../services/api';

export function FounderMeetingPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessType: 'Retail & E-commerce',
    monthlyOrders: '500 - 2,000 orders/month',
    preferredDate: '',
    preferredTime: 'Morning (10:00 AM - 1:00 PM EST)',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [meetingDetails, setMeetingDetails] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.company) {
      setError('Please provide your name, business email, and company name.');
      return;
    }

    setLoading(true);
    try {
      const res = await leadService.submitFounderMeeting(formData);
      setMeetingDetails(res.lead);
      setSubmitted(true);
    } catch {
      setError('Unable to reserve founder meeting. Please try again or email founder@kreazyai.com.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {!submitted ? (
          <div>
            <div className="section-header" style={{ marginBottom: 'var(--space-8)' }}>
              <span className="eyebrow">
                <Sparkles size={14} /> Direct Founder Access
              </span>
              <h1>Reserve a 1-on-1 Commercial AI Strategy Session</h1>
              <p>
                Meet directly with the KreazyAI engineering leadership. We will evaluate your current Meta conversation volume, order capture bottlenecks, and architect a tailored AI deployment plan.
              </p>
            </div>

            <div className="demo-page-layout">
              {/* Left Column: Agenda & Value */}
              <div className="demo-sidebar-card">
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    What We Cover in 30 Minutes
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    A no-pitch, pure architectural & commercial discussion tailored to your retail operations.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      1
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Channel Audit & Inbound Velocity</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Reviewing your current response delays, cart abandonment, and customer drop-off on WhatsApp & Instagram.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      2
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Catalog & ERP Ingestion Strategy</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>How your SKUs, live inventory, and multi-tier pricing integrate securely without hallucinations.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      3
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Autonomous Checkout & Safety Policies</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Setting hard boundaries on returns, maximum promotional discounts, and seamless human operator takeover.</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Video size={16} color="var(--olive-700)" />
                    <strong style={{ fontSize: '0.85rem' }}>Google Meet Executive Session</strong>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                    You will receive a Google Meet video conference invitation immediately upon confirmation.
                  </p>
                </div>
              </div>

              {/* Right Column: Reservation Form */}
              <div className="demo-form-card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
                    Book Your Founder Strategy Call
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Select your business profile and preferred timing.
                  </p>

                  {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', border: '1px solid var(--status-error-border)' }}>
                      {error}
                    </div>
                  )}

                  <div className="demo-form-grid-2">
                    <Input
                      label="Your Name *"
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Work Email *"
                      type="email"
                      placeholder="founder@yourstore.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label="Company / Brand Name *"
                      placeholder="e.g. Copenhagen Botanicals"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                    <Input
                      label="Phone / WhatsApp Number"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Select
                      label="Retail Vertical"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      options={[
                        { value: 'Apparel & Fashion', label: 'Apparel & Fashion' },
                        { value: 'Cosmetics & Beauty', label: 'Cosmetics & Beauty' },
                        { value: 'Footwear & Accessories', label: 'Footwear & Accessories' },
                        { value: 'Home, Living & Decor', label: 'Home, Living & Decor' },
                        { value: 'Electronics & Gadgets', label: 'Electronics & Gadgets' },
                        { value: 'Other Multichannel Merchant', label: 'Other Multichannel Merchant' }
                      ]}
                    />
                    <Select
                      label="Monthly Conversation Volume"
                      value={formData.monthlyOrders}
                      onChange={(e) => setFormData({ ...formData, monthlyOrders: e.target.value })}
                      options={[
                        { value: 'Under 500 / month', label: 'Under 500 / month' },
                        { value: '500 - 2,000 / month', label: '500 - 2,000 / month' },
                        { value: '2,000 - 10,000 / month', label: '2,000 - 10,000 / month' },
                        { value: '10,000+ Enterprise Volume', label: '10,000+ Enterprise Volume' }
                      ]}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label="Preferred Date"
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    />
                    <Select
                      label="Preferred Time Window"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      options={[
                        { value: 'Morning (10:00 AM - 1:00 PM EST)', label: 'Morning (10:00 AM - 1:00 PM EST)' },
                        { value: 'Afternoon (1:00 PM - 4:00 PM EST)', label: 'Afternoon (1:00 PM - 4:00 PM EST)' },
                        { value: 'Late Afternoon (4:00 PM - 7:00 PM EST)', label: 'Late Afternoon (4:00 PM - 7:00 PM EST)' }
                      ]}
                    />
                  </div>

                  <Textarea
                    label="Current Challenges or Questions (Optional)"
                    placeholder="Tell us about your channels, team bottlenecks, or specific automation goals..."
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    iconRight={ArrowRight}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    {loading ? 'Confirming Reservation...' : 'Confirm Founder Strategy Session'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-12)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.75rem', color: 'var(--olive-950)' }}>
              Founder Session Confirmed!
            </h2>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Thank you, <strong>{formData.name}</strong>. Your executive strategy consultation for <strong>{formData.company}</strong> has been logged.
            </p>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Reference ID:</strong> <code>{meetingDetails?.id || 'founder-confirmed'}</code></div>
              <div><strong>Preferred Window:</strong> {formData.preferredTime} {formData.preferredDate ? `on ${formData.preferredDate}` : '(Next available)'}</div>
              <div><strong>Video Link:</strong> Google Meet URL sent to {formData.email}</div>
              <div><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 600 }}>Confirmed on Platform Calendar</span></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => onNavigate('home')}>
                Return to Home
              </Button>
              <Button variant="primary" onClick={() => onNavigate('signup')}>
                Start Free Trial Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
