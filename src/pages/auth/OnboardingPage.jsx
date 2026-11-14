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
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { productService, aiConfigService } from '../../services/api';

const STEPS = [
  { id: 1, label: 'Business Info', icon: Building2 },
  { id: 2, label: 'Vertical',      icon: Tag },
  { id: 3, label: 'Catalog',       icon: Package },
  { id: 4, label: 'Channels',      icon: Share2 },
  { id: 5, label: 'AI Config',     icon: Bot },
  { id: 6, label: 'Review',        icon: CheckSquare },
  { id: 7, label: 'Ready',         icon: PartyPopper }
];

export function OnboardingPage({ onNavigate, user }) {
  const [currentStep, setCurrentStep] = useState(1);

  const [data, setData] = useState({
    businessName:      user?.storeName || '',
    website:           '',
    location:          'United States (EST / PST)',
    vertical:          'Apparel & Lifestyle',
    avgPriceRange:     '$50 - $150',
    sampleProduct:     '',
    samplePrice:       '',
    sampleSku:         '',
    connectedChannels: { whatsapp: true, instagram: true, facebook: false },
    aiAssistantName:   'Kreazy Copilot',
    aiTone:            'Professional, warm, and concise',
    maxDiscount:       '10%'
  });

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCompleteOnboarding = async () => {
    try {
      if (data.sampleProduct && data.sampleProduct.trim()) {
        await productService.create({
          name:        data.sampleProduct.trim(),
          price:       parseFloat(data.samplePrice) || 0,
          stock:       25,
          sku:         data.sampleSku?.trim() || `SKU-${Math.floor(100 + Math.random() * 900)}`,
          category:    data.vertical || 'Apparel',
          variants:    ['Standard'],
          aiKnowledge: `Grounding notes for ${data.businessName || 'our store'}. Sizing is standard.`,
          image:       'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80',
          channels:    ['whatsapp', 'instagram']
        });
      }
      await aiConfigService.updateConfig('general', {
        assistantName: data.aiAssistantName || 'Kreazy Copilot',
        brandTone:     data.aiTone || 'Professional and warm'
      });
      await aiConfigService.updateConfig('safety', {
        maxDiscount: data.maxDiscount || '10%'
      });
    } catch (e) {
      console.error('Onboarding persistence error:', e);
    }
    onNavigate('dashboard');
  };

  /* ─── shared dark-theme style tokens ─────────────────────────────── */
  const card = {
    backgroundColor: 'var(--bg-card)',
    backdropFilter:  'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border:          '1px solid var(--border-subtle)',
    borderRadius:    'var(--radius-panel)',
    padding:         'var(--space-8)',
    boxShadow:       'var(--shadow-panel)'
  };

  const vertexCard = (active) => ({
    padding:         '1rem',
    border:          `1.5px solid ${active ? 'var(--primary-accent)' : 'var(--border-subtle)'}`,
    borderRadius:    'var(--radius-nested)',
    cursor:          'pointer',
    backgroundColor: active ? 'rgba(189, 211, 148, 0.14)' : 'rgba(16, 26, 22, 0.75)',
    color:           active ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontWeight:      600,
    fontSize:        '0.95rem',
    transition:      'all 0.18s ease'
  });

  const channelRow = {
    display:         'flex',
    alignItems:      'center',
    justifyContent:  'space-between',
    padding:         '1rem 1.15rem',
    border:          '1px solid var(--border-medium)',
    borderRadius:    'var(--radius-lg)',
    backgroundColor: 'var(--bg-elevated)'
  };

  const reviewBox = {
    display:         'flex',
    flexDirection:   'column',
    gap:             '0.75rem',
    backgroundColor: 'var(--bg-subtle)',
    padding:         '1.25rem',
    borderRadius:    'var(--radius-lg)',
    border:          '1px solid var(--border-subtle)'
  };

  const divider = {
    borderTop:  '1px solid var(--border-subtle)',
    marginTop:  'var(--space-8)',
    paddingTop: 'var(--space-5)'
  };

  const tipBox = {
    padding:         '0.75rem 1rem',
    backgroundColor: 'rgba(143,166,83,0.10)',
    border:          '1px solid rgba(143,166,83,0.22)',
    borderRadius:    'var(--radius-md)',
    fontSize:        '0.85rem',
    color:           'var(--text-secondary)'
  };

  /* ─── render ───────────────────────────────────────────────────────── */
  return (
    <div className="onboarding-page">
      <div className="onboarding-container">

        {/* ── Top Header ── */}
        <div className="onboarding-header">
          <div
            className="brand-logo"
            onClick={() => onNavigate('home')}
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}
            title="KreazyAI"
          >
            <img src="/logo-mark.png" alt="Kreazy AI Emblem" className="brand-logo-mark" style={{ height: '26px' }} />
            <img src="/logo-white.svg" alt="KreazyAI" className="brand-logo-img" />
            <span className="onboarding-label" style={{ marginLeft: '0.25rem' }}>Onboarding</span>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={() => onNavigate('dashboard')}
          >
            Save &amp; Exit to Dashboard
          </button>
        </div>

        {/* ── 7-Step Horizontal Progress Bar ── */}
        <div className="onboarding-progress-bar">
          {STEPS.map((step) => {
            const isActive    = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div
                key={step.id}
                className={`step-indicator${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}
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

        {/* ── Mobile compact summary (shown only on narrow screens) ── */}
        <div className="mobile-step-summary">
          <div>
            <div className="mobile-step-counter">Step {currentStep} of 7</div>
            <div className="mobile-step-name">{STEPS[currentStep - 1]?.label}</div>
          </div>
          <div className="mobile-step-track">
            <div
              className="mobile-step-fill"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Step Content Card ── */}
        <div style={card}>

          {/* STEP 1 — BUSINESS INFO */}
          {currentStep === 1 && (
            <div>
              <span className="eyebrow">Step 1 of 7</span>
              <h2 className="onboarding-h2">Tell us about your business</h2>
              <p className="onboarding-p">
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
                    { value: 'United States (EST / PST)',   label: 'United States (EST / PST)' },
                    { value: 'Europe (CET / GMT)',          label: 'Europe (CET / GMT)' },
                    { value: 'Middle East (GST)',           label: 'Middle East (GST)' },
                    { value: 'Asia Pacific (SGT / JST)',    label: 'Asia Pacific (SGT / JST)' }
                  ]}
                />
              </div>
            </div>
          )}

          {/* STEP 2 — VERTICAL */}
          {currentStep === 2 && (
            <div>
              <span className="eyebrow">Step 2 of 7</span>
              <h2 className="onboarding-h2">Select your retail category</h2>
              <p className="onboarding-p">
                KreazyAI tailors its conversation tone and sizing logic based on your industry.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
                {[
                  'Apparel & Lifestyle',
                  'Home & Ceramics',
                  'Fragrance & Cosmetics',
                  'Specialty Food & Beverage',
                  'Jewelry & Watches',
                  'Other Modern Retail'
                ].map(v => (
                  <div
                    key={v}
                    onClick={() => setData({ ...data, vertical: v })}
                    style={vertexCard(data.vertical === v)}
                  >
                    {v}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — CATALOG */}
          {currentStep === 3 && (
            <div>
              <span className="eyebrow">Step 3 of 7</span>
              <h2 className="onboarding-h2">Seed your catalog <span style={{ opacity: 0.55, fontSize: '1.1rem' }}>(Optional)</span></h2>
              <p className="onboarding-p">
                Enter your flagship item or leave empty to import from Shopify or CSV in your workspace.
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
                <div style={tipBox}>
                  You can bulk sync your catalog from Shopify or CSV in your dashboard anytime.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 — CHANNELS */}
          {currentStep === 4 && (
            <div>
              <span className="eyebrow">Step 4 of 7</span>
              <h2 className="onboarding-h2">Connect your Meta channels</h2>
              <p className="onboarding-p">
                Toggle which official channels you want KreazyAI to monitor.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={channelRow}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>WhatsApp Business Cloud API</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Automate orders and direct inquiries</div>
                  </div>
                  <Badge variant="whatsapp">Ready to Connect</Badge>
                </div>
                <div style={channelRow}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Instagram Direct Graph API</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Handle DM product inquiries and story replies</div>
                  </div>
                  <Badge variant="instagram">Ready to Connect</Badge>
                </div>
                <div style={channelRow}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Facebook Messenger</div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Connect your official Facebook Page messages</div>
                  </div>
                  <Badge variant="facebook">Ready to Connect</Badge>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 — AI CONFIG */}
          {currentStep === 5 && (
            <div>
              <span className="eyebrow">Step 5 of 7</span>
              <h2 className="onboarding-h2">Name &amp; configure your AI Copilot</h2>
              <p className="onboarding-p">
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
                    { value: 'Friendly & Casual Lifestyle',     label: 'Friendly & Casual Lifestyle' },
                    { value: 'Luxury & Elevated Concierge',     label: 'Luxury & Elevated Concierge' },
                    { value: 'Direct & Technical Specialist',   label: 'Direct & Technical Specialist' }
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

          {/* STEP 6 — REVIEW */}
          {currentStep === 6 && (
            <div>
              <span className="eyebrow">Step 6 of 7</span>
              <h2 className="onboarding-h2">Review your configuration</h2>
              <p className="onboarding-p">
                Ensure your store parameters are accurate before activating the AI engine.
              </p>
              <div style={reviewBox}>
                {[
                  ['Store Name',        data.businessName],
                  ['Retail Vertical',   data.vertical],
                  ['Sample Item',       data.sampleProduct ? `${data.sampleProduct} ($${data.samplePrice})` : '—'],
                  ['Assistant Name',    data.aiAssistantName],
                  ['Tone',              data.aiTone],
                  ['Discount Guardrail',`Up to ${data.maxDiscount} max`]
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.925rem' }}>
                    <span style={{ color: 'var(--text-muted)', minWidth: '150px' }}>{label}:</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7 — READY */}
          {currentStep === 7 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div className="onboarding-success-icon">
                <PartyPopper size={36} />
              </div>
              <h2 className="onboarding-h2" style={{ fontSize: '2rem' }}>
                Your workspace is ready!
              </h2>
              <p className="onboarding-p" style={{ maxWidth: '520px', margin: '0 auto 2rem auto', fontSize: '1rem' }}>
                KreazyAI has successfully initialized your commerce workspace for{' '}
                <strong style={{ color: 'var(--olive-300)' }}>{data.businessName}</strong>.
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

          {/* ── Navigation Controls ── */}
          {currentStep < 7 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', ...divider }}>
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

        </div>{/* /card */}
      </div>
    </div>
  );
}
