import React from 'react';
import { Target, HeartHandshake, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

const ABOUT_TEXT = {
  en: {
    eyebrow: 'About KreazyAI',
    title: 'Building the infrastructure for modern social commerce',
    desc: 'KreazyAI was founded to solve a critical commercial bottleneck: online businesses are overwhelmed by fragmented messaging while consumers demand immediate, personalized service.',
    missionTitle: 'Our Mission',
    missionDesc: 'To empower online retailers and independent brands with intelligent, reliable automation that turns casual chats into lifelong customer relationships and profitable transactions.',
    beliefTitle: 'What We Believe',
    beliefDesc: 'Commerce is fundamentally conversational. Customers want real answers from brands they trust, not robotic scripts or endless wait times. AI should empower merchants, not distance them from buyers.',
    safetyTitle: 'Safety & Brand Integrity',
    safetyDesc: 'We believe in deterministic guardrails. AI agents must operate strictly within business knowledge boundaries and preserve brand reputation with zero hallucinations or rogue behavior.',
    deepEyebrow: 'Why KreazyAI',
    deepTitle: 'Engineered for real commercial operations',
    deepP1: 'Most AI chat tools were designed as generic customer service deflectors. They answer basic questions, generate canned apologies, and send users to an external website link.',
    deepP2: 'KreazyAI was engineered specifically for commerce. We treat conversation as a complete sales transaction: from sizing consultation, real-time stock checks, and catalog presentation, to instant checkout link generation, secure payment capture, and delivery tracking.',
    btnDemo: 'Schedule Founder Demo',
    btnArch: 'Explore The Architecture'
  },
  bn: {
    eyebrow: 'ক্রেজি এআই সম্পর্কে',
    title: 'আধুনিক সোশ্যাল কমার্সের প্রযুক্তিগত ভিত্তি নির্মাণ',
    desc: 'অনলাইন ব্যবসাগুলোর অন্যতম বড় সমস্যা সমাধানের জন্য ক্রেজি এআই-এর যাত্রা শুরু: বিভিন্ন সোশ্যাল ইনবক্সে মেসেজের চাপে বিক্রেতারা দিশেহারা, অন্যদিকে ক্রেতারা চায় তাৎক্ষণিক ও ব্যক্তিগত সেবা।',
    missionTitle: 'আমাদের লক্ষ্য',
    missionDesc: 'অনলাইন রিটেইলার ও স্বাধীন ব্র্যান্ডগুলোকে এমন বুদ্ধিমান ও নির্ভরযোগ্য অটোমেশন দিয়ে ক্ষমতায়ন করা যা সাধারণ চ্যাটকে দীর্ঘমেয়াদী গ্রাহক সম্পর্ক ও লাভজনক বিক্রয়ে রূপান্তর করে।',
    beliefTitle: 'আমাদের বিশ্বাস',
    beliefDesc: 'বাণিজ্য মূলত কথোপকথননির্ভর। গ্রাহকরা রোবোটিক স্ক্রিপ্ট বা দীর্ঘ অপেক্ষার বদলে বিশ্বস্ত ব্র্যান্ড থেকে সঠিক ও তাৎক্ষণিক উত্তর চায়। এআই বিক্রেতাদের সক্ষমতা বাড়াবে, ক্রেতা থেকে দূরে সরাবে না।',
    safetyTitle: 'নিরাপত্তা ও ব্র্যান্ডের সুনাম',
    safetyDesc: 'আমরা সুনির্দিষ্ট নিরাপত্তা নীতিমালায় বিশ্বাসী। এআই এজেন্টদের অবশ্যই নিজস্ব স্টোরের তথ্যের সীমার মধ্যে কাজ করতে হবে এবং শূন্য হ্যালোসিনেশন নিয়ে ব্র্যান্ডের সুনাম রক্ষা করতে হবে।',
    deepEyebrow: 'কেন ক্রেজি এআই',
    deepTitle: 'বাস্তব বাণিজ্যিক কার্যক্রমের জন্য বিশেষভাবে নির্মিত',
    deepP1: 'বেশিরভাগ সাধারণ এআই টুল কেবল দায়সারা কাস্টমার সাপোর্টের জন্য তৈরি। তারা সাদামাটা উত্তর দেয়, দায়সারা দুঃখ প্রকাশ করে এবং বাইরের কোনো ওয়েবসাইটের লিংকে ভিজিটর পাঠিয়ে দেয়।',
    deepP2: 'ক্রেজি এআই বিশেষভাবে কমার্স ও বিক্রয়ের জন্য তৈরি। আমরা চ্যাটকে সম্পূর্ণ একটি বিক্রয় লেনদেন হিসেবে বিবেচনা করি: সাইজ পরামর্শ, লাইভ স্টক যাচাই এবং ক্যাটালগ দেখানো থেকে শুরু করে ইন-চ্যাট অর্ডার সংগ্রহ ও কুরিয়ার ট্র্যাকিং পর্যন্ত।',
    btnDemo: 'প্রতিষ্ঠাতার সাথে ডেমো বুক করুন',
    btnArch: 'আর্কিটেকচার ঘুরে দেখুন'
  },
  es: {
    eyebrow: 'Acerca de KreazyAI',
    title: 'Construyendo la infraestructura del comercio social moderno',
    desc: 'KreazyAI fue fundado para resolver un cuello de botella comercial crítico: los negocios en línea están abrumados por la mensajería fragmentada mientras los consumidores exigen atención inmediata y personalizada.',
    missionTitle: 'Nuestra Misión',
    missionDesc: 'Empoderar a minoristas en línea y marcas independientes con automatización inteligente y confiable que transforme conversaciones casuales en relaciones duraderas y transacciones rentables.',
    beliefTitle: 'Lo Que Creemos',
    beliefDesc: 'El comercio es fundamentalmente conversacional. Los clientes quieren respuestas reales de marcas en las que confían, no guiones robóticos ni esperas interminables. La IA debe potenciar a los comerciantes, no alejarlos de los compradores.',
    safetyTitle: 'Seguridad e Integridad de Marca',
    safetyDesc: 'Creemos en salvaguardas deterministas. Los agentes de IA deben operar estrictamente dentro del conocimiento empresarial y preservar la reputación de marca sin alucinaciones ni comportamientos imprevistos.',
    deepEyebrow: 'Por Qué KreazyAI',
    deepTitle: 'Diseñado para operaciones comerciales reales',
    deepP1: 'La mayoría de las herramientas de chat de IA se diseñaron como deflectores genéricos de atención al cliente. Responden dudas básicas, generan disculpas automáticas y desvían a los usuarios a enlaces externos.',
    deepP2: 'KreazyAI fue diseñado específicamente para el comercio. Tratamos la conversación como una transacción completa: desde asesoramiento de tallas, consulta de existencias en tiempo real y catálogo, hasta generación de pedidos en chat, cobro seguro y seguimiento de envíos.',
    btnDemo: 'Programar Demo con Fundador',
    btnArch: 'Explorar la Arquitectura'
  }
};

export function AboutPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const t = ABOUT_TEXT[langKey] || ABOUT_TEXT.en;

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.desc}</p>
        </div>

        {/* Core Pillars */}
        <div className="about-pillars-grid">
          <div className="card">
            <div className="feature-icon-box">
              <Target size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.missionTitle}</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              {t.missionDesc}
            </p>
          </div>

          <div className="card">
            <div className="feature-icon-box">
              <HeartHandshake size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.beliefTitle}</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              {t.beliefDesc}
            </p>
          </div>

          <div className="card">
            <div className="feature-icon-box">
              <Shield size={22} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{t.safetyTitle}</h3>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)' }}>
              {t.safetyDesc}
            </p>
          </div>
        </div>

        {/* Why KreazyAI Deep Dive */}
        <div className="card" style={{ padding: 'clamp(1.5rem, 3vw, 2.5rem)', marginTop: 'var(--space-8)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="eyebrow" style={{ marginBottom: '1rem' }}>{t.deepEyebrow}</span>
            <h2 style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.06, marginBottom: '1.25rem' }}>
              {t.deepTitle}
            </h2>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              {t.deepP1}
            </p>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              {t.deepP2}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => onNavigate('book-demo')}>
                {t.btnDemo}
              </Button>
              <Button variant="secondary" onClick={() => onNavigate('how-it-works')}>
                {t.btnArch}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
