import React, { useState } from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LEGAL_TEXT = {
  en: {
    tabPrivacy: 'Privacy Policy',
    tabTerms: 'Terms of Service',
    lastUpdated: 'Last updated: September 2026',
    privacyTitle: 'KreazyAI Privacy Policy',
    p1Head: '1. Introduction & Scope',
    p1Body: 'KreazyAI ("we", "our", or "us") provides conversational commerce and AI automation software to retailers and business clients ("Merchants"). This Privacy Policy explains how we collect, process, and safeguard information when Merchants connect their WhatsApp Business, Instagram Professional, and Facebook accounts to our services.',
    p2Head: '2. Data Collection & Processing',
    p2Body: 'We only ingest customer messages, catalog data, and order details strictly necessary to fulfill automated customer service and sales processing. We do NOT sell personal data or merchant conversation records to third-party data brokers.',
    p3Head: '3. AI Model Governance',
    p3Body: 'Merchant catalog data, proprietary store policies, and customer chat histories are strictly segregated by workspace tenant. We do NOT use private customer data to train public foundation models without explicit contractual consent.',
    p4Head: '4. Security Standards',
    p4Body: 'All communications through Meta Cloud APIs and WhatsApp Webhooks are encrypted in transit via TLS 1.3. Customer order identifiers and sensitive tokens are stored using AES-256 encryption at rest.',
    termsTitle: 'Terms of Commercial Service',
    t1Head: '1. Platform License',
    t1Body: "KreazyAI grants you a non-exclusive, non-transferable, revocable license to access and use our software for your commercial social commerce channels in compliance with Meta's Commerce & Platform Terms.",
    t2Head: '2. Acceptable Use & AI Safety',
    t2Body: 'Merchants agree not to configure KreazyAI to engage in deceptive practices, spamming, prohibited medical claims, or unauthorized automated unsolicited marketing messages in violation of WhatsApp Business Policies.',
    t3Head: '3. Service Availability & Uptime',
    t3Body: 'We strive for continuous 99.9% uptime. Scheduled maintenance windows are communicated in advance. KreazyAI is not liable for upstream downtime caused by third-party infrastructure outages (e.g. Meta Graph API platform incidents).'
  },
  bn: {
    tabPrivacy: 'প্রাইভেসি পলিসি',
    tabTerms: 'ব্যবহারের শর্তাবলী',
    lastUpdated: 'সর্বশেষ আপডেট: সেপ্টেম্বর ২০২৬',
    privacyTitle: 'ক্রেজি এআই প্রাইভেসি পলিসি',
    p1Head: '১. ভূমিকা ও পরিধি',
    p1Body: 'ক্রেজি এআই ("আমরা" বা "আমাদের") অনলাইন বিক্রেতা ও ব্যবসায়িক ক্লায়েন্টদের ("মার্চেন্ট") জন্য কনভার্সেশনাল কমার্স ও এআই অটোমেশন সেবা প্রদান করে। এই পলিসিতে ব্যাখ্যা করা হয়েছে কীভাবে আমরা তথ্য সংগ্রহ, প্রক্রিয়া ও সুরক্ষা নিশ্চিত করি যখন মার্চেন্টরা তাদের হোয়াটসঅ্যাপ, ইনস্টাগ্রাম ও ফেসবুক অ্যাকাউন্ট আমাদের প্ল্যাটফর্মে যুক্ত করেন।',
    p2Head: '২. তথ্য সংগ্রহ ও প্রক্রিয়াকরণ',
    p2Body: 'আমরা শুধুমাত্র স্বয়ংক্রিয় গ্রাহক সেবা এবং বিক্রয় প্রক্রিয়া সম্পন্ন করার জন্য প্রয়োজনীয় মেসেজ, ক্যাটালগ তথ্য এবং অর্ডার বিবরণ গ্রহণ করি। আমরা কখনোই গ্রাহকদের ব্যক্তিগত তথ্য বা কথোপকথনের রেকর্ড কোনো তৃতীয় পক্ষের ডাটা ব্রোকারের কাছে বিক্রি করি না।',
    p3Head: '৩. এআই মডেল পরিচালনা ও ডেটা সুরক্ষা',
    p3Body: 'মার্চেন্টদের ক্যাটালগ ডাটা, নিজস্ব স্টোর পলিসি এবং চ্যাট হিস্ট্রি সম্পূর্ণ আলাদা ও সুরক্ষিত ওয়ার্কস্পেসে সংরক্ষিত থাকে। চুক্তিবদ্ধ স্পষ্ট সম্মতি ব্যতিরেকে আমরা কোনো পাবলিক ফাউন্ডেশন মডেল প্রশিক্ষণে গ্রাহকের ব্যক্তিগত তথ্য ব্যবহার করি না।',
    p4Head: '৪. নিরাপত্তা মানদণ্ড',
    p4Body: 'মেটা ক্লাউড এপিআই এবং হোয়াটসঅ্যাপ ওয়েবহুকের মাধ্যমে সকল ডেটা আদান-প্রদান TLS 1.3 এনক্রিপশনের মাধ্যমে সুরক্ষিত থাকে। অর্ডার শনাক্তকারী ও স্পর্শকাতর টোকেনসমূহ AES-256 এনক্রিপশনের মাধ্যমে ডাটাবেসে সুরক্ষিতভাবে সংরক্ষিত থাকে।',
    termsTitle: 'বাণিজ্যিক ব্যবহারের নীতিমালা ও শর্তাবলী',
    t1Head: '১. প্ল্যাটফর্ম লাইসেন্স',
    t1Body: 'মেটার কমার্স ও প্ল্যাটফর্ম নীতিমালা অনুসরণ সাপেক্ষে আপনার বাণিজ্যিক সোশ্যাল কমার্স চ্যানেলগুলোতে ব্যবহারের জন্য ক্রেজি এআই আপনাকে একটি অ-একচেটিয়া, অ-হস্তান্তরযোগ্য ও বাতিলযোগ্য সফটওয়্যার লাইসেন্স প্রদান করে।',
    t2Head: '২. গ্রহণযোগ্য ব্যবহার ও এআই সুরক্ষা',
    t2Body: 'মার্চেন্টরা একমত পোষণ করছেন যে তারা ক্রেজি এআই-কে কোনো প্রতারণামূলক কর্মকাণ্ড, স্প্যামিং, নিষিদ্ধ দাবি বা হোয়াটসঅ্যাপ পলিসি লঙ্ঘন করে এমন অননুমোদিত বার্তা প্রেরণে ব্যবহার করবেন না।',
    t3Head: '৩. সেবার প্রাপ্যতা ও আপটাইম',
    t3Body: 'আমরা নিরবচ্ছিন্ন ৯৯.৯% আপটাইম বজায় রাখতে প্রতিশ্রুতিবদ্ধ। নিয়মিত রক্ষণাবেক্ষণের সময়সূচী পূর্বে জানানো হয়। তৃতীয় পক্ষের অবকাঠামোগত বিঘ্নের জন্য (যেমন মেটা এপিআই ত্রুটি) ক্রেজি এআই দায়ী থাকবে না।'
  },
  es: {
    tabPrivacy: 'Política de Privacidad',
    tabTerms: 'Términos de Servicio',
    lastUpdated: 'Última actualización: Septiembre de 2026',
    privacyTitle: 'Política de Privacidad de KreazyAI',
    p1Head: '1. Introducción y Alcance',
    p1Body: 'KreazyAI ("nosotros") proporciona software de comercio conversacional y automatización de IA a minoristas y clientes comerciales ("Comerciantes"). Esta Política explica cómo recopilamos, procesamos y protegemos la información cuando los Comerciantes conectan sus cuentas de WhatsApp Business, Instagram y Facebook a nuestros servicios.',
    p2Head: '2. Recopilación y Procesamiento de Datos',
    p2Body: 'Solo recopilamos mensajes de clientes, datos de catálogo y detalles de pedidos estrictamente necesarios para el procesamiento de ventas y soporte. NO vendemos datos personales ni historiales de conversación a corredores de datos.',
    p3Head: '3. Gobernanza de Modelos de IA',
    p3Body: 'Los datos de catálogos, políticas de tienda e historiales de chat están estrictamente aislados por espacio de trabajo. NO utilizamos datos privados de clientes para entrenar modelos fundacionales públicos sin consentimiento explícito.',
    p4Head: '4. Estándares de Seguridad',
    p4Body: 'Todas las comunicaciones a través de las APIs de Meta Cloud y webhooks se cifran en tránsito mediante TLS 1.3. Los identificadores de pedidos y credenciales se protegen en reposo mediante cifrado AES-256.',
    termsTitle: 'Términos del Servicio Comercial',
    t1Head: '1. Licencia de la Plataforma',
    t1Body: 'KreazyAI le otorga una licencia no exclusiva, intransferible y revocable para acceder y utilizar nuestro software en sus canales comerciales cumpliendo los Términos de Comercio de Meta.',
    t2Head: '2. Uso Aceptable y Seguridad de IA',
    t2Body: 'Los comerciantes se comprometen a no configurar KreazyAI para prácticas engañosas, spam, declaraciones médicas prohibidas o mensajería masiva no autorizada que viole las Políticas de WhatsApp Business.',
    t3Head: '3. Disponibilidad y Tiempo de Actividad',
    t3Body: 'Nos esforzamos por mantener un tiempo de actividad continuo del 99.9%. Las ventanas de mantenimiento programadas se anuncian previamente. KreazyAI no es responsable por caídas originadas por fallas en la infraestructura de terceros (ej. incidentes en la API de Meta Graph).'
  }
};

