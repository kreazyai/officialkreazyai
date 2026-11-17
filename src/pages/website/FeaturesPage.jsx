import React, { useState } from 'react';
import {
  Bot,
  Headphones,
  MessageSquare,
  Share2,
  ShoppingBag,
  Boxes,
  Users,
  ShieldCheck,
  BarChart3,
  DollarSign,
  Sliders,
  Bell,
  ArrowRight,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const FEATURES_DATA = {
  en: {
    title: 'Comprehensive tools for automated commerce',
    subtitle: 'Explore every component engineered to automate conversations, drive retail sales, and streamline operations across your digital channels.',
    categories: [
      { id: 'all', label: 'All Capabilities' },
      { id: 'sales-ai', label: 'AI Commerce & Sales' },
      { id: 'channels', label: 'Channel Integrations' },
      { id: 'operations', label: 'Operations & Orders' },
      { id: 'governance', label: 'Safety & Handoff' }
    ],
    items: [
      {
        id: 'f1',
        category: 'sales-ai',
        title: 'AI Sales Agent',
        icon: Bot,
        tag: 'Autonomous Revenue',
        desc: 'Understands customer taste, sizing, and preferences to recommend matching products and drive high-conversion checkouts.',
        bullets: ['Tailored product suggestions', 'Discount approval thresholds', 'Upsell & cross-sell logic']
      },
      {
        id: 'f2',
        category: 'sales-ai',
        title: 'AI Customer Support',
        icon: Headphones,
        tag: '24/7 Concierge',
        desc: 'Instantly answers questions regarding delivery times, fabric care, dimensions, store policies, and order statuses.',
        bullets: ['Sub-3-second responses', 'Multi-turn context memory', 'Multilingual auto-translation']
      },
      {
        id: 'f3',
        category: 'channels',
        title: 'WhatsApp Business Cloud',
        icon: MessageSquare,
        tag: 'Official Meta API',
        desc: 'Automates one-on-one WhatsApp conversations, catalog shares, interactive buttons, and delivery alerts.',
        bullets: ['Rich media & image cards', 'WhatsApp Pay compatibility', 'High delivery rate']
      },
      {
        id: 'f4',
        category: 'channels',
        title: 'Instagram Direct Automation',
        icon: Share2,
        tag: 'Story & DM Sync',
        desc: 'Responds instantly to story replies, product mentions, and DM inquiries with interactive product cards.',
        bullets: ['Story mention auto-replies', 'Reel link-to-buy capture', 'Follower verification']
      },
      {
        id: 'f5',
        category: 'channels',
        title: 'Facebook Messenger Integration',
        icon: Share2,
        tag: 'Page Ingestion',
        desc: 'Synchronizes your official business Facebook page messages and ad campaign click-to-message leads.',
        bullets: ['Ad traffic conversion', 'Post comment triggers', 'Unified customer ID matching']
      },
      {
        id: 'f6',
        category: 'operations',
        title: 'Live Product Management',
        icon: Boxes,
        tag: 'Catalog Engine',
        desc: 'Centralized product index supporting SKUs, variants, prices, inventory levels, and AI product descriptions.',
        bullets: ['Real-time stock reservation', 'Variant selector', 'Shopify / WooCommerce sync']
      },
      {
        id: 'f7',
        category: 'operations',
        title: 'Autonomous Order Management',
        icon: ShoppingBag,
        tag: 'Order Lifecycle',
        desc: 'Tracks every order from pending to delivered, with automated courier tracking updates to the customer chat.',
        bullets: ['Automatic address validation', 'Instant invoice generation', 'Payment verification']
      },
      {
        id: 'f8',
        category: 'operations',
        title: 'Omnichannel Customer CRM',
        icon: Users,
        tag: 'Customer 360',
        desc: 'Maintains a single customer profile across WhatsApp, Instagram, and Facebook with full order history and tags.',
        bullets: ['Lifetime spend tracking', 'Channel identification', 'Custom segmentation tags']
      },
      {
        id: 'f9',
        category: 'governance',
        title: 'Human Handoff & Copilot',
        icon: Users,
        tag: 'Team Workflow',
        desc: 'Seamlessly transfers complex inquiries to human agents with AI draft suggestions and full context summary.',
        bullets: ['One-click takeover', 'Agent assignment', 'Sentiment escalation alerts']
      },
      {
        id: 'f10',
        category: 'governance',
        title: 'AI Knowledge Base Studio',
        icon: Sliders,
        tag: 'Custom Grounding',
        desc: 'Train your assistant on your exact store policies, shipping guidelines, FAQs, and brand tone without coding.',
        bullets: ['Easy policy editor', 'Document & link indexing', 'Instant sandbox preview']
      },
      {
        id: 'f11',
        category: 'operations',
        title: 'Revenue & Speed Analytics',
        icon: DollarSign,
        tag: 'ROI Tracking',
        desc: 'Quantify automated revenue, time saved, resolution rates, and top-converting social channels in real time.',
        bullets: ['Channel breakdown', 'Resolution percentage', 'CSV / Excel exports']
      },
      {
        id: 'f12',
        category: 'governance',
        title: 'Safety Guardrails & Approvals',
        icon: ShieldCheck,
        tag: 'Brand Protection',
        desc: 'Enforce confidence thresholds, banned phrases, and mandatory supervisor approval for refunds or high discounts.',
        bullets: ['Confidence score filters', 'Refund thresholds', 'Full audit trail']
      }
    ],
    ctaTitle: 'Need custom enterprise channel orchestration?',
    ctaDesc: 'We support high-volume retailers with custom ERP connectors, dedicated WhatsApp numbers, and enterprise SLAs.',
    ctaBtnDemo: 'Request Custom Demo',
    ctaBtnContact: 'Contact Solutions Team'
  },

  bn: {
    title: 'স্বয়ংক্রিয় বাণিজ্যের পূর্ণাঙ্গ টুলস ও ফিচার',
    subtitle: 'সোশ্যাল চ্যানেলে কথোপকথন স্বয়ংক্রিয় করতে, বিক্রি বৃদ্ধি করতে এবং রিটেল কার্যক্রম দ্রুত ও সহজ করতে প্রতিটি ফিচার বিশেষভাবে ডিজাইন করা হয়েছে।',
    categories: [
      { id: 'all', label: 'সকল ফিচার' },
      { id: 'sales-ai', label: 'এআই বাণিজ্য ও বিক্রয়' },
      { id: 'channels', label: 'চ্যানেল ইন্টিগ্রেশন' },
      { id: 'operations', label: 'অর্ডার ও কার্যক্রম' },
      { id: 'governance', label: 'নিরাপত্তা ও হিউম্যান হ্যান্ডঅফ' }
    ],
    items: [
      {
        id: 'f1',
        category: 'sales-ai',
        title: 'এআই সেলস এজেন্ট',
        icon: Bot,
        tag: 'স্বয়ংক্রিয় আয়',
        desc: 'গ্রাহকের পছন্দ, সাইজ ও বাজেট বুঝে সঠিক পণ্য সুপারিশ করে এবং ইন-চ্যাটে দ্রুত বিক্রয় সম্পন্ন করে।',
        bullets: ['কাস্টম পণ্য সাজেশন', 'অনুমোদিত ডিসকাউন্ট সীমা', 'আপসেল ও ক্রস-সেল অ্যালগরিদম']
      },
      {
        id: 'f2',
        category: 'sales-ai',
        title: 'এআই কাস্টমার সাপোর্ট',
        icon: Headphones,
        tag: '২৪/৭ কনসিয়ার্জ',
        desc: 'ডেলিভারি সময়, কাপড়ের যত্ন, সাইজ, স্টোর পলিসি ও অর্ডারের অবস্থা সংক্রান্ত প্রশ্নের তাত্ক্ষণিক উত্তর দেয়।',
        bullets: ['৩ সেকেন্ডের মধ্যে উত্তর', 'মাল্টি-টার্ন কনটেক্সট মেমোরি', 'বহুভাষিক অটো-অনুবাদ']
      },
      {
        id: 'f3',
        category: 'channels',
        title: 'হোয়াটসঅ্যাপ বিজনেস ক্লাউড',
        icon: MessageSquare,
        tag: 'অফিসিয়াল মেটা এপিআই',
        desc: 'ওয়ান-অন-ওয়ান হোয়াটসঅ্যাপ কথোপকথন, ক্যাটালগ প্রদর্শন, ইন্টারেক্টিভ বাটন এবং ডেলিভারি সতর্কতা স্বয়ংক্রিয় করে।',
        bullets: ['রিচ মিডিয়া ও ইমেজ কার্ড', 'মেটা অনুমোদিত নির্ভরযোগ্যতা', 'উচ্চ ডেলিভারি রেট']
      },
      {
        id: 'f4',
        category: 'channels',
        title: 'ইনস্টাগ্রাম ডিরেক্ট অটোমেশন',
        icon: Share2,
        tag: 'স্টোরি ও ডিএম সিঙ্ক',
        desc: 'স্টোরি রিপ্লাই, পোস্ট মেনশন ও ডিএম প্রশ্নের সাথে সাথে ইন্টারেক্টিভ প্রোডাক্ট কার্ডের মাধ্যমে উত্তর প্রদান করে।',
        bullets: ['স্টোরি মেনশন অটো-রিপ্লাই', 'রিলস লিংক-টু-বাই ক্যাপচার', 'ফলোয়ার যাচাই সুবিধা']
      },
      {
        id: 'f5',
        category: 'channels',
        title: 'ফেসবুক মেসেঞ্জার ইন্টিগ্রেশন',
        icon: Share2,
        tag: 'পেজ মেসেজ ইনজেশন',
        desc: 'আপনার ফেসবুক পেজের ইনবক্স মেসেজ এবং বিজ্ঞাপন থেকে আসা লিডগুলোকে অবিলম্বে বিক্রয়ে রূপান্তর করে।',
        bullets: ['বিজ্ঞাপন ট্রাফিক কনভার্সন', 'কমেন্ট টু ডিএম ট্রিগার', 'একীভূত গ্রাহক আইডি']
      },
      {
        id: 'f6',
        category: 'operations',
        title: 'লাইভ প্রোডাক্ট ম্যানেজমেন্ট',
        icon: Boxes,
        tag: 'ক্যাটালগ ইঞ্জিন',
        desc: 'SKU, ভেরিয়েন্ট, দাম, ইনভেন্টরি লেভেল এবং এআই পণ্যের বিবরণসহ কেন্দ্রীয় পণ্য ব্যবস্থাপনা।',
        bullets: ['রিয়েল-টাইম স্টক সংরক্ষণ', 'ভেরিয়েন্ট সিলেক্টর', 'Shopify / WooCommerce সিঙ্ক']
      },
      {
        id: 'f7',
        category: 'operations',
        title: 'স্বয়ংক্রিয় অর্ডার ম্যানেজমেন্ট',
        icon: ShoppingBag,
        tag: 'অর্ডার লাইফসাইকেল',
        desc: 'পেন্ডিং থেকে ডেলিভারি পর্যন্ত প্রতিটি অর্ডার ট্র্যাক করে এবং চ্যাটে স্বয়ংক্রিয় কুরিয়ার ট্র্যাকিং পাঠায়।',
        bullets: ['স্বয়ংক্রিয় ঠিকানা যাচাই', 'ইনস্ট্যান্ট ইনভয়েস জেনারেশন', 'পেমেন্ট ট্রানজেকশন ভেরিফিকেশন']
      },
      {
        id: 'f8',
        category: 'operations',
        title: 'অমনিচ্যানেল কাস্টমার সিআরএম',
        icon: Users,
        tag: 'কাস্টমার ৩৬০',
        desc: 'হোয়াটসঅ্যাপ, ইনস্টাগ্রাম এবং ফেসবুকে সম্পূর্ণ ক্রয়ের ইতিহাস ও ট্যাগসহ একক গ্রাহক প্রোফাইল বজায় রাখে।',
        bullets: ['লাইফটাইম কেনাকাটার ট্র্যাক', 'চ্যানেল শনাক্তকরণ', 'কাস্টম সেগমেন্টেশন ট্যাগ']
      },
      {
        id: 'f9',
        category: 'governance',
        title: 'হিউম্যান হ্যান্ডঅফ ও কোপাইলট',
        icon: Users,
        tag: 'টিম ওয়ার্কফ্লো',
        desc: 'জটিল জিজ্ঞাসাগুলো এআই ড্রাফ্ট সাজেশন ও সম্পূর্ণ চ্যাট হিস্ট্রিসহ ১ ক্লিকে মানুষের কাছে হস্তান্তর করে।',
        bullets: ['এক-ক্লিকে মানুষের নিয়ন্ত্রণ', 'এজেন্ট অ্যাসাইনমেন্ট', 'সেন্টিমেন্ট এস্কেলেশন অ্যালার্ট']
      },
      {
        id: 'f10',
        category: 'governance',
        title: 'এআই নলেজ বেস স্টুডিও',
        icon: Sliders,
        tag: 'কাস্টম গ্রাউন্ডিং',
        desc: 'কোনো কোডিং ছাড়াই আপনার নিজস্ব পলিসি, ডেলিভারি রুলস, এফএকিউ এবং ব্র্যান্ড টোনে এআইকে প্রশিক্ষণ দিন।',
        bullets: ['সহজ পলিসি এডিটর', 'ডকুমেন্ট ও লিঙ্ক ইনডেক্সিং', 'তাৎক্ষণিক স্যান্ডবক্স প্রিভিউ']
      },
      {
        id: 'f11',
        category: 'operations',
        title: 'রাজস্ব ও স্পিড অ্যানালিটিক্স',
        icon: DollarSign,
        tag: 'ROI ট্র্যাকিং',
        desc: 'স্বয়ংক্রিয় বিক্রয়, সংরক্ষিত সময়, সমাধানের হার এবং সেরা পারফর্ম করা সামাজিক চ্যানেলগুলো পরিমাপ করুন।',
        bullets: ['চ্যানেল বিশ্লেষণ', 'সমাধানের শতকরা হার', 'CSV / Excel এক্সপোর্ট']
      },
      {
        id: 'f12',
        category: 'governance',
        title: 'সুরক্ষা বাউন্ডারি ও অনুমোদন',
        icon: ShieldCheck,
        tag: 'ব্র্যান্ড প্রটেকশন',
        desc: 'কনফিডেন্স স্কোর সীমা, নিষিদ্ধ শব্দ এবং রিফান্ড বা বড় ডিসকাউন্টের জন্য সুপারভাইজার অনুমোদন নিশ্চিত করে।',
        bullets: ['কনফিডেন্স স্কোর ফিল্টার', 'রিফান্ড সিলিং লিমিট', 'সম্পূর্ণ অডিট ট্রেইল']
      }
    ],
    ctaTitle: 'কাস্টম এন্টারপ্রাইজ চ্যানেল সলিউশন প্রয়োজন?',
    ctaDesc: 'আমরা উচ্চ ভলিউমের রিটেইলারদের কাস্টম ERP কানেক্টর, ডেডিকেটেড হোয়াটসঅ্যাপ নম্বর এবং এন্টারপ্রাইজ SLA প্রদান করি।',
    ctaBtnDemo: 'কাস্টম ডেমো অনুরোধ করুন',
    ctaBtnContact: 'সলিউশন টিমের সাথে কথা বলুন'
  },

  es: {
    title: 'Herramientas integrales para el comercio automatizado',
    subtitle: 'Explore cada componente diseñado para automatizar conversaciones, impulsar ventas minoristas y agilizar operaciones en sus canales digitales.',
    categories: [
      { id: 'all', label: 'Todas las Capacidades' },
      { id: 'sales-ai', label: 'Comercio y Ventas con IA' },
      { id: 'channels', label: 'Integraciones de Canales' },
      { id: 'operations', label: 'Operaciones y Pedidos' },
      { id: 'governance', label: 'Seguridad y Derivación' }
    ],
    items: [
      {
        id: 'f1',
        category: 'sales-ai',
        title: 'Agente de Ventas con IA',
        icon: Bot,
        tag: 'Ingresos Autónomos',
        desc: 'Entiende los gustos, tallas y preferencias del cliente para recomendar productos adecuados y cerrar ventas de alta conversión.',
        bullets: ['Sugerencias de productos personalizadas', 'Límites de aprobación de descuentos', 'Lógica de venta cruzada y mejoras']
      },
      {
        id: 'f2',
        category: 'sales-ai',
        title: 'Soporte al Cliente con IA',
        icon: Headphones,
        tag: 'Conserje 24/7',
        desc: 'Responde de inmediato dudas sobre tiempos de entrega, cuidado de prendas, medidas, políticas de tienda y estados de pedido.',
        bullets: ['Respuestas en menos de 3 segundos', 'Memoria de contexto multivariable', 'Traducción automática multilingüe']
      },
      {
        id: 'f3',
        category: 'channels',
        title: 'WhatsApp Business Cloud',
        icon: MessageSquare,
        tag: 'API Oficial de Meta',
        desc: 'Automatiza chats individuales de WhatsApp, catálogos, botones interactivos y alertas de envío.',
        bullets: ['Tarjetas multimedia e imágenes', 'Compatibilidad con pagos', 'Alta tasa de entrega']
      },
      {
        id: 'f4',
        category: 'channels',
        title: 'Automatización de Instagram Direct',
        icon: Share2,
        tag: 'Sincro de Historias y DM',
        desc: 'Responde de inmediato respuestas a historias, menciones y mensajes privados con tarjetas interactivas de producto.',
        bullets: ['Respuestas a menciones en historias', 'Captura de compra desde Reels', 'Verificación de seguidores']
      },
      {
        id: 'f5',
        category: 'channels',
        title: 'Integración con Facebook Messenger',
        icon: Share2,
        tag: 'Gestión de Páginas',
        desc: 'Sincroniza los mensajes de la página oficial y prospectos provenientes de campañas de anuncios Click-to-Messenger.',
        bullets: ['Conversión de tráfico publicitario', 'Disparadores por comentarios en publicaciones', 'Identificador único de cliente']
      },
      {
        id: 'f6',
        category: 'operations',
        title: 'Gestión de Productos en Vivo',
        icon: Boxes,
        tag: 'Motor de Catálogo',
        desc: 'Índice de productos centralizado que admite SKU, variantes, precios, niveles de inventario y descripciones de IA.',
        bullets: ['Reserva de stock en tiempo real', 'Selector de variantes', 'Sincronización con Shopify / WooCommerce']
      },
      {
        id: 'f7',
        category: 'operations',
        title: 'Gestión Autónoma de Pedidos',
        icon: ShoppingBag,
        tag: 'Ciclo de Pedidos',
        desc: 'Rastrea cada pedido desde pendiente hasta entregado, con avisos automáticos de paquetería al chat del cliente.',
        bullets: ['Validación automática de direcciones', 'Generación inmediata de facturas', 'Verificación de pagos']
      },
      {
        id: 'f8',
        category: 'operations',
        title: 'CRM Omnicanal de Clientes',
        icon: Users,
        tag: 'Cliente 360',
        desc: 'Mantiene un perfil único de cliente en WhatsApp, Instagram y Facebook con historial completo de compras y etiquetas.',
        bullets: ['Seguimiento de valor vitalicio', 'Identificación de canales', 'Etiquetas de segmentación personalizadas']
      },
      {
        id: 'f9',
        category: 'governance',
        title: 'Derivación Humana y Copiloto',
        icon: Users,
        tag: 'Flujo de Trabajo del Equipo',
        desc: 'Transfiere consultas complejas a agentes humanos con sugerencias de borrador de IA y resumen de contexto completo.',
        bullets: ['Toma de control en un clic', 'Asignación de agentes', 'Alertas de escalado por sentimiento']
      },
      {
        id: 'f10',
        category: 'governance',
        title: 'Estudio de Base de Conocimiento de IA',
        icon: Sliders,
        tag: 'Anclaje Personalizado',
        desc: 'Entrene a su asistente con las políticas exactas de su tienda, pautas de envío, preguntas frecuentes y tono de marca sin código.',
        bullets: ['Editor de políticas sencillo', 'Indexación de documentos y enlaces', 'Vista previa instantánea en entorno de pruebas']
      },
      {
        id: 'f11',
        category: 'operations',
        title: 'Analíticas de Ingresos y Velocidad',
        icon: DollarSign,
        tag: 'Seguimiento de ROI',
        desc: 'Cuantifique ingresos automatizados, tiempo ahorrado, tasas de resolución y canales sociales con mejor conversión en tiempo real.',
        bullets: ['Desglose por canal', 'Porcentaje de resolución', 'Exportación a CSV / Excel']
      },
      {
        id: 'f12',
        category: 'governance',
        title: 'Defensas de Seguridad y Aprobaciones',
        icon: ShieldCheck,
        tag: 'Protección de Marca',
        desc: 'Aplique filtros de confianza, frases prohibidas y aprobación obligatoria del supervisor para reembolsos o grandes descuentos.',
        bullets: ['Filtros de puntuación de confianza', 'Límites de reembolso', 'Pista de auditoría completa']
      }
    ],
    ctaTitle: '¿Requiere orquestación empresarial personalizada?',
    ctaDesc: 'Brindamos soporte a minoristas de alto volumen con conectores ERP personalizados, números dedicados de WhatsApp y acuerdos de nivel de servicio.',
    ctaBtnDemo: 'Solicitar Demo Personalizada',
    ctaBtnContact: 'Contactar al Equipo de Soluciones'
  }
};

export function FeaturesPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const data = FEATURES_DATA[langKey] || FEATURES_DATA.en;

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFeatures = selectedCategory === 'all'
    ? data.items
    : data.items.filter(f => f.category === selectedCategory);

  return (
    <div style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <h1>{data.title}</h1>
          <p>{data.subtitle}</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-10)' }}>
          <div className="capsule-filter-group">
            {data.categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`capsule-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          {filteredFeatures.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="feature-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div className="feature-icon-box">
                    <Icon size={20} />
                  </div>
                  <Badge variant="olive">{item.tag}</Badge>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {item.desc}
                </p>

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
                  {item.bullets.map((b, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      <Check size={15} color="var(--bright-olive)" style={{ flexShrink: 0 }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA Bar */}
        <div className="features-cta-card">
          <h3 style={{ marginBottom: '0.5rem' }}>{data.ctaTitle}</h3>
          <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.925rem' }}>
            {data.ctaDesc}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => onNavigate('book-demo')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#FF334B',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 51, 75, 0.5)',
                borderRadius: 0,
                padding: '0.85rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(255, 51, 75, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#FF4D61'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#FF334B'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span>{data.ctaBtnDemo}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 0,
                padding: '0.85rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span>{data.ctaBtnContact}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
