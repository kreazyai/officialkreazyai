import React from 'react';
import {
  ArrowRight,
  Check,
  ShieldCheck,
  MessageSquare,
  Bot,
  Zap,
  CheckCircle2,
  Headphones,
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const WORKFLOW_CONTENT = {
  en: {
    title: 'How KreazyAI transforms your social commerce',
    subtitle: 'An end-to-end overview of how customer inquiries become confirmed orders, synced inventory, and brand loyalty without manual bottlenecking.',
    step1: {
      number: '01',
      badge: 'Multi-Channel Ingestion',
      title: 'Direct official Meta Cloud API connectivity',
      desc: "KreazyAI connects directly to Meta's enterprise graph endpoints for WhatsApp Business, Instagram Direct, and Facebook Pages. Incoming inquiries, comment queries, and ad-click messages stream into the system with sub-second latency.",
      b1: 'Official Meta verified webhook handshake',
      b2: 'No risky browser extensions or third-party wrappers',
      b3: 'Multi-agent queue with zero message dropping',
      waTitle: 'WhatsApp Business Cloud',
      igTitle: 'Instagram Professional Graph',
      fbTitle: 'Facebook Messenger Pages',
      statusConnected: 'Connected • Active'
    },
    step2: {
      number: '02',
      badge: 'Catalog Grounding',
      title: 'Live store catalog & warehouse synchronization',
      desc: 'The AI does not guess inventory. It indexes your exact products, sizes, prices, variants, and stock counts. When a customer asks if an item is available, the agent checks real-time numbers before answering.',
      b1: 'Real-time out-of-stock prevention',
      b2: 'Support for complex size & color variant combinations',
      b3: 'Automatic image & specification card previews',
      boxTitle: 'Synchronized Store Knowledge',
      autoSync: 'Auto-Sync On',
      item1: '📦 48 Products active in AI Knowledge Base',
      item2: '📐 Sizing charts, dimensions & materials indexed',
      item3: '🚚 Shipping rates & return policies loaded'
    },
    step3: {
      number: '03',
      badge: 'Deterministic Decision Making',
      title: 'Commercial guardrails & consultative sales',
      desc: 'KreazyAI is not an unrestricted chatbot. It is a commercial agent governed by your policies. You define allowed discount percentages, refund limits, and escalation rules.',
      b1: 'Never promises non-existent discounts or freebies',
      b2: 'Strict 85%+ semantic confidence thresholds',
      b3: 'Instant escalation when customer asks for a person',
      boxTitle: 'Safety Engine In Action'
    },
    step4: {
      number: '04',
      badge: 'In-Chat Order Capture',
      title: 'Frictionless in-chat checkout & address collection',
      desc: 'Stop losing customers to drop-offs on external websites. KreazyAI collects recipient names, phone numbers, delivery addresses, and payment preferences directly inside the chat window.',
      b1: 'Full support for Cash on Delivery (COD) & mobile payments',
      b2: 'Instant order recap & confirmation slips sent in chat',
      b3: 'Meta Conversions API (CAPI) purchase event firing',
      receiptTitle: 'Live Order Receipt',
      orderNum: 'Confirmed #KZ-8291',
      lblCustomer: 'Customer',
      lblPhone: 'Phone',
      lblLocation: 'Delivery Location',
      lblTotal: 'Total (COD)',
      valLocation: 'Dhanmondi, Dhaka'
    },
    step5: {
      number: '05',
      badge: 'Unified Team Control',
      title: 'Real-time dashboard telemetry & 1-click takeover',
      desc: 'Every conversation, captured lead, and confirmed sale syncs instantly to your merchant portal. Staff can monitor chats live, inspect AI draft replies, and step in anytime with a single click.',
      b1: 'Unified omnichannel inbox (WhatsApp, IG, Messenger)',
      b2: 'Real-time courier dispatch webhook triggers',
      b3: '1-click human agent takeover preserves full chat history',
      consoleTitle: 'Operator Console',
      liveSync: 'Live Sync',
      channelsLabel: 'Active Social Channels',
      channelsVal: '3 Connected',
      latencyLabel: 'Average Reply Latency',
      latencyVal: '1.2s',
      queueLabel: 'Human Escalation Queue',
      queueVal: '0 Pending (Clean)'
    },
    cta: {
      title: 'Ready to automate your social commerce?',
      subtitle: 'Start your 7-day free trial now. Connect WhatsApp, Instagram, and Messenger in under 5 minutes.',
      btn: 'Experience The Workflow Free'
    }
  },

  bn: {
    title: 'কীভাবে ক্রেজি এআই আপনার সোশ্যাল কমার্সকে বদলে দেয়',
    subtitle: 'গ্রাহকের ইনকোয়ারি থেকে শুরু করে নিশ্চিত অর্ডার, ইনভেন্টরি সিঙ্ক ও গ্রাহকের আস্থা অর্জন—কোনো ম্যানুয়াল বিলম্ব ছাড়া সম্পূর্ণ স্বয়ংক্রিয় কাজের রূপরেখা।',
    step1: {
      number: '০১',
      badge: 'মাল্টি-চ্যানেল ইনজেশন',
      title: 'অফিসিয়াল মেটা ক্লাউড এপিআই সরাসরি সংযোগ',
      desc: 'ক্রেজি এআই সরাসরি হোয়াটসঅ্যাপ বিজনেস, ইনস্টাগ্রাম ডিরেক্ট এবং ফেসবুক পেজের জন্য মেটার অফিশিয়াল এন্টারপ্রাইজ গ্রাফ এন্ডপয়েন্টে সংযুক্ত হয়। ইনবক্স মেসেজ বা বিজ্ঞাপনের ক্লিকের মেসেজ সাব-সেকেন্ডের মধ্যে সিস্টেমে চলে আসে।',
      b1: 'অফিসিয়াল মেটা ভেরিফাইড ওয়েবহুক হ্যান্ডশেক',
      b2: 'কোনো ঝুঁকিপূর্ণ ব্রাউজার এক্সটেনশন বা থার্ড-পার্টি টুল নয়',
      b3: 'শূন্য মেসেজ ড্রপ নিশ্চিতকারী মাল্টি-এজেন্ট কিউ',
      waTitle: 'হোয়াটসঅ্যাপ বিজনেস ক্লাউড',
      igTitle: 'ইনস্টাগ্রাম প্রফেশনাল গ্রাফ',
      fbTitle: 'ফেসবুক মেসেঞ্জার পেজ',
      statusConnected: 'সংযুক্ত • সক্রিয়'
    },
    step2: {
      number: '০২',
      badge: 'ক্যাটালগ গ্রাউন্ডিং',
      title: 'লাইভ স্টোর ক্যাটালগ ও ওয়্যারহাউস সিঙ্ক্রোনাইজেশন',
      desc: 'এআই কোনো মনগড়া স্টক অনুমান করে না। এটি আপনার আসল পণ্য, সাইজ, দাম, ভেরিয়েন্ট ও স্টক সংখ্যা সরাসরি ডাটাবেস থেকে যাচাই করে উত্তর দেয়।',
      b1: 'রিয়েল-টাইম স্টক শেষ হওয়ার ভুল রোধ',
      b2: 'জটিল সাইজ ও কালার ভেরিয়েন্ট সমন্বয়ের পূর্ণ সাপোর্ট',
      b3: 'স্বয়ংক্রিয় ছবি ও স্পেসিফিকেশন কার্ড প্রিভিউ',
      boxTitle: 'সিঙ্ক করা স্টোর নলেজ',
      autoSync: 'অটো-সিঙ্ক চালু',
      item1: '📦 ৪৮টি পণ্য এআই নলেজ বেসে সক্রিয়',
      item2: '📐 সাইজ চার্ট, মাপ ও কাপড়ের বিবরণ সংরক্ষিত',
      item3: '🚚 ডেলিভারি চার্জ ও রিটার্ন পলিসি যুক্ত'
    },
    step3: {
      number: '০৩',
      badge: 'নীতিমালা ও সিদ্ধান্ত গ্রহণ',
      title: 'বাণিজ্যিক সুরক্ষা ও পরামর্শমূলক বিক্রয়',
      desc: 'ক্রেজি এআই সাধারণ চ্যাটবট নয়। এটি আপনার নিয়ম অনুযায়ী পরিচালিত একটি বাণিজ্যিক এজেন্ট। ডিসকাউন্টের শতকরা হার, রিফান্ড সীমা ও মানুষের কাছে হস্তান্তরের নিয়ম আপনি নির্ধারণ করবেন।',
      b1: 'কখনোই মনগড়া ডিসকাউন্ট বা ফ্রি গিফট প্রতিশ্রুতি দেয় না',
      b2: 'কঠোর ৮৫%+ কনফিডেন্স স্কোর বাধ্যবাধকতা',
      b3: 'গ্রাহক মানুষের সাথে কথা বলতে চাইলে তাৎক্ষণিক হস্তান্তর',
      boxTitle: 'সুরক্ষা ইঞ্জিন সক্রিয়'
    },
    step4: {
      number: '০৪',
      badge: 'ইন-চ্যাট অর্ডার সংগ্রহ',
      title: 'সহজ ইন-চ্যাট চেকআউট ও ঠিকানা সংগ্রহ',
      desc: 'বাইরের ওয়েবসাইটের লিংকে গিয়ে গ্রাহক হারানোর দিন শেষ। ক্রেজি এআই চ্যাটের ভেতরেই প্রাপকের নাম, ফোন নম্বর, ডেলিভারি ঠিকানা এবং পেমেন্ট পদ্ধতি সংগ্রহ করে।',
      b1: 'ক্যাশ অন ডেলিভারি (COD) ও মোবাইল পেমেন্টের পূর্ণ সমর্থন',
      b2: 'চ্যাটেই তাৎক্ষণিক অর্ডার সামারি ও কনফার্মেশন স্লিপ প্রেরণ',
      b3: 'মেটা কনভার্সন এপিআই (CAPI) পারচেজ ইভেন্ট ট্রিগার',
      receiptTitle: 'লাইভ অর্ডার রসিদ',
      orderNum: 'নিশ্চিত #KZ-8291',
      lblCustomer: 'গ্রাহকের নাম',
      lblPhone: 'ফোন নম্বর',
      lblLocation: 'ডেলিভারি ঠিকানা',
      lblTotal: 'মোট বিল (ক্যাশ অন ডেলিভারি)',
      valLocation: 'ধানমন্ডি, ঢাকা'
    },
    step5: {
      number: '০৫',
      badge: 'টিমের সমন্বিত নিয়ন্ত্রণ',
      title: 'রিয়েল-টাইম ড্যাশবোর্ড ডেটা ও ১-ক্লিকে মানুষের নিয়ন্ত্রণ',
      desc: 'প্রতিটি কথোপকথন, ক্যাপচার করা লিড এবং নিশ্চিত বিক্রয় সাথে সাথে মার্চেন্ট পোর্টালে সিঙ্ক হয়। টিম মেম্বাররা লাইভ চ্যাট দেখতে পারে এবং প্রয়োজনে ১ ক্লিকে কথা বলতে পারে।',
      b1: 'সমন্বিত অমনিচ্যানেল ইনবক্স (হোয়াটসঅ্যাপ, ইনস্টাগ্রাম, মেসেঞ্জার)',
      b2: 'রিয়েল-টাইম কুরিয়ার পার্সেল বুকিং ওয়েবহুক ট্রিগার',
      b3: 'সম্পূর্ণ চ্যাট হিস্ট্রি বজায় রেখে ১ ক্লিকে মানুষ টেকওভার',
      consoleTitle: 'অপারেটর কনসোল',
      liveSync: 'লাইভ সিঙ্ক',
      channelsLabel: 'সক্রিয় সোশ্যাল চ্যানেল',
      channelsVal: '৩টি সংযুক্ত',
      latencyLabel: 'গড় উত্তর দেওয়ার সময়',
      latencyVal: '১.২ সেকেন্ড',
      queueLabel: 'হিউম্যান এস্কেলেশন কিউ',
      queueVal: '০ পেন্ডিং (ক্লিন)'
    },
    cta: {
      title: 'আপনার সোশ্যাল কমার্স স্বয়ংক্রিয় করতে প্রস্তুত?',
      subtitle: 'আপনার ৭ দিনের ফ্রি ট্রায়াল আজই শুরু করুন। মাত্র ৫ মিনিটে হোয়াটসঅ্যাপ, ইনস্টাগ্রাম ও মেসেঞ্জার যুক্ত করুন।',
      btn: 'ফ্রি ওয়ার্কফ্লো ট্রায়াল করুন'
    }
  },

  es: {
    title: 'Cómo KreazyAI transforma su comercio social',
    subtitle: 'Una descripción integral de cómo las consultas de clientes se convierten en pedidos confirmados, inventario sincronizado y fidelidad de marca sin cuellos de botella.',
    step1: {
      number: '01',
      badge: 'Ingesta Multicanal',
      title: 'Conectividad directa con la API oficial de Meta Cloud',
      desc: 'KreazyAI se conecta directamente a los puntos de enlace empresariales de Meta para WhatsApp Business, Instagram Direct y Páginas de Facebook. Las consultas y mensajes de anuncios ingresan con latencia menor a un segundo.',
      b1: 'Conexión de webhook oficial verificada por Meta',
      b2: 'Sin extensiones de navegador riesgosas ni emuladores',
      b3: 'Cola multiagente con cero pérdida de mensajes',
      waTitle: 'WhatsApp Business Cloud',
      igTitle: 'Instagram Professional Graph',
      fbTitle: 'Páginas de Facebook Messenger',
      statusConnected: 'Conectado • Activo'
    },
    step2: {
      number: '02',
      badge: 'Anclaje al Catálogo',
      title: 'Sincronización de catálogo y almacén en tiempo real',
      desc: 'La IA no adivina el inventario. Indexa sus productos, tallas, precios, variantes y cantidades exactas. Verifica existencias en tiempo real antes de responder.',
      b1: 'Prevención de venta sin existencias en tiempo real',
      b2: 'Soporte para combinaciones complejas de tallas y colores',
      b3: 'Vistas previas automáticas de imágenes y especificaciones',
      boxTitle: 'Conocimiento de Tienda Sincronizado',
      autoSync: 'Auto-Sincro Activo',
      item1: '📦 48 productos activos en la base de IA',
      item2: '📐 Tablas de tallas, medidas y materiales indexados',
      item3: '🚚 Tarifas de envío y políticas de devolución cargadas'
    },
    step3: {
      number: '03',
      badge: 'Toma de Decisiones Determinista',
      title: 'Controles comerciales y ventas consultivas',
      desc: 'KreazyAI no es un chatbot sin restricciones. Es un agente comercial regido por sus políticas. Usted define límites de descuento, reembolsos y reglas de derivación.',
      b1: 'Nunca promete descuentos inexistentes ni regalos',
      b2: 'Umbrales estrictos de confianza semántica del 85% o más',
      b3: 'Derivación inmediata cuando el cliente solicita un agente humano',
      boxTitle: 'Motor de Seguridad en Acción'
    },
    step4: {
      number: '04',
      badge: 'Captura de Pedidos en Chat',
      title: 'Finalización de compra y captura de dirección en chat',
      desc: 'Deje de perder ventas por abandono en webs externas. KreazyAI captura el nombre del destinatario, teléfono, dirección de entrega y forma de pago directamente en el chat.',
      b1: 'Soporte completo para Contra Entrega (COD) y pagos móviles',
      b2: 'Resumen inmediato de pedido y comprobante enviado en chat',
      b3: 'Activación de eventos de compra en la API de Conversiones de Meta (CAPI)',
      receiptTitle: 'Recibo de Pedido en Vivo',
      orderNum: 'Confirmado #KZ-8291',
      lblCustomer: 'Cliente',
      lblPhone: 'Teléfono',
      lblLocation: 'Lugar de Entrega',
      lblTotal: 'Total (Contra Entrega)',
      valLocation: 'Madrid Centro'
    },
    step5: {
      number: '05',
      badge: 'Control Unificado del Equipo',
      title: 'Telemetría en tiempo real del panel y control en 1 clic',
      desc: 'Cada conversación, cliente potencial y venta confirmada se sincroniza al instante en su portal. El personal puede monitorear chats en vivo, revisar borradores de IA e intervenir en cualquier momento con un solo clic.',
      b1: 'Bandeja de entrada omnicanal unificada (WhatsApp, IG, Messenger)',
      b2: 'Activación de envíos en tiempo real con empresas de logística',
      b3: 'Toma de control humano en 1 clic conservando el historial completo',
      consoleTitle: 'Consola de Operador',
      liveSync: 'Sincro en Vivo',
      channelsLabel: 'Canales Sociales Activos',
      channelsVal: '3 Conectados',
      latencyLabel: 'Latencia Media de Respuesta',
      latencyVal: '1.2s',
      queueLabel: 'Cola de Derivación Humana',
      queueVal: '0 Pendientes (Limpia)'
    },
    cta: {
      title: '¿Listo para automatizar su comercio social?',
      subtitle: 'Comience su prueba gratuita de 7 días. Conecte WhatsApp, Instagram y Messenger en menos de 5 minutos.',
      btn: 'Pruebe el Flujo Gratis'
    }
  }
};

export function HowItWorksPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const content = WORKFLOW_CONTENT[langKey] || WORKFLOW_CONTENT.en;

  return (
    <div style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0 clamp(4rem, 8vw, 6rem) 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '820px', margin: '0 auto clamp(2.5rem, 5vw, 4rem) auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            {content.title}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {content.subtitle}
          </p>
        </div>

        {/* Detailed 5-Step Deep Dive in Modular Elevated Boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 3vw, 2.5rem)' }}>

          {/* STEP 1 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">{content.step1.number}</span>
                <span className="badge badge-mint">{content.step1.badge}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                {content.step1.title}
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {content.step1.desc}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step1.b1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step1.b2}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step1.b3}
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{content.step1.waTitle}</span>
                    <Badge variant="whatsapp">{content.step1.statusConnected}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{content.step1.igTitle}</span>
                    <Badge variant="instagram">{content.step1.statusConnected}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{content.step1.fbTitle}</span>
                    <Badge variant="facebook">{content.step1.statusConnected}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">{content.step2.number}</span>
                <span className="badge badge-mint">{content.step2.badge}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                {content.step2.title}
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {content.step2.desc}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step2.b1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step2.b2}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step2.b3}
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{content.step2.boxTitle}</span>
                  <Badge variant="success">{content.step2.autoSync}</Badge>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 550 }}>
                    {content.step2.item1}
                  </div>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 550 }}>
                    {content.step2.item2}
                  </div>
                  <div style={{ padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontWeight: 550 }}>
                    {content.step2.item3}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">{content.step3.number}</span>
                <span className="badge badge-mint">{content.step3.badge}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                {content.step3.title}
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {content.step3.desc}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step3.b1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step3.b2}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step3.b3}
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--green)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} /> {content.step3.boxTitle}
                </div>
                <div style={{ backgroundColor: '#092A20', border: '1px solid #144636', padding: '1.15rem', borderRadius: '10px', fontSize: '0.825rem', lineHeight: 1.7, color: '#E8F5EE', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: '#A5F052' }}>IF</span> customer_intent == <span style={{ color: '#DDF7E9' }}>"request_discount"</span> <span style={{ color: '#A5F052' }}>AND</span> hesitating:<br />
                  &nbsp;&nbsp;<span style={{ color: '#6EE7B7' }}>OFFER</span> max_discount(10%)<br />
                  <span style={{ color: '#A5F052' }}>ELSE IF</span> sentiment == <span style={{ color: '#DDF7E9' }}>"frustrated"</span>:<br />
                  &nbsp;&nbsp;<span style={{ color: '#6EE7B7' }}>ESCALATE_TO_HUMAN</span>(queue=<span style={{ color: '#DDF7E9' }}>"VIP_Support"</span>)
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">{content.step4.number}</span>
                <span className="badge badge-mint">{content.step4.badge}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                {content.step4.title}
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {content.step4.desc}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step4.b1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step4.b2}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step4.b3}
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{content.step4.receiptTitle}</span>
                  <Badge variant="success">{content.step4.orderNum}</Badge>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{content.step4.lblCustomer}</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>Sadat Sakib</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{content.step4.lblPhone}</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>+880 1712-345678</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>{content.step4.lblLocation}</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>{content.step4.valLocation}</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--green)' }}>
                    <span>{content.step4.lblTotal}</span>
                    <span>৳1,490</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5 BOX */}
          <div className="workflow-step-box">
            <div className="workflow-step-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="step-number">{content.step5.number}</span>
                <span className="badge badge-mint">{content.step5.badge}</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 850, letterSpacing: '-0.035em', lineHeight: 1.15, marginBottom: '0.85rem', color: 'var(--primary-dark)' }}>
                {content.step5.title}
              </h2>
              <p style={{ marginBottom: '1.25rem', fontSize: '0.975rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {content.step5.desc}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: 0, margin: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step5.b1}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step5.b2}
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                  <Check size={16} color="var(--green)" /> {content.step5.b3}
                </li>
              </ul>
            </div>
            <div className="workflow-step-visual">
              <div className="workflow-step-card-inner">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-dark)' }}>{content.step5.consoleTitle}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', background: 'var(--mint-soft)', padding: '2px 8px', borderRadius: '4px' }}>{content.step5.liveSync}</span>
                </div>
                <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{content.step5.channelsLabel}</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>{content.step5.channelsVal}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{content.step5.latencyLabel}</span>
                    <strong style={{ color: 'var(--green)' }}>{content.step5.latencyVal}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{content.step5.queueLabel}</span>
                    <strong style={{ color: 'var(--primary-dark)' }}>{content.step5.queueVal}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA Box */}
        <div style={{
          background: 'linear-gradient(135deg, #092A20 0%, #103B2E 100%)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
          textAlign: 'center',
          color: '#FFFFFF',
          marginTop: 'clamp(3rem, 6vw, 5rem)',
          boxShadow: '0 24px 60px rgba(9, 42, 32, 0.25)',
          border: '1px solid rgba(165, 240, 82, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 850, letterSpacing: '-0.035em', marginBottom: '0.85rem', color: '#FFFFFF' }}>
            {content.cta.title}
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.85)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.6 }}>
            {content.cta.subtitle}
          </p>
          <Button variant="primary" size="lg" onClick={() => onNavigate('signup')} iconRight={ArrowRight}>
            {content.cta.btn}
          </Button>
        </div>

      </div>
    </div>
  );
}
