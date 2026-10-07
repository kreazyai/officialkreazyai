import React, { useState } from 'react';
import { CheckCircle2, Calendar, Clock, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { leadService } from '../../services/api';

export function BookDemoPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    businessType: 'Apparel & Fashion',
    website: '',
    primaryChannel: 'WhatsApp',
    monthlyOrders: '100 - 500 orders/month',
    preferredDate: '',
    preferredTime: '10:00 AM - 01:00 PM BST / 12:00 AM - 03:00 AM EST',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadDetails, setLeadDetails] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await leadService.submitDemo(formData);
      setLeadDetails(res.lead);
      setSubmitted(true);
    } catch (err) {
      console.error('Demo submission error:', err);
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
              <span className="eyebrow">Personalized Walkthrough</span>
              <h1>Schedule a Live KreazyAI Product Demonstration</h1>
              <p>
                See how KreazyAI can automate your specific catalog, Meta channels, and sales workflows in real-time.
              </p>
            </div>

            <div className="demo-page-layout">
              {/* Left Column: Why Demo & What to Expect */}
              <div className="demo-sidebar-card">
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    What to expect during your demo
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Our solutions team will walk you through a tailored live demo configured for your retail niche.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      1
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Live Channel Simulation</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>We test real customer inquiries on WhatsApp and Instagram in front of you.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      2
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Catalog Grounding Setup</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>How your SKUs, sizes, and pricing rules are ingested into the AI assistant.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      3
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Guardrails & Human Handoff</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Reviewing discount constraints, sentiment alerts, and team intervention.</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    <ShieldCheck size={16} color="var(--bright-olive)" /> Enterprise Privacy Guaranteed
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Your store volume and customer details remain strictly confidential and never used for generic model training.
                  </p>
                </div>
              </div>

              {/* Right Column: High-Converting Form */}
              <div className="demo-form-card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div className="demo-form-grid-2">
                    <Input
                      label="Full Name"
                      name="fullName"
                      required
                      placeholder="e.g. Sarah Connor"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    <Input
                      label="Business Name"
                      name="businessName"
                      required
                      placeholder="e.g. Atelier Living"
                      value={formData.businessName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label="Work Email"
                      name="email"
                      type="email"
                      required
                      placeholder="sarah@atelierliving.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <Input
                      label="Phone / WhatsApp Number"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Select
                      label="Business Category"
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      options={[
                        { value: 'Apparel & Fashion', label: 'Apparel & Fashion' },
                        { value: 'Home & Living', label: 'Home & Living' },
                        { value: 'Beauty & Cosmetics', label: 'Beauty & Cosmetics' },
                        { value: 'Electronics & Gadgets', label: 'Electronics & Gadgets' },
                        { value: 'Food & Beverage', label: 'Food & Beverage' },
                        { value: 'Other Retail', label: 'Other Retail' }
                      ]}
                    />
                    <Input
                      label="Store Website or Instagram Handle"
                      name="website"
                      placeholder="https://yourstore.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Select
                      label="Primary Sales Channel"
                      name="primaryChannel"
                      value={formData.primaryChannel}
                      onChange={handleChange}
                      options={[
                        { value: 'WhatsApp', label: 'WhatsApp' },
                        { value: 'Instagram', label: 'Instagram' },
                        { value: 'Facebook Messenger', label: 'Facebook Messenger' },
                        { value: 'All of the above', label: 'All of the above' }
                      ]}
                    />
                    <Select
                      label="Estimated Monthly Orders"
                      name="monthlyOrders"
                      value={formData.monthlyOrders}
                      onChange={handleChange}
                      options={[
                        { value: '< 100 orders/month', label: '< 100 orders/month' },
                        { value: '100 - 500 orders/month', label: '100 - 500 orders/month' },
                        { value: '500 - 2,000 orders/month', label: '500 - 2,000 orders/month' },
                        { value: '2,000+ orders/month', label: '2,000+ orders/month' }
                      ]}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label="Preferred Demo Date"
                      name="preferredDate"
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={handleChange}
                    />
                    <Select
                      label="Preferred Time Window (BST / EST)"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      options={[
                        { value: '10:00 AM - 01:00 PM BST / 12:00 AM - 03:00 AM EST', label: 'Morning (10:00 AM - 1:00 PM BST / Local)' },
                        { value: '02:00 PM - 05:00 PM BST / 04:00 AM - 07:00 AM EST', label: 'Afternoon (2:00 PM - 5:00 PM BST / Local)' },
                        { value: '06:00 PM - 09:00 PM BST / 08:00 AM - 11:00 AM EST', label: 'Evening (6:00 PM - 9:00 PM BST / 8-11 AM EST)' },
                        { value: '09:00 PM - 11:00 PM BST / 11:00 AM - 01:00 PM EST', label: 'Night (9:00 PM - 11:00 PM BST / 11 AM - 1 PM EST)' }
                      ]}
                    />
                  </div>

                  <Textarea
                    label="What is your biggest messaging or sales bottleneck right now?"
                    name="message"
                    rows={3}
                    placeholder="e.g. We get overwhelmed with sizing questions on Instagram DMs every evening..."
                    value={formData.message}
                    onChange={handleChange}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Request Demo Walkthrough
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation Success State */
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12) var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-canvas-alt)', color: 'var(--bright-olive)', border: '1px solid var(--bright-olive)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6) auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Your demo request has been received
            </h2>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Thank you, <strong>{leadDetails?.fullName}</strong>. A dedicated KreazyAI retail automation specialist has received your inquiry for <strong>{leadDetails?.businessName}</strong>.
            </p>

            <div style={{ backgroundColor: 'var(--bg-canvas-alt)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>What happens next:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={16} color="var(--bright-olive)" />
                  Calendar invite dispatched to <strong>{leadDetails?.email}</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} color="var(--bright-olive)" />
                  Expected confirmation window: <strong>Within 2 business hours</strong>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <MessageSquare size={16} color="var(--bright-olive)" />
                  Direct support contact: <strong>concierge@kreazy.ai</strong>
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => onNavigate('home')}>
                Back to Homepage
              </Button>
              <Button variant="primary" onClick={() => onNavigate('dashboard')}>
                Preview Demo Workspace
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
