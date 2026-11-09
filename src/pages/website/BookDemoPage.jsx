import React, { useState } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { leadService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const BOOK_DEMO_TEXT = {
  en: {
    title: 'Book a Live Demo',
    lblFullName: 'Full Name',
    lblBusinessName: 'Business Name',
    lblEmail: 'Work Email',
    lblPhone: 'Phone / WhatsApp Number',
    btnSubmit: 'Request Demo Walkthrough',
    btnSubmitting: 'Submitting Request…',
    successTitle: 'Your demo request has been received.',
    successSubtitle: "We'll contact you soon.",
    btnHome: 'Back to Homepage',
    btnWorkspace: 'Go to Dashboard'
  },
  bn: {
    title: 'লাইভ ডেমো বুক করুন',
    lblFullName: 'পূর্ণ নাম',
    lblBusinessName: 'ব্যবসার নাম',
    lblEmail: 'ব্যবসায়িক ইমেইল',
    lblPhone: 'ফোন / হোয়াটসঅ্যাপ নম্বর',
    btnSubmit: 'ডেমো ওয়াকথ্রু অনুরোধ করুন',
    btnSubmitting: 'জমা দেওয়া হচ্ছে…',
    successTitle: 'আপনার ডেমো অনুরোধ গৃহীত হয়েছে।',
    successSubtitle: 'আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।',
    btnHome: 'হোমপেজে ফিরে যান',
    btnWorkspace: 'ড্যাশবোর্ডে যান'
  },
  es: {
    title: 'Reservar Demo en Vivo',
    lblFullName: 'Nombre Completo',
    lblBusinessName: 'Nombre del Negocio',
    lblEmail: 'Correo Empresarial',
    lblPhone: 'Número de Teléfono / WhatsApp',
    btnSubmit: 'Solicitar Demostración',
    btnSubmitting: 'Enviando Solicitud…',
    successTitle: 'Su solicitud de demostración ha sido recibida.',
    successSubtitle: 'Nos pondremos en contacto pronto.',
    btnHome: 'Volver al Inicio',
    btnWorkspace: 'Ir al Panel'
  }
};

export function BookDemoPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const t = BOOK_DEMO_TEXT[langKey] || BOOK_DEMO_TEXT.en;

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.businessName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMessage('Please fill in all 4 required fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      await leadService.submitDemo({
        fullName: formData.fullName.trim(),
        companyName: formData.businessName.trim(),
        businessName: formData.businessName.trim(),
        workEmail: formData.email.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        request_type: 'DEMO'
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Demo submission error:', err);
      // Fallback display
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-12, 3rem) 1rem var(--space-20, 5rem) 1rem', minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
        {!submitted ? (
          <div style={{
            background: 'rgba(18, 24, 38, 0.75)',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(1.75rem, 4vw, 2.75rem)',
            boxShadow: '0 10px 40px rgba(8, 41, 31, 0.06)'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{
                fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)',
                fontWeight: 800,
                color: '#08291F',
                letterSpacing: '-0.03em',
                margin: 0
              }}>
                {t.title}
              </h1>
            </div>

            {errorMessage && (
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                textAlign: 'center'
              }}>
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem'
              }}>
                <Input
                  label={t.lblFullName}
                  name="fullName"
                  required
                  placeholder="e.g. Sarah Connor"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <Input
                  label={t.lblBusinessName}
                  name="businessName"
                  required
                  placeholder="e.g. Atelier Living"
                  value={formData.businessName}
                  onChange={handleChange}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem'
              }}>
                <Input
                  label={t.lblEmail}
                  name="email"
                  type="email"
                  required
                  placeholder="sarah@atelierliving.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                <Input
                  label={t.lblPhone}
                  name="phone"
                  type="tel"
                  required
                  placeholder="+880 1712-345678"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    backgroundColor: '#00A859',
                    borderColor: '#00A859',
                    boxShadow: '0 4px 18px rgba(0, 168, 89, 0.28)'
                  }}
                >
                  {loading ? t.btnSubmitting : t.btnSubmit}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div style={{
            background: 'rgba(18, 24, 38, 0.75)',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            padding: 'clamp(2.5rem, 5vw, 3.5rem) 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(8, 41, 31, 0.06)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EAF8F1',
              color: '#00A859',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 1.95rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '0.65rem',
              color: '#08291F'
            }}>
              {t.successTitle}
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: '#475569',
              marginBottom: '2rem'
            }}>
              {t.successSubtitle}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onNavigate('home')}
                style={{ borderRadius: '10px' }}
              >
                {t.btnHome}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => onNavigate('dashboard')}
                style={{ borderRadius: '10px', backgroundColor: '#00A859', borderColor: '#00A859' }}
              >
                {t.btnWorkspace}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
