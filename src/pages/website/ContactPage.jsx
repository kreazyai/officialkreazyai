import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export function ContactPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'Product Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Get In Touch</span>
          <h1>We are here to help you scale your commerce</h1>
          <p>
            Have a question about channel integrations, custom pricing, or enterprise SLAs? 
            Reach out and our product team will assist you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'var(--space-12)', marginTop: 'var(--space-8)' }}>
          {/* Left Contact Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Mail size={20} color="var(--olive-700)" />
                <h4 style={{ fontSize: '1.05rem' }}>Email Inquiries</h4>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                General inquiries: <strong>hello@kreazy.ai</strong><br />
                Enterprise & Partnerships: <strong>sales@kreazy.ai</strong><br />
                Technical Support: <strong>support@kreazy.ai</strong>
              </p>
              <small style={{ color: 'var(--text-muted)' }}>Response time within 4 business hours.</small>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Clock size={20} color="var(--olive-700)" />
                <h4 style={{ fontSize: '1.05rem' }}>Operating Hours</h4>
              </div>
              <p style={{ fontSize: '0.9rem' }}>
                Customer Engineering & Solutions:<br />
                Monday – Friday: 9:00 AM – 7:00 PM EST<br />
                Critical API Incident Monitoring: <strong>24/7/365</strong>
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Want an interactive walkthrough instead?</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                Skip the back-and-forth email and book a live screen-share with a retail specialist.
              </p>
              <Button variant="primary" size="sm" onClick={() => onNavigate('book-demo')} iconRight={ArrowRight}>
                Book a Live Demo
              </Button>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="card" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)' }}>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Send Us a Message</h3>

                <Input
                  label="Your Name"
                  name="name"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label="Business Email"
                  name="email"
                  type="email"
                  required
                  placeholder="alex@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Select
                  label="Inquiry Topic"
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  options={[
                    { value: 'Product Inquiry', label: 'Product & Capabilities Inquiry' },
                    { value: 'Meta Channel Connectivity', label: 'Meta Channel Connectivity Question' },
                    { value: 'Enterprise & High Volume', label: 'Enterprise & High Volume Pricing' },
                    { value: 'Technical Support', label: 'Technical Support' },
                    { value: 'Partnership / Agency', label: 'Partnership / Agency' }
                  ]}
                />

                <Textarea
                  label="How can we help?"
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us about your brand, channels, and operational goals..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />

                <Button type="submit" variant="primary" size="md" loading={loading}>
                  Send Message
                </Button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3>Message Received</h3>
                <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Thank you for reaching out! A specialist will review your inquiry and follow up at <strong>{formData.email}</strong> shortly.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
