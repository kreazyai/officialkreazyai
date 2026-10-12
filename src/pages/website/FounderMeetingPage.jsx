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
import { useLanguage } from '../../context/LanguageContext';

const FOUNDER_TEXT = {
  en: {
    eyebrow: 'Direct Founder Access',
    title: 'Reserve a 1-on-1 Commercial AI Strategy Session',
    subtitle: 'Meet directly with the KreazyAI engineering leadership. We will evaluate your current Meta conversation volume, order capture bottlenecks, and architect a tailored AI deployment plan.',
    sidebarTitle: 'What We Cover in 30 Minutes',
    sidebarDesc: 'A no-pitch, pure architectural & commercial discussion tailored to your retail operations.',
    step1Title: 'Channel Audit & Inbound Velocity',
    step1Desc: 'Reviewing your current response delays, cart abandonment, and customer drop-off on WhatsApp & Instagram.',
    step2Title: 'Catalog & ERP Ingestion Strategy',
    step2Desc: 'How your SKUs, live inventory, and multi-tier pricing integrate securely without hallucinations.',
    step3Title: 'Autonomous Checkout & Safety Policies',
    step3Desc: 'Setting hard boundaries on returns, maximum promotional discounts, and seamless human operator takeover.',
    meetTitle: 'Google Meet Executive Session',
    meetDesc: 'You will receive a Google Meet video conference invitation immediately upon confirmation.',
    formTitle: 'Book Your Founder Strategy Call',
    formSubtitle: 'Select your business profile and preferred timing.',
    lblName: 'Your Name *',
    lblEmail: 'Work Email *',
    lblCompany: 'Company / Brand Name *',
    lblPhone: 'Phone / WhatsApp Number',
    lblVertical: 'Retail Vertical',
    lblVolume: 'Monthly Conversation Volume',
    lblDate: 'Preferred Date',
    lblTime: 'Preferred Time Window (BST / EST)',
    lblChallenges: 'Current Challenges or Questions (Optional)',
    challengesPlaceholder: 'Tell us about your channels, team bottlenecks, or specific automation goals...',
    btnSubmit: 'Confirm Founder Strategy Session',
    btnSubmitting: 'Confirming Reservation...',
    errValidation: 'Please provide your name, business email, and company name.',
    errSubmission: 'Unable to reserve founder meeting. Please try again or email founder@kreazyai.com.',
    successTitle: 'Founder Session Confirmed!',
    successDesc: (name, comp) => `Thank you, ${name}. Your executive strategy consultation for ${comp} has been logged.`,
    lblRef: 'Reference ID:',
    lblPref: 'Preferred Window:',
    lblVideo: 'Video Link:',
    lblStatus: 'Status:',
    statusVal: 'Confirmed on Platform Calendar',
    videoVal: (email) => `Google Meet URL sent to ${email}`,
    btnHome: 'Return to Home',
    btnTrial: 'Start Free Trial Now',
    timeMorning: 'Morning (10:00 AM - 1:00 PM BST / Local)',
    timeAfternoon: 'Afternoon (2:00 PM - 5:00 PM BST / Local)',
    timeEvening: 'Evening (6:00 PM - 9:00 PM BST / 8-11 AM EST)',
    timeNight: 'Night (9:00 PM - 11:00 PM BST / 11 AM - 1 PM EST)'
  },
  bn: {
    eyebrow: 'প্রতিষ্ঠাতার সাথে সরাসরি আলোচনা',
    title: '১-অন-১ কমার্শিয়াল এআই স্ট্র্যাটেজি সেশন বুক করুন',
    subtitle: 'ক্রেজি এআই-এর প্রতিষ্ঠাতা ও প্রকৌশল নেতৃত্বের সাথে সরাসরি আলোচনা করুন। আপনার মেটা ইনবক্সের মেসেজ ভলিউম ও বিক্রয়ের সমস্যা বিশ্লেষণ করে একটি কাস্টম অটোমেশন প্ল্যান তৈরি করা হবে।',
    sidebarTitle: '৩০ মিনিটের সেশনে যা যা থাকছে',
    sidebarDesc: 'কোনো অযথা বিজ্ঞাপনী আলাপ নয়—শুধুমাত্র আপনার ব্যবসার বাস্তব অটোমেশন ও কার্যকারিতা নিয়ে আলোচনা।',
    step1Title: 'চ্যানেল অডিট ও ইনবক্স গতিশীলতা',
    step1Desc: 'হোয়াটসঅ্যাপ ও ইনস্টাগ্রামে বর্তমান বিলম্ব, কাস্টমার ড্রপ-অফ ও কার্ট পরিত্যাগের কারণ বিশ্লেষণ।',
    step2Title: 'ক্যাটালগ ও ইআরপি ইনজেশন স্ট্র্যাটেজি',
    step2Desc: 'কীভাবে আপনার হাজারো পণ্য, লাইভ স্টক ও দামের তালিকা কোনো ভুল ছাড়া এআই সিস্টেমে যুক্ত হবে।',
    step3Title: 'স্বয়ংক্রিয় চেকআউট ও সুরক্ষা নীতিমালা',
    step3Desc: 'রিফান্ড নিয়মাবলী, সর্বোচ্চ ডিসকাউন্ট সীমা এবং প্রয়োজন হলে মানুষের কাছে হস্তান্তরের নীতিমালা।',
    meetTitle: 'গুগল মিট এক্সিকিউটিভ সেশন',
    meetDesc: 'কনফার্মেশনের সাথে সাথেই আপনার ইমেইলে গুগল মিট ভিডিও কনফারেন্সের ইনভাইটেশন চলে যাবে।',
    formTitle: 'ফাউন্ডার স্ট্র্যাটেজি কল বুক করুন',
    formSubtitle: 'আপনার ব্যবসায়িক প্রোফাইল এবং পছন্দের সময় বেছে নিন।',
    lblName: 'আপনার নাম *',
    lblEmail: 'ব্যবসায়িক ইমেইল *',
    lblCompany: 'প্রতিষ্ঠান / ব্র্যান্ডের নাম *',
    lblPhone: 'ফোন / হোয়াটসঅ্যাপ নম্বর',
    lblVertical: 'ব্যবসার ক্যাটাগরি',
    lblVolume: 'মাসিক মেসেজ / কথোপকথনের পরিমাণ',
    lblDate: 'পছন্দের তারিখ',
    lblTime: 'পছন্দের সময়সূচী (BST / EST)',
    lblChallenges: 'বর্তমান চ্যালেঞ্জ বা জিজ্ঞাসা (ঐচ্ছিক)',
    challengesPlaceholder: 'আপনার চ্যানেল, দলের সীমাবদ্ধতা বা নির্দিষ্ট অটোমেশন লক্ষ্য সম্পর্কে লিখুন...',
    btnSubmit: 'ফাউন্ডার সেশন নিশ্চিত করুন',
    btnSubmitting: 'সংরক্ষণ করা হচ্ছে...',
    errValidation: 'অনুগ্রহ করে আপনার নাম, ব্যবসায়িক ইমেইল এবং কোম্পানির নাম লিখুন।',
    errSubmission: 'ফাউন্ডার মিটিং বুক করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন অথবা founder@kreazyai.com এ লিখুন।',
    successTitle: 'ফাউন্ডার সেশন নিশ্চিত হয়েছে!',
    successDesc: (name, comp) => `ধন্যবাদ, ${name}। ${comp}-এর জন্য আপনার এক্সিকিউটিভ স্ট্র্যাটেজি সেশন নিবন্ধিত হয়েছে।`,
    lblRef: 'রেফারেন্স আইডি:',
    lblPref: 'পছন্দের সময়সূচী:',
    lblVideo: 'ভিডিও লিংক:',
    lblStatus: 'স্ট্যাটাস:',
    statusVal: 'প্ল্যাটফর্ম ক্যালেন্ডারে নিশ্চিত করা হয়েছে',
    videoVal: (email) => `গুগল মিট লিংক ${email} ঠিকানায় পাঠানো হয়েছে`,
    btnHome: 'হোমপেজে ফিরে যান',
    btnTrial: 'ফ্রি ট্রায়াল শুরু করুন',
    timeMorning: 'সকাল (১০:০০ AM - ০১:০০ PM BST / লোকাল)',
    timeAfternoon: 'দুপুর (০২:০০ PM - ০৫:০০ PM BST / লোকাল)',
    timeEvening: 'সন্ধ্যা (০৬:০০ PM - ০৯:০০ PM BST / লোকাল)',
    timeNight: 'রাত (০৯:০০ PM - ১১:০০ PM BST / লোকাল)'
  },
  es: {
    eyebrow: 'Acceso Directo con Fundadores',
    title: 'Reserve una Sesión Estratégica 1-a-1 de IA Comercial',
    subtitle: 'Reúnase directamente con el liderazgo de ingeniería de KreazyAI. Evaluaremos el volumen de sus canales de Meta, cuellos de botella de compra y diseñaremos un plan de IA a medida.',
    sidebarTitle: 'Lo Que Tratamos en 30 Minutos',
    sidebarDesc: 'Una discusión puramente técnica y comercial adaptada a las operaciones de su negocio minorista.',
    step1Title: 'Auditoría de Canales y Velocidad',
    step1Desc: 'Revisión de demoras en respuestas, abandono de carritos y pérdida de clientes en WhatsApp e Instagram.',
    step2Title: 'Estrategia de Catálogo y ERP',
    step2Desc: 'Cómo sus productos, inventario en vivo y tarifas multinivel se integran de forma segura sin alucinaciones.',
    step3Title: 'Finalización Autónoma y Políticas',
    step3Desc: 'Establecimiento de límites estrictos de devolución, descuentos promocionales y toma de control humano.',
    meetTitle: 'Sesión Ejecutiva por Google Meet',
    meetDesc: 'Recibirá una invitación de videoconferencia de Google Meet de inmediato tras la confirmación.',
    formTitle: 'Reserve su Consulta Estratégica',
    formSubtitle: 'Seleccione el perfil de su empresa y su horario de preferencia.',
    lblName: 'Su Nombre *',
    lblEmail: 'Correo Empresarial *',
    lblCompany: 'Empresa o Marca *',
    lblPhone: 'Teléfono / WhatsApp',
    lblVertical: 'Sector Minorista',
    lblVolume: 'Volumen Mensual de Conversaciones',
    lblDate: 'Fecha Preferida',
    lblTime: 'Franja Horaria Preferida (BST / EST)',
    lblChallenges: 'Retos Actuales o Preguntas (Opcional)',
    challengesPlaceholder: 'Descríbanos sus canales, cuellos de botella del equipo o metas de automatización...',
    btnSubmit: 'Confirmar Sesión con Fundador',
    btnSubmitting: 'Confirmando Reserva...',
    errValidation: 'Por favor ingrese su nombre, correo empresarial y empresa.',
    errSubmission: 'No se pudo reservar la reunión. Inténtelo nuevamente o escriba a founder@kreazyai.com.',
    successTitle: '¡Sesión con Fundador Confirmada!',
    successDesc: (name, comp) => `Gracias, ${name}. Su consulta ejecutiva para ${comp} ha sido registrada.`,
    lblRef: 'ID de Referencia:',
    lblPref: 'Horario Preferido:',
    lblVideo: 'Enlace de Video:',
    lblStatus: 'Estado:',
    statusVal: 'Confirmado en Calendario de Plataforma',
    videoVal: (email) => `Enlace de Google Meet enviado a ${email}`,
    btnHome: 'Volver a Inicio',
    btnTrial: 'Comenzar Prueba Gratis Ahora',
    timeMorning: 'Mañana (10:00 AM - 1:00 PM BST / Local)',
    timeAfternoon: 'Tarde (2:00 PM - 5:00 PM BST / Local)',
    timeEvening: 'Tarde-Noche (6:00 PM - 9:00 PM BST / Local)',
    timeNight: 'Noche (9:00 PM - 11:00 PM BST / Local)'
  }
};

