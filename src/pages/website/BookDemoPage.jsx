import React, { useState } from 'react';
import { CheckCircle2, Calendar, Clock, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';
import { Input, Select, Textarea } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { leadService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

const BOOK_DEMO_TEXT = {
  en: {
    eyebrow: 'Personalized Walkthrough',
    title: 'Schedule a Live KreazyAI Product Demonstration',
    subtitle: 'See how KreazyAI can automate your specific catalog, Meta channels, and sales workflows in real-time.',
    sidebarTitle: 'What to expect during your demo',
    sidebarDesc: 'Our solutions team will walk you through a tailored live demo configured for your retail niche.',
    step1Title: 'Live Channel Simulation',
    step1Desc: 'We test real customer inquiries on WhatsApp and Instagram in front of you.',
    step2Title: 'Catalog Grounding Setup',
    step2Desc: 'How your SKUs, sizes, and pricing rules are ingested into the AI assistant.',
    step3Title: 'Guardrails & Human Handoff',
    step3Desc: 'Reviewing discount constraints, sentiment alerts, and team intervention.',
    privacyTitle: 'Enterprise Privacy Guaranteed',
    privacyDesc: 'Your store volume and customer details remain strictly confidential and never used for generic model training.',
    lblFullName: 'Full Name',
    lblBusinessName: 'Business Name',
    lblEmail: 'Work Email',
    lblPhone: 'Phone / WhatsApp Number',
    lblCategory: 'Business Category',
    lblWebsite: 'Store Website or Instagram Handle',
    lblChannel: 'Primary Sales Channel',
    lblMonthlyOrders: 'Estimated Monthly Orders',
    lblDate: 'Preferred Demo Date',
    lblTime: 'Preferred Time Window (BST / EST)',
    lblMessage: 'What is your biggest messaging or sales bottleneck right now?',
    msgPlaceholder: 'e.g. We get overwhelmed with sizing questions on Instagram DMs every evening...',
    btnSubmit: 'Request Demo Walkthrough',
    btnSubmitting: 'Scheduling Walkthrough…',
    successTitle: 'Your demo request has been received',
    successDesc: (name, biz) => `Thank you, ${name}. A dedicated KreazyAI retail automation specialist has received your inquiry for ${biz}.`,
    nextTitle: 'What happens next:',
    nextCalendar: (email) => `Calendar invite dispatched to ${email}`,
    nextWindow: 'Expected confirmation window: Within 2 business hours',
    nextContact: 'Direct support contact: concierge@kreazy.ai',
    btnHome: 'Back to Homepage',
    btnWorkspace: 'Preview Demo Workspace',
    timeMorning: 'Morning (10:00 AM - 1:00 PM BST / Local)',
    timeAfternoon: 'Afternoon (2:00 PM - 5:00 PM BST / Local)',
    timeEvening: 'Evening (6:00 PM - 9:00 PM BST / 8-11 AM EST)',
    timeNight: 'Night (9:00 PM - 11:00 PM BST / 11 AM - 1 PM EST)'
  },
  bn: {
    eyebrow: 'পার্সোনালাইজড ওয়াকথ্রু',
    title: 'ক্রেজি এআই লাইভ প্রোডাক্ট ডেমো শিডিউল করুন',
    subtitle: 'লাইভে দেখুন কীভাবে ক্রেজি এআই আপনার নিজস্ব ক্যাটালগ, মেটা চ্যানেল এবং সেলস প্রসেস স্বয়ংক্রিয় করে তোলে।',
    sidebarTitle: 'ডেমোতে যা যা দেখানো হবে',
    sidebarDesc: 'আমাদের সলিউশন দল আপনার রিটেইল খাতের উপযোগী একটি কাস্টম লাইভ ডেমো পরিচালনা করবে।',
    step1Title: 'লাইভ চ্যানেল সিমুলেশন',
    step1Desc: 'আপনার চোখের সামনে হোয়াটসঅ্যাপ এবং ইনস্টাগ্রামে রিয়েল গ্রাহক বার্তা পরীক্ষা করে দেখানো হবে।',
    step2Title: 'ক্যাটালগ গ্রাউন্ডিং সেটআপ',
    step2Desc: 'কীভাবে আপনার পণ্য, সাইজ ও মূল্যের নিয়মাবলী এআই অ্যাসিস্ট্যান্টে অন্তর্ভুক্ত করা হয়।',
    step3Title: 'সুরক্ষা ও হিউম্যান হ্যান্ডঅফ',
    step3Desc: 'ডিসকাউন্ট সীমাবদ্ধতা, নেতিবাচক অনুভূতির সতর্কতা ও ১-ক্লিকে মানুষের হস্তক্ষেপ ব্যবস্থা।',
    privacyTitle: 'এন্টারপ্রাইজ গোপনীয়তা সম্পূর্ণ সুরক্ষিত',
    privacyDesc: 'আপনার বিক্রয়ের পরিমাণ ও গ্রাহকদের ব্যক্তিগত তথ্য সম্পূর্ণ সুরক্ষিত থাকবে এবং কোনো পাবলিক মডেলের প্রশিক্ষণে ব্যবহৃত হবে না।',
    lblFullName: 'পূর্ণ নাম',
    lblBusinessName: 'ব্যবসার নাম',
    lblEmail: 'ব্যবসায়িক ইমেইল',
    lblPhone: 'ফোন / হোয়াটসঅ্যাপ নম্বর',
    lblCategory: 'ব্যবসার ধরন / ক্যাটাগরি',
    lblWebsite: 'ওয়েবসাইট অথবা ইনস্টাগ্রাম লিংক',
    lblChannel: 'প্রধান বিক্রয় চ্যানেল',
    lblMonthlyOrders: 'মাসিক আনুমানিক অর্ডারের সংখ্যা',
    lblDate: 'ডেমোর পছন্দের তারিখ',
    lblTime: 'পছন্দের সময়সূচী (BST / EST)',
    lblMessage: 'বর্তমানে আপনার ইনবক্স মেসেজ বা বিক্রয়ের প্রধান সমস্যা কোনটি?',
    msgPlaceholder: 'যেমন: প্রতিদিন সন্ধ্যায় ইনস্টাগ্রাম ডিএমে সাইজ সম্পর্কিত অতিরিক্ত মেসেজের উত্তর দিতে হিমশিম খেতে হয়...',
    btnSubmit: 'ডেমো ওয়াকথ্রু অনুরোধ করুন',
    btnSubmitting: 'শিডিউল করা হচ্ছে…',
    successTitle: 'আপনার ডেমো অনুরোধ গৃহীত হয়েছে!',
    successDesc: (name, biz) => `ধন্যবাদ, ${name}। ক্রেজি এআই-এর একজন বিশেষজ্ঞ ${biz}-এর জন্য আপনার ডেমো অনুরোধ পেয়েছেন।`,
    nextTitle: 'পরবর্তী ধাপসমূহ:',
    nextCalendar: (email) => `${email} ঠিকানায় গুগল মিট ক্যালেন্ডার ইনভাইট পাঠানো হবে`,
    nextWindow: 'নিশ্চিতকরণের সময়সীমা: ২ ব্যবসায়িক ঘণ্টার মধ্যে',
    nextContact: 'সরাসরি সহায়তা ইমেইল: concierge@kreazy.ai',
    btnHome: 'হোমপেজে ফিরে যান',
    btnWorkspace: 'ডেমো ওয়ার্কস্পেস প্রিভিউ',
    timeMorning: 'সকাল (১০:০০ AM - ০১:০০ PM BST / লোকাল)',
    timeAfternoon: 'দুপুর (০২:০০ PM - ০৫:০০ PM BST / লোকাল)',
    timeEvening: 'সন্ধ্যা (০৬:০০ PM - ০৯:০০ PM BST / লোকাল)',
    timeNight: 'রাত (০৯:০০ PM - ১১:০০ PM BST / লোকাল)'
  },
  es: {
    eyebrow: 'Demostración Personalizada',
    title: 'Programe una Demostración en Vivo de KreazyAI',
    subtitle: 'Compruebe cómo KreazyAI puede automatizar su catálogo, canales de Meta y flujos de ventas en tiempo real.',
    sidebarTitle: 'Qué esperar durante su demo',
    sidebarDesc: 'Nuestro equipo le mostrará una sesión en vivo configurada para su sector comercial.',
    step1Title: 'Simulación de Canales en Vivo',
    step1Desc: 'Probamos consultas reales de clientes en WhatsApp e Instagram frente a usted.',
    step2Title: 'Configuración de Catálogo',
    step2Desc: 'Cómo sus productos, tallas y reglas de precios se integran en el asistente de IA.',
    step3Title: 'Salvaguardas y Derivación Humana',
    step3Desc: 'Revisión de límites de descuento, alertas de sentimiento e intervención del equipo.',
    privacyTitle: 'Privacidad Empresarial Garantizada',
    privacyDesc: 'El volumen de su tienda y los datos de clientes son estrictamente confidenciales y nunca se usan para entrenar modelos públicos.',
    lblFullName: 'Nombre Completo',
    lblBusinessName: 'Nombre de la Empresa / Marca',
    lblEmail: 'Correo Empresarial',
    lblPhone: 'Número de Teléfono / WhatsApp',
    lblCategory: 'Categoría Comercial',
    lblWebsite: 'Sitio Web o Instagram de la Tienda',
    lblChannel: 'Canal de Venta Principal',
    lblMonthlyOrders: 'Pedidos Mensuales Estimados',
    lblDate: 'Fecha Preferida de Demo',
    lblTime: 'Franja Horaria Preferida (BST / EST)',
    lblMessage: '¿Cuál es su mayor cuello de botella en ventas o mensajería actualmente?',
    msgPlaceholder: 'ej. Nos abruman las preguntas de tallas en Instagram cada tarde...',
    btnSubmit: 'Solicitar Demostración',
    btnSubmitting: 'Programando Demostración…',
    successTitle: 'Su solicitud de demostración ha sido recibida',
    successDesc: (name, biz) => `Gracias, ${name}. Un especialista en automatización minorista de KreazyAI ha recibido su consulta para ${biz}.`,
    nextTitle: 'Qué sucede a continuación:',
    nextCalendar: (email) => `Invitación de calendario enviada a ${email}`,
    nextWindow: 'Plazo estimado de confirmación: Dentro de 2 horas hábiles',
    nextContact: 'Contacto directo de soporte: concierge@kreazy.ai',
    btnHome: 'Volver a la Página Principal',
    btnWorkspace: 'Vista Previa del Espacio de Trabajo',
    timeMorning: 'Mañana (10:00 AM - 1:00 PM BST / Local)',
    timeAfternoon: 'Tarde (2:00 PM - 5:00 PM BST / Local)',
    timeEvening: 'Tarde-Noche (6:00 PM - 9:00 PM BST / Local)',
    timeNight: 'Noche (9:00 PM - 11:00 PM BST / Local)'
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
      setLeadDetails(res.lead || formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Demo submission error:', err);
      // Fallback display
      setLeadDetails(formData);
      setSubmitted(true);
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
              <span className="eyebrow">{t.eyebrow}</span>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>

            <div className="demo-page-layout">
              {/* Left Column: Why Demo & What to Expect */}
              <div className="demo-sidebar-card">
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                    {t.sidebarTitle}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t.sidebarDesc}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      1
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.step1Title}</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{t.step1Desc}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      2
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.step2Title}</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{t.step2Desc}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--olive-100)', color: 'var(--olive-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, fontSize: '0.85rem' }}>
                      3
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.step3Title}</strong>
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{t.step3Desc}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-canvas-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-medium)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    <ShieldCheck size={16} color="var(--bright-olive)" /> {t.privacyTitle}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t.privacyDesc}
                  </p>
                </div>
              </div>

              {/* Right Column: High-Converting Form */}
              <div className="demo-form-card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <div className="demo-form-grid-2">
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

                  <div className="demo-form-grid-2">
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

                  <div className="demo-form-grid-2">
                    <Select
                      label={t.lblCategory}
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
                      label={t.lblWebsite}
                      name="website"
                      placeholder="https://yourstore.com"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Select
                      label={t.lblChannel}
                      name="primaryChannel"
                      value={formData.primaryChannel}
                      onChange={handleChange}
                      options={[
                        { value: 'WhatsApp', label: 'WhatsApp Business' },
                        { value: 'Instagram', label: 'Instagram Direct' },
                        { value: 'Facebook Messenger', label: 'Facebook Messenger' },
                        { value: 'All of the above', label: 'All Channels (Omnichannel)' }
                      ]}
                    />
                    <Select
                      label={t.lblMonthlyOrders}
                      name="monthlyOrders"
                      value={formData.monthlyOrders}
                      onChange={handleChange}
                      options={[
                        { value: '< 100 orders/month', label: '< 100 orders / mo' },
                        { value: '100 - 500 orders/month', label: '100 - 500 orders / mo' },
                        { value: '500 - 2,000 orders/month', label: '500 - 2,000 orders / mo' },
                        { value: '2,000+ orders/month', label: '2,000+ orders / mo' }
                      ]}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label={t.lblDate}
                      name="preferredDate"
                      type="date"
                      required
                      value={formData.preferredDate}
                      onChange={handleChange}
                    />
                    <Select
                      label={t.lblTime}
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      options={[
                        { value: '10:00 AM - 01:00 PM BST / 12:00 AM - 03:00 AM EST', label: t.timeMorning },
                        { value: '02:00 PM - 05:00 PM BST / 04:00 AM - 07:00 AM EST', label: t.timeAfternoon },
                        { value: '06:00 PM - 09:00 PM BST / 08:00 AM - 11:00 AM EST', label: t.timeEvening },
                        { value: '09:00 PM - 11:00 PM BST / 11:00 AM - 01:00 PM EST', label: t.timeNight }
                      ]}
                    />
                  </div>

                  <Textarea
                    label={t.lblMessage}
                    name="message"
                    rows={3}
                    placeholder={t.msgPlaceholder}
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
                    {loading ? t.btnSubmitting : t.btnSubmit}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Confirmation Success State */
          <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-12) var(--space-8)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6) auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {t.successTitle}
            </h2>

            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {t.successDesc(leadDetails?.fullName || formData.fullName, leadDetails?.businessName || formData.businessName)}
            </p>

            <div style={{ backgroundColor: 'var(--bg-canvas-alt)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.nextTitle}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={16} color="var(--bright-olive)" />
                  {t.nextCalendar(leadDetails?.email || formData.email)}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} color="var(--bright-olive)" />
                  {t.nextWindow}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <MessageSquare size={16} color="var(--bright-olive)" />
                  {t.nextContact}
                </li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => onNavigate('home')}>
                {t.btnHome}
              </Button>
              <Button variant="primary" onClick={() => onNavigate('dashboard')}>
                {t.btnWorkspace}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