export function LegalPage({ initialTab = 'privacy' }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const t = LEGAL_TEXT[langKey] || LEGAL_TEXT.en;

  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ display: 'flex', marginBottom: 'var(--space-8)' }}>
          <div className="capsule-filter-group">
            <button
              type="button"
              className={`capsule-filter-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacy')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <ShieldCheck size={16} />
              {t.tabPrivacy}
            </button>
            <button
              type="button"
              className={`capsule-filter-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => setActiveTab('terms')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
            >
              <FileText size={16} />
              {t.tabTerms}
            </button>
          </div>
        </div>

        <div className="card" style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-10)', lineHeight: 1.7 }}>
          {activeTab === 'privacy' ? (
            <div>
              <span className="eyebrow" style={{ marginBottom: '1rem' }}>{t.lastUpdated}</span>
              <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.96, marginBottom: '1.5rem' }}>
                {t.privacyTitle}
              </h1>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.p1Head}</h3>
              <p>{t.p1Body}</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.p2Head}</h3>
              <p>{t.p2Body}</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.p3Head}</h3>
              <p>{t.p3Body}</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.p4Head}</h3>
              <p>{t.p4Body}</p>
            </div>
          ) : (
            <div>
              <span className="eyebrow" style={{ marginBottom: '1rem' }}>{t.lastUpdated}</span>
              <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.045em', lineHeight: 0.96, marginBottom: '1.5rem' }}>
                {t.termsTitle}
              </h1>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.t1Head}</h3>
              <p>{t.t1Body}</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.t2Head}</h3>
              <p>{t.t2Body}</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{t.t3Head}</h3>
              <p>{t.t3Body}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
