import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input, Textarea, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { leadService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const CONTACT_TEXT = {
  en: {
    eyebrow: 'Get In Touch',
    title: 'We are here to help you scale your commerce',
    subtitle: 'Have a question about channel integrations, custom pricing, or enterprise SLAs? Reach out and our product team will assist you.',
    emailTitle: 'Email Inquiries',
    generalEmail: 'General inquiries: hello@kreazy.ai',
    salesEmail: 'Enterprise & Partnerships: sales@kreazy.ai',
    supportEmail: 'Technical Support: support@kreazy.ai',
    responseTime: 'Response time within 4 business hours.',
    hoursTitle: 'Operating Hours',
    hoursP1: 'Customer Engineering & Solutions: Monday – Friday: 9:00 AM – 7:00 PM EST',
    hoursP2: 'Critical API Incident Monitoring: 24/7/365',
    walkthroughTitle: 'Want an interactive walkthrough instead?',
    walkthroughDesc: 'Skip the back-and-forth email and book a live screen-share with a retail specialist.',
    btnWalkthrough: 'Book a Live Demo',
    formTitle: 'Send Us a Message',
    lblName: 'Your Name',
    lblEmail: 'Business Email',
    lblInquiryType: 'Inquiry Type',
    opt1: 'Product Inquiry',
    opt2: 'Enterprise Solutions',
    opt3: 'Partnership',
    opt4: 'Technical Support',
    lblMessage: 'Your Message',
    btnSend: 'Send Message',
    btnSending: 'Sending…',
    errValidation: 'Please fill in your name, email, and message.',
    errSubmission: 'Unable to send inquiry. Please try again or email hello@kreazy.ai directly.',
    successTitle: 'Inquiry Received',
    successDesc: 'Thank you for reaching out! A specialist will review your request and get back to you within 4 business hours.',
    btnSendAnother: 'Send Another Message'
  },
  bn: {
    eyebrow: 'যোগাযোগ করুন',
    title: 'আপনার ব্যবসা প্রসারে আমরা সবসময় পাশে আছি',
    subtitle: 'চ্যানেল ইন্টিগ্রেশন, কাস্টম প্রাইসিং বা এন্টারপ্রাইজ সাপোর্ট নিয়ে যেকোনো প্রশ্ন থাকলে আমাদের জানান, টিম দ্রুত সাহায্য করবে।',
    emailTitle: 'ইমেইল যোগাযোগ',
    generalEmail: 'সাধারণ জিজ্ঞাসা: hello@kreazy.ai',
    salesEmail: 'এন্টারপ্রাইজ ও পার্টনারশিপ: sales@kreazy.ai',
    supportEmail: 'টেকনিক্যাল সাপোর্ট: support@kreazy.ai',
    responseTime: '৪ কর্মঘণ্টার মধ্যে উত্তর দেওয়া হয়।',
    hoursTitle: 'অফিস সময়সূচী',
    hoursP1: 'গ্রাহক প্রকৌশল ও সহায়তা: সোম – শুক্র: সকাল ৯:০০ – সন্ধ্যা ৭:০০ (EST / BST)',
    hoursP2: 'সার্ভার ও এপিআই নিরবচ্ছিন্ন পর্যবেক্ষণ: ২৪/৭/৩৬৫',
    walkthroughTitle: 'সরাসরি লাইভ ডেমো দেখতে চান?',
    walkthroughDesc: 'ইমেইলের দীর্ঘ অপেক্ষার বদলে আমাদের রিটেল বিশেষজ্ঞের সাথে স্ক্রিন-শেয়ারে সরাসরি ডেমো বুক করুন।',
    btnWalkthrough: 'লাইভ ডেমো বুক করুন',
    formTitle: 'আমাদের বার্তা পাঠান',
    lblName: 'আপনার নাম',
    lblEmail: 'ব্যবসায়িক ইমেইল',
    lblInquiryType: 'জিজ্ঞাসার ধরন',
    opt1: 'পণ্য ও ফিচার সম্পর্কিত',
    opt2: 'এন্টারপ্রাইজ সমাধান',
    opt3: 'পার্টনারশিপ ও সহযোগিতা',
    opt4: 'প্রযুক্তিগত সহায়তা',
    lblMessage: 'আপনার বার্তা',
    btnSend: 'বার্তা পাঠান',
    btnSending: 'পাঠানো হচ্ছে…',
    errValidation: 'অনুগ্রহ করে আপনার নাম, ইমেইল এবং বার্তা লিখুন।',
    errSubmission: 'বার্তা পাঠানো সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন অথবা সরাসরি hello@kreazy.ai ঠিকানায় ইমেইল করুন।',
    successTitle: 'বার্তা গৃহীত হয়েছে!',
    successDesc: 'যোগাযোগের জন্য ধন্যবাদ! আমাদের একজন বিশেষজ্ঞ আপনার বার্তাটি পর্যালোচনা করে ৪ কর্মঘণ্টার মধ্যে যোগাযোগ করবেন।',
    btnSendAnother: 'আরেকটি বার্তা পাঠান'
  },
  es: {
    eyebrow: 'Contáctenos',
    title: 'Estamos aquí para ayudarle a escalar su comercio',
    subtitle: '¿Tiene preguntas sobre integraciones, precios personalizados o acuerdos empresariales? Escríbanos y nuestro equipo le asesorará.',
    emailTitle: 'Consultas por Correo',
    generalEmail: 'Consultas generales: hello@kreazy.ai',
    salesEmail: 'Empresas y Alianzas: sales@kreazy.ai',
    supportEmail: 'Soporte Técnico: support@kreazy.ai',
    responseTime: 'Tiempo de respuesta dentro de 4 horas hábiles.',
    hoursTitle: 'Horario de Atención',
    hoursP1: 'Ingeniería y Soluciones al Cliente: Lunes a Viernes: 9:00 AM – 7:00 PM EST',
    hoursP2: 'Monitoreo de Infraestructura Crítica de API: 24/7/365',
    walkthroughTitle: '¿Prefiere una demostración interactiva?',
    walkthroughDesc: 'Evite correos de ida y vuelta y programe una sesión en vivo con un especialista en retail.',
    btnWalkthrough: 'Reservar Demo en Vivo',
    formTitle: 'Envíenos un Mensaje',
    lblName: 'Su Nombre',
    lblEmail: 'Correo Empresarial',
    lblInquiryType: 'Tipo de Consulta',
    opt1: 'Consulta de Producto',
    opt2: 'Soluciones Empresariales',
    opt3: 'Alianzas Estratégicas',
    opt4: 'Soporte Técnico',
    lblMessage: 'Su Mensaje',
    btnSend: 'Enviar Mensaje',
    btnSending: 'Enviando…',
    errValidation: 'Por favor complete su nombre, correo y mensaje.',
    errSubmission: 'No se pudo enviar el mensaje. Inténtelo nuevamente o escriba a hello@kreazy.ai.',
    successTitle: '¡Consulta Recibida!',
    successDesc: '¡Gracias por contactarnos! Un especialista revisará su solicitud y le responderá dentro de 4 horas hábiles.',
    btnSendAnother: 'Enviar Otro Mensaje'
  }
};

export function ContactPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const t = CONTACT_TEXT[langKey] || CONTACT_TEXT.en;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'Product Inquiry',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError(t.errValidation);
      return;
    }

    setLoading(true);
    setError('');
    try {
      await leadService.submitContactInquiry(formData);
      setSubmitted(true);
    } catch {
      setError(t.errSubmission);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="contact-page-grid">
          {/* Left Contact Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Mail size={20} color="var(--olive-700)" />
                <h4 style={{ fontSize: '1.05rem' }}>{t.emailTitle}</h4>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                <strong>hello@kreazy.ai</strong><br />
                <strong>sales@kreazy.ai</strong><br />
                <strong>support@kreazy.ai</strong>
              </p>
              <small style={{ color: 'var(--text-muted)' }}>{t.responseTime}</small>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Clock size={20} color="var(--olive-700)" />
                <h4 style={{ fontSize: '1.05rem' }}>{t.hoursTitle}</h4>
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                {t.hoursP1}<br />
                <strong>{t.hoursP2}</strong>
              </p>
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>{t.walkthroughTitle}</h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                {t.walkthroughDesc}
              </p>
              <Button variant="primary" size="sm" onClick={() => onNavigate('book-demo')} iconRight={ArrowRight}>
                {t.btnWalkthrough}
              </Button>
            </div>
          </div>

          {/* Right Contact Form */}
          <div className="card" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-8)' }}>
            {!submitted ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{t.formTitle}</h3>

                <Input
                  label={t.lblName}
                  name="name"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Input
                  label={t.lblEmail}
                  type="email"
                  name="email"
                  required
                  placeholder="alex@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <Select
                  label={t.lblInquiryType}
                  name="inquiryType"
                  value={formData.inquiryType}
                  onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                  options={[
                    { value: 'Product Inquiry', label: t.opt1 },
                    { value: 'Enterprise Solutions', label: t.opt2 },
                    { value: 'Partnership', label: t.opt3 },
                    { value: 'Technical Support', label: t.opt4 }
                  ]}
                />

                <Textarea
                  label={t.lblMessage}
                  name="message"
                  required
                  rows={4}
                  placeholder="How can we help your store scale?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />

                {error && (
                  <div style={{ color: 'var(--status-danger)', fontSize: '0.85rem' }}>
                    {error}
                  </div>
                )}

                <Button type="submit" variant="primary" loading={loading} style={{ marginTop: '0.5rem' }}>
                  {loading ? t.btnSending : t.btnSend}
                </Button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{t.successTitle}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  {t.successDesc}
                </p>
                <Button variant="secondary" onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', inquiryType: 'Product Inquiry', message: '' }); }}>
                  {t.btnSendAnother}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