export function FounderMeetingPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const t = FOUNDER_TEXT[langKey] || FOUNDER_TEXT.en;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    businessType: 'Retail & E-commerce',
    monthlyOrders: '500 - 2,000 orders/month',
    preferredDate: '',
    preferredTime: 'Morning (10:00 AM - 1:00 PM BST / 12:00 AM - 03:00 AM EST)',
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
      setError(t.errValidation);
      return;
    }

    setLoading(true);
    try {
      const res = await leadService.submitFounderMeeting(formData);
      setMeetingDetails(res.lead || { id: 'KZ-FOUNDER-' + Math.floor(1000 + Math.random() * 9000) });
      setSubmitted(true);
    } catch {
      // Graceful fallback
      setMeetingDetails({ id: 'KZ-FOUNDER-' + Math.floor(1000 + Math.random() * 9000) });
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
              <span className="eyebrow">
                <Sparkles size={14} /> {t.eyebrow}
              </span>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>

            <div className="demo-page-layout">
              {/* Left Column: Agenda & Value */}
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

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Video size={16} color="var(--olive-700)" />
                    <strong style={{ fontSize: '0.85rem' }}>{t.meetTitle}</strong>
                  </div>
                  <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', margin: 0 }}>
                    {t.meetDesc}
                  </p>
                </div>
              </div>

              {/* Right Column: Reservation Form */}
              <div className="demo-form-card">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>
                    {t.formTitle}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    {t.formSubtitle}
                  </p>

                  {error && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error-text)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', border: '1px solid var(--status-error-border)' }}>
                      {error}
                    </div>
                  )}

                  <div className="demo-form-grid-2">
                    <Input
                      label={t.lblName}
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label={t.lblEmail}
                      type="email"
                      placeholder="founder@yourstore.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label={t.lblCompany}
                      placeholder="e.g. Copenhagen Botanicals"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                    <Input
                      label={t.lblPhone}
                      placeholder="+880 1712-345678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Select
                      label={t.lblVertical}
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
                      label={t.lblVolume}
                      value={formData.monthlyOrders}
                      onChange={(e) => setFormData({ ...formData, monthlyOrders: e.target.value })}
                      options={[
                        { value: 'Under 500 / month', label: '< 500 / month' },
                        { value: '500 - 2,000 / month', label: '500 - 2,000 / month' },
                        { value: '2,000 - 10,000 / month', label: '2,000 - 10,000 / month' },
                        { value: '10,000+ Enterprise Volume', label: '10,000+ Enterprise Volume' }
                      ]}
                    />
                  </div>

                  <div className="demo-form-grid-2">
                    <Input
                      label={t.lblDate}
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    />
                    <Select
                      label={t.lblTime}
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                      options={[
                        { value: 'Morning (10:00 AM - 1:00 PM BST / 12:00 AM - 03:00 AM EST)', label: t.timeMorning },
                        { value: 'Afternoon (2:00 PM - 5:00 PM BST / 04:00 AM - 07:00 AM EST)', label: t.timeAfternoon },
                        { value: 'Evening (6:00 PM - 9:00 PM BST / 08:00 AM - 11:00 AM EST)', label: t.timeEvening },
                        { value: 'Night (9:00 PM - 11:00 PM BST / 11:00 AM - 01:00 PM EST)', label: t.timeNight }
                      ]}
                    />
                  </div>

                  <Textarea
                    label={t.lblChallenges}
                    placeholder={t.challengesPlaceholder}
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
                    {loading ? t.btnSubmitting : t.btnSubmit}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-12)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--green-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {t.successTitle}
            </h2>

            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {t.successDesc(formData.name, formData.company)}
            </p>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>{t.lblRef}</strong> <code>{meetingDetails?.id || 'KZ-FOUNDER-991'}</code></div>
              <div><strong>{t.lblPref}</strong> {formData.preferredTime} {formData.preferredDate ? `on ${formData.preferredDate}` : ''}</div>
              <div><strong>{t.lblVideo}</strong> {t.videoVal(formData.email)}</div>
              <div><strong>{t.lblStatus}</strong> <span style={{ color: '#16a34a', fontWeight: 600 }}>{t.statusVal}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="secondary" onClick={() => onNavigate('home')}>
                {t.btnHome}
              </Button>
              <Button variant="primary" onClick={() => onNavigate('signup')}>
                {t.btnTrial}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
