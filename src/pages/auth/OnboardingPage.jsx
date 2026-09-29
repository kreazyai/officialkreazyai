import React, { useState } from 'react';
import {
  Building2,
  Tag,
  Package,
  Share2,
  Bot,
  CheckSquare,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { productService, aiConfigService } from '../../services/api';

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Vertical', icon: Tag },
  { id: 3, label: 'Catalog', icon: Package },
  { id: 4, label: 'Channels', icon: Share2 },
  { id: 5, label: 'AI Config', icon: Bot },
  { id: 6, label: 'Review', icon: CheckSquare },
  { id: 7, label: 'Ready', icon: PartyPopper }
];

export function OnboardingPage({ onNavigate, user }) {
  const [currentStep, setCurrentStep] = useState(1);

  // Form State across the 7 steps
  const [data, setData] = useState({
    businessName: user?.storeName || '',
    website: '',
    location: 'United States (EST / PST)',
    vertical: 'Apparel & Lifestyle',
    avgPriceRange: '$50 - $150',
    sampleProduct: '',
    samplePrice: '',
    sampleSku: '',
    connectedChannels: { whatsapp: true, instagram: true, facebook: false },
    aiAssistantName: 'Kreazy Copilot',
    aiTone: 'Professional, warm, and concise',
    maxDiscount: '10%'
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCompleteOnboarding = async () => {
    try {
      if (data.sampleProduct && data.sampleProduct.trim()) {
        await productService.create({
          name: data.sampleProduct.trim(),
          price: parseFloat(data.samplePrice) || 0,
          stock: 25,
          sku: data.sampleSku?.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
          category: data.vertical || 'Apparel',
          variants: ['Standard'],
          aiKnowledge: `Grounding notes for ${data.businessName || 'our store'}. Sizing is standard.`,
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
          channels: ['whatsapp', 'instagram']
        });
      }

      await aiConfigService.updateConfig('general', {
        assistantName: data.aiAssistantName || 'Kreazy Copilot',
        brandTone: data.aiTone || 'Professional and warm'
      });

      await aiConfigService.updateConfig('safety', {
        maxDiscount: data.maxDiscount || '10%'
      });
    } catch (e) {
      console.error('Onboarding persistence error:', e);
    }
    onNavigate('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-surface)', padding: 'var(--space-8) 0' }}>
      <div className="onboarding-container">
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div className="brand-logo" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="Kreazy AI Logo" className="brand-logo-img" />
            <span className="brand-text">Kreazy <span className="brand-ai">AI</span> <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', marginLeft: '0.35rem' }}>Onboarding</span></span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => onNavigate('dashboard')}
          >
            Save & Exit to Dashboard
          </button>
        </div>

        {/* 7-Step Progress Stepper */}
        <div className="onboarding-progress-bar">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div
                key={step.id}
                className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                onClick={() => isCompleted && setCurrentStep(step.id)}
              >
                <div className="step-circle">
                  {isCompleted ? <CheckCircle2 size={16} /> : step.id}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Mobile Compact Progress Bar */}
        <div
          className="mobile-step-summary"
          style={{
            display: 'none',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Step {currentStep} of 7
            </div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--olive-950)' }}>
              {STEPS[currentStep - 1]?.label}
            </div>
          </div>
          <div style={{ width: '90px', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(currentStep / 7) * 100}%`, height: '100%', backgroundColor: 'var(--olive-700)', transition: 'width 0.3s ease' }}></div>
          </div>
        </div>

        {/* Step Content Box */}
        <div className="card onboarding-card" style={{ backgroundColor: '#ffffff', padding: 'var(--space-8)', boxShadow: 'var(--shadow-md)' }}>
          {/* STEP 1: BUSINESS INFO */}
          {currentStep === 1 && (
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Step 1 of 7</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Tell us about your business</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                This information establishes your brand identity for customer conversations and invoices.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <Input
                  label="Registered Business Name"
                  name="businessName"
                  value={data.businessName}
                  onChange={(e) => setData({ ...data, businessName: e.target.value })}
                />
                <Input
                  label="Store Website or Main Social URL"
                  name="website"
                  value={data.website}
                  onChange={(e) => setData({ ...data, website: e.target.value })}
                />
                <Select
                  label="Primary Customer Timezone / Region"
                  name="location"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  options={[
                    { value: 'United States (EST / PST)', label: 'United States (EST / PST)' },
                    { value: 'Europe (CET / GMT)', label: 'Europe (CET / GMT)' },
                    { value: 'Middle East (GST)', label: 'Middle East (GST)' },
                    { value: 'Asia Pacific (SGT / JST)', label: 'Asia Pacific (SGT / JST)' }
                  ]}
                />
              </div>
            </div>
          )}

          {/* STEP 2: VERTICAL */}
          {currentStep === 2 && (
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Step 2 of 7</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Select your retail category</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                KreazyAI tailors its conversation tone and sizing logic based on your industry.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {['Apparel & Lifestyle', 'Home & Ceramics', 'Fragrance & Cosmetics', 'Specialty Food & Beverage', 'Jewelry & Watches', 'Other Modern Retail'].map(v => (
                  <div
                    key={v}
                    onClick={() => setData({ ...data, vertical: v })}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${data.vertical === v ? 'var(--olive-700)' : 'var(--border-medium)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      backgroundColor: data.vertical === v ? 'var(--olive-50)' : '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.95rem'
                    }}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: ADD PRODUCTS */}
          {currentStep === 3 && (
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Step 3 of 7</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Seed your catalog (Optional)</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                Enter your flagship item or leave empty to import your catalog from Shopify or CSV in your workspace.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <Input
                  label="Sample Product Name (Optional)"
                  placeholder="e.g. Handcrafted Wool Knit Sweater (or leave empty)"
                  value={data.sampleProduct}
                  onChange={(e) => setData({ ...data, sampleProduct: e.target.value })}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Price ($ USD)"
                    type="number"
                    placeholder="e.g. 120.00"
                    value={data.samplePrice}
                    onChange={(e) => setData({ ...data, samplePrice: e.target.value })}
                  />
                  <Input
                    label="SKU Identifier"
                    placeholder="e.g. KNIT-001"
                    value={data.sampleSku}
                    onChange={(e) => setData({ ...data, sampleSku: e.target.value })}
                  />
                </div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  💡 You can bulk sync your entire 500+ SKU catalog automatically from Shopify or CSV in your dashboard anytime.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONNECT CHANNELS */}
          {currentStep === 4 && (
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Step 4 of 7</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Connect your Meta channels</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                Toggle which official channels you want KreazyAI to monitor.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <strong>WhatsApp Business Cloud API</strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Automate orders and direct inquiries</p>
                  </div>
                  <Badge variant="whatsapp">Ready to Connect</Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <strong>Instagram Direct Graph API</strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Handle DM product inquiries and story replies</p>
                  </div>
                  <Badge variant="instagram">Ready to Connect</Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <strong>Facebook Messenger</strong>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Connect your official Facebook Page messages</p>
                  </div>
                  <Badge variant="facebook">Ready to Connect</Badge>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: AI ASSISTANT CONFIG */}
          {currentStep === 5 && (
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Step 5 of 7</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Name & configure your AI Copilot</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                Personalize how the assistant introduces itself to your shoppers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <Input
                  label="Assistant Public Persona Name"
                  value={data.aiAssistantName}
                  onChange={(e) => setData({ ...data, aiAssistantName: e.target.value })}
                />
                <Select
                  label="Conversation Persona Tone"
                  value={data.aiTone}
                  onChange={(e) => setData({ ...data, aiTone: e.target.value })}
                  options={[
                    { value: 'Professional, warm, and concise', label: 'Professional, warm, and concise' },
                    { value: 'Friendly & Casual Lifestyle', label: 'Friendly & Casual Lifestyle' },
                    { value: 'Luxury & Elevated Concierge', label: 'Luxury & Elevated Concierge' },
                    { value: 'Direct & Technical Specialist', label: 'Direct & Technical Specialist' }
                  ]}
                />
                <Input
                  label="Maximum Allowed Discretionary Discount"
                  value={data.maxDiscount}
                  onChange={(e) => setData({ ...data, maxDiscount: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW SETTINGS */}
          {currentStep === 6 && (
            <div>
              <span className="eyebrow" style={{ marginBottom: '0.75rem' }}>Step 6 of 7</span>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Review your configuration</h2>
              <p style={{ marginBottom: '1.5rem', fontSize: '0.925rem' }}>
                Ensure your store parameters are accurate before activating the AI engine.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
                <div><strong>Store Name:</strong> {data.businessName}</div>
                <div><strong>Retail Vertical:</strong> {data.vertical}</div>
                <div><strong>Sample Item:</strong> {data.sampleProduct} (${data.samplePrice})</div>
                <div><strong>Assistant Name:</strong> {data.aiAssistantName}</div>
                <div><strong>Tone:</strong> {data.aiTone}</div>
                <div><strong>Discount Guardrail:</strong> Up to {data.maxDiscount} max</div>
              </div>
            </div>
          )}

          {/* STEP 7: COMPLETE SETUP */}
          {currentStep === 7 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <PartyPopper size={36} />
              </div>

              <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', color: 'var(--olive-950)' }}>
                Your workspace is ready!
              </h2>

              <p style={{ maxWidth: '520px', margin: '0 auto 2rem auto', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                KreazyAI has successfully initialized your commerce workspace for <strong>{data.businessName}</strong>.
                Your AI agent is prepped with your brand guidelines.
              </p>

              <Button
                variant="primary"
                size="lg"
                onClick={handleCompleteOnboarding}
                iconRight={ArrowRight}
              >
                Launch Workspace Dashboard
              </Button>
            </div>
          )}

          {/* Navigation Controls */}
          {currentStep < 7 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
              {currentStep > 1 ? (
                <Button variant="secondary" onClick={prevStep} icon={ArrowLeft}>
                  Previous
                </Button>
              ) : <div />}

              <Button variant="primary" onClick={nextStep} iconRight={ArrowRight}>
                {currentStep === 6 ? 'Finalize Setup' : 'Continue'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
