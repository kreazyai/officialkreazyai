import React, { useState } from 'react';
import {
  ShoppingBag,
  Shirt,
  Target,
  Headphones,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  MessageSquare,
  Bot,
  Users
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const SOLUTIONS_EN = [
  {
    id: 'd2c',
    label: 'D2C Social Commerce',
    title: 'Turn Direct Messages into High-Converting Online Checkout',
    badge: 'Direct-to-Consumer',
    description: 'Transform your WhatsApp, Instagram, and Messenger inboxes from chaotic chat queues into automated, revenue-generating storefronts.',
    stats: [
      { value: '4.2x', label: 'Faster checkout completion' },
      { value: '0', label: 'Dropped inquiries in peak hours' },
      { value: '78%', label: 'Conversations resolved autonomously' }
    ],
    highlights: [
      'Automatic product catalog recommendations tailored to customer questions',
      'Real-time address, phone, and delivery area verification inside chat',
      'Instant order creation with automated invoice dispatch',
      'Zero risk of customer abandonment due to slow moderator response times'
    ]
  },
  {
    id: 'fashion',
    label: 'Fashion & Apparel Retail',
    title: 'Autonomous Sizing, Color Swatches & Live Stock Guidance',
    badge: 'Fashion & Retail',
    description: 'Provide personalized styling advice, check inventory availability across sizes (S/M/L/XL), and close orders without manual back-and-forth.',
    stats: [
      { value: '65%', label: 'Reduction in sizing inquiry time' },
      { value: '3.4x', label: 'Higher average order value via upsells' },
      { value: '94%', label: 'Stock lookup accuracy in real-time' }
    ],
    highlights: [
      'AI understands customer size and fit inquiries in Bangla, Spanish, and English',
      'Checks live inventory before confirming orders to prevent stockouts',
      'Suggests matching accessories and bundle discounts seamlessly',
      'Handles return policy guidance and exchange inquiries with clarity'
    ]
  },
  {
    id: 'paid-ads',
    label: 'Meta Ad Campaign Scaling',
    title: 'Convert Click-to-Message Ad Traffic into Verified Orders in Seconds',
    badge: 'Paid Ads Optimization',
    description: 'Stop burning ad budget on slow replies. Instantly engage leads clicking on Facebook and Instagram ad campaigns within 1.2 seconds.',
    stats: [
      { value: '1.2s', label: 'Average first response to ad leads' },
      { value: '62%', label: 'Higher ROAS conversion rate' },
      { value: '24/7', label: 'Continuous ad traffic capture' }
    ],
    highlights: [
      'Direct attribution from Meta Click-to-WhatsApp and Messenger ads',
      'Immediate greeting matching the specific ad creative the customer clicked',
      'Automated qualification: extracts purchase intent, address, and phone number',
      'Live customer sync directly into your store CRM or Google Sheets'
    ]
  },
  {
    id: 'support',
    label: 'Omnichannel Customer Support',
    title: '24/7 Sub-Second Answers with Intelligent Human Escalation',
    badge: 'Support Desk',
    description: 'Resolve high-frequency customer queries—delivery status, parcel tracking, store locations, and policies—without tying up human staff.',
    stats: [
      { value: '< 2s', label: 'Average answer latency' },
      { value: '88%', label: 'First-contact resolution rate' },
      { value: '1 Click', label: 'Seamless human supervisor handoff' }
    ],
    highlights: [
      'Trained strictly on your exact store policies, shipping rates, and FAQs',
      'Multi-channel unified inbox keeps customer history consolidated in one view',
      'Automatic courier tracking status retrieval for waiting buyers',
      'Sentiment analysis alerts team members when customer intervention is needed'
    ]
  },
  {
    id: 'agency',
    label: 'Multi-Brand Agencies & Groups',
    title: 'Centralized Multi-Store Control from One Scalable Platform',
    badge: 'Agencies & Enterprises',
    description: 'Manage 10+ Facebook pages, Instagram handles, and WhatsApp numbers across different retail brands from a single unified control room.',
    stats: [
      { value: '10+', label: 'Brands managed under one workspace' },
      { value: '100%', label: 'Isolated brand catalog grounding' },
      { value: '5 Min', label: 'New brand onboarding speed' }
    ],
    highlights: [
      'Role-based permissions for managers, moderators, and brand supervisors',
      'Separate knowledge bases and custom AI tones for each brand portfolio',
      'Aggregated revenue and conversation analytics across all client stores',
      'Enterprise Meta Cloud API architecture with dedicated webhooks'
    ]
  }
];

const SOLUTIONS_BN = [
  {
    id: 'd2c',
    label: 'ডি২সি সোশ্যাল কমার্স',
    title: 'সোশ্যাল চ্যাটকে রূপান্তর করুন উচ্চ-কনভার্সন অনলাইন চেকআউটে',
    badge: 'ডিরেক্ট-টু-কনজিউমার',
    description: 'আপনার হোয়াটসঅ্যাপ, ইনস্টাগ্রাম এবং মেসেঞ্জার ইনবক্সকে বিশৃঙ্খল চ্যাট সারি থেকে একটি স্বয়ংক্রিয়, আয় বৃদ্ধিকারী ডিজিটাল স্টোরফ্রন্টে পরিণত করুন।',
    stats: [
      { value: '৪.২ গুণ', label: 'দ্রুততর চেকআউট সম্পন্ন' },
      { value: '০%', label: 'পিক আওয়ারে মেসেজ ড্রপ' },
      { value: '৭৮%', label: 'স্বয়ংক্রিয়ভাবে সমাধানকৃত চ্যাট' }
    ],
    highlights: [
      'গ্রাহকের প্রশ্ন অনুযায়ী স্বয়ংক্রিয় ক্যাটালগ ও পণ্য সুপারিশ',
      'চ্যাটের ভেতরেই লাইভ ঠিকানা, ফোন নম্বর এবং ডেলিভারি এলাকা যাচাই',
      'স্বয়ংক্রিয় চালান ও ট্র্যাকিং তৈরিসহ দ্রুত অর্ডার নিশ্চিতকরণ',
      'দেরিতে উত্তরের কারণে গ্রাহক হারিয়ে যাওয়ার ঝুঁকি নেই'
    ]
  },
  {
    id: 'fashion',
    label: 'ফ্যাশন ও পোশাক রিটেইল',
    title: 'স্বয়ংক্রিয় সাইজ গাইড, কালার সোয়াচ ও স্টক যাচাই',
    badge: 'ফ্যাশন ও রিটেইল',
    description: 'গ্রাহকদের ব্যক্তিগত স্টাইলিং পরামর্শ দিন, সাইজ (S/M/L/XL) স্টক পরীক্ষা করুন এবং মানুষের সাহায্য ছাড়াই সেকেন্ডের মধ্যে অর্ডার সম্পন্ন করুন।',
    stats: [
      { value: '৬৫%', label: 'সাইজ সংক্রান্ত অনুসন্ধানের সময় হ্রাস' },
      { value: '৩.৪ গুণ', label: 'আপসেলের মাধ্যমে উচ্চতর গড় অর্ডার' },
      { value: '৯৪%', label: 'রিয়েল-টাইম স্টক যাচাইয়ের সঠিকতা' }
    ],
    highlights: [
      'বাংলা, বাংলিশ এবং ইংরেজিতে গ্রাহকের সাইজ ও ফিট সংক্রান্ত প্রশ্ন বোঝে',
      'স্টক শেষ হওয়া ঠেকাতে অর্ডার নিশ্চিত করার আগে লাইভ ইনভেন্টরি যাচাই করে',
      'ম্যাচিং জুয়েলারি, এক্সেসরিজ ও বান্ডেল অফার সহজে গ্রাহকের সামনে আনে',
      'রিটার্ন পলিসি ও এক্সচেঞ্জ সংক্রান্ত যেকোনো প্রশ্নের স্পষ্ট সমাধান দেয়'
    ]
  },
  {
    id: 'paid-ads',
    label: 'মেটা অ্যাড ক্যাম্পেইন স্কেলিং',
    title: 'মেসেজ বিজ্ঞাপনের ট্র্যাফিককে সেকেন্ডের মধ্যে অর্ডারে রূপান্তর',
    badge: 'পেইড অ্যাডস অপ্টিমাইজেশন',
    description: 'দেরিতে রিপ্লাই দিয়ে বিজ্ঞাপনের বাজেট নষ্ট করা বন্ধ করুন। ফেসবুক ও ইনস্টাগ্রাম বিজ্ঞাপনে ক্লিক করা গ্রাহকদের ১.২ সেকেন্ডের মধ্যে যুক্ত করুন।',
    stats: [
      { value: '১.২ সে', label: 'বিজ্ঞাপনের লিডে প্রথম উত্তর' },
      { value: '৬২%', label: 'উচ্চতর আরওএএস (ROAS) কনভার্সন' },
      { value: '২৪/৭', label: 'নিরবচ্ছিন্ন বিজ্ঞাপন ট্র্যাফিক ক্যাপচার' }
    ],
    highlights: [
      'মেটা ক্লিক-টু-হোয়াটসঅ্যাপ ও মেসেঞ্জার বিজ্ঞাপন থেকে সরাসরি লিড সংগ্রহ',
      'গ্রাহক যে নির্দিষ্ট পণ্যের বিজ্ঞাপনে ক্লিক করেছেন তার সাথে মানানসই সম্ভাষণ',
      'স্বয়ংক্রিয় যাচাই: কেনার উদ্দেশ্য, পূর্ণ ঠিকানা এবং ফোন নম্বর সংগ্রহ',
      'স্টোর সিআরএম বা গুগল স্প্রেডশিটে রিয়েল-টাইম ডেটা সিঙ্ক'
    ]
  },
  {
    id: 'support',
    label: 'অমনিচ্যানেল কাস্টমার সাপোর্ট',
    title: '২৪/৭ সাব-সেকেন্ড উত্তর এবং নির্বিঘ্ন টিম হ্যান্ডঅফ',
    badge: 'সাপোর্ট ডেস্ক',
    description: 'ঘন ঘন আসা প্রশ্নগুলো—ডেলিভারি স্ট্যাটাস, পার্সেল ট্র্যাকিং ও পলিসি—মানুষের সময় নষ্ট না করেই সেকেন্ডে সমাধান করুন।',
    stats: [
      { value: '< ২ সে', label: 'গড় উত্তর দেওয়ার সময়' },
      { value: '৮৮%', label: 'প্রথম কন্ট্যাক্টেই সমস্যা সমাধান' },
      { value: '১ ক্লিক', label: 'সহজ সুপারভাইজার হ্যান্ডঅফ' }
    ],
    highlights: [
      'আপনার স্টোরের সঠিক পলিসি, ডেলিভারি চার্জ ও তথ্যের ওপর প্রশিক্ষিত',
      'একীভূত ইনবক্স সমস্ত সোশ্যাল প্ল্যাটফর্মের গ্রাহক হিস্ট্রি একসাথে রাখে',
      'অপেক্ষারত গ্রাহকদের জন্য স্বয়ংক্রিয় কুরিয়ার ট্র্যাকিং লিঙ্ক প্রদান',
      'গ্রাহকের মনোভাব বুঝে জরুরি অভিযোগগুলোকে টিমের সামনে তুলে ধরে'
    ]
  },
  {
    id: 'agency',
    label: 'মাল্টি-ব্র্যান্ড এজেন্সি ও গ্রুপ',
    title: 'একক প্ল্যাটফর্ম থেকে একাধিক ব্র্যান্ডের কেন্দ্রীভূত নিয়ন্ত্রণ',
    badge: 'এজেন্সি ও এন্টারপ্রাইজ',
    description: '১০+ ফেসবুক পেজ, ইনস্টাগ্রাম হ্যান্ডেল ও হোয়াটসঅ্যাপ নম্বর একটি একক কন্ট্রোল রুম থেকে পরিচালনা করুন।',
    stats: [
      { value: '১০+', label: 'একই ওয়ার্কস্পেসে পরিচালিত ব্র্যান্ড' },
      { value: '১০০%', label: 'আলাদা আলাদা ব্র্যান্ড নলেজ বেস' },
      { value: '৫ মিনিট', label: 'নতুন ব্র্যান্ড অনবোর্ডিং স্পিড' }
    ],
    highlights: [
      'ম্যানেজার ও মডারেটরদের জন্য রোল-বেসড পারমিশন ব্যবস্থা',
      'প্রতিটি ব্র্যান্ডের জন্য আলাদা নলেজ বেস এবং নিজস্ব এআই টোন',
      'সব ক্লায়েন্ট স্টোরের সম্মিলিত রেভিনিউ ও চ্যাট অ্যানালিটিক্স',
      'ডেডিকেটেড ওয়েবহুকসহ এন্টারপ্রাইজ মেটা ক্লাউড এপিআই আর্কিটেকচার'
    ]
  }
];

const SOLUTIONS_ES = [
  {
    id: 'd2c',
    label: 'Comercio Social D2C',
    title: 'Transforma Mensajes Directos en Compras de Alta Conversión',
    badge: 'Directo al Consumidor',
    description: 'Transforma tus bandejas de WhatsApp, Instagram y Messenger en tiendas automatizadas generadoras de ingresos las 24 horas.',
    stats: [
      { value: '4.2x', label: 'Mayor rapidez en completar checkout' },
      { value: '0', label: 'Consultas perdidas en horas pico' },
      { value: '78%', label: 'Conversaciones resueltas de forma autónoma' }
    ],
    highlights: [
      'Recomendaciones automáticas de catálogo personalizadas a la consulta del cliente',
      'Verificación de dirección, teléfono y cobertura de entrega en el chat',
      'Generación inmediata de pedidos con envío automático de factura',
      'Cero ventas perdidas por demoras o falta de personal en atención'
    ]
  },
  {
    id: 'fashion',
    label: 'Moda y Retail Textil',
    title: 'Guía Autónoma de Tallas, Colores y Disponibilidad en Vivo',
    badge: 'Moda y Retail',
    description: 'Brinda asesoría de estilo personalizada, comprueba existencias por talla (S/M/L/XL) y cierra ventas sin demoras manuales.',
    stats: [
      { value: '65%', label: 'Reducción en tiempo de consulta de tallas' },
      { value: '3.4x', label: 'Mayor ticket promedio mediante ventas sugeridas' },
      { value: '94%', label: 'Exactitud de consulta de stock en tiempo real' }
    ],
    highlights: [
      'La IA comprende dudas de tallas y calce en español, inglés y más idiomas',
      'Verifica inventario real antes de confirmar pedidos para evitar desabastecimiento',
      'Sugiere accesorios complementarios y descuentos en paquetes',
      'Maneja políticas de cambio y devoluciones con absoluta claridad'
    ]
  },
  {
    id: 'paid-ads',
    label: 'Escalamiento de Anuncios Meta',
    title: 'Convierte Clics de Anuncios en Pedidos Verificados en Segundos',
    badge: 'Optimización de Anuncios',
    description: 'Deja de quemar presupuesto por responder tarde. Atiende a prospectos de campañas de Facebook e Instagram en menos de 1.2 segundos.',
    stats: [
      { value: '1.2s', label: 'Tiempo promedio de primera respuesta a anuncios' },
      { value: '62%', label: 'Mayor tasa de conversión de ROAS' },
      { value: '24/7', label: 'Captura constante de tráfico publicitario' }
    ],
    highlights: [
      'Atribución directa desde anuncios Click-to-WhatsApp y Messenger',
      'Saludo inmediato adaptado al anuncio específico que vio el cliente',
      'Calificación automática: detecta intención de compra, dirección y teléfono',
      'Sincronización en vivo directamente con tu CRM o Google Sheets'
    ]
  },
  {
    id: 'support',
    label: 'Soporte al Cliente Omnicanal',
    title: 'Respuestas en Milisegundos con Escalación Inteligente a Humanos',
    badge: 'Centro de Soporte',
    description: 'Resuelve dudas frecuentes—estado de envío, guía de rastreo y políticas—sin saturar a tus asesores humanos.',
    stats: [
      { value: '< 2s', label: 'Latencia promedio de respuesta' },
      { value: '88%', label: 'Tasa de resolución en el primer contacto' },
      { value: '1 Clic', label: 'Transferencia fluida a asesores humanos' }
    ],
    highlights: [
      'Entrenado estrictamente con tus políticas de tienda, envíos y preguntas frecuentes',
      'Bandeja unificada que mantiene el historial consolidado en una sola vista',
      'Recuperación automática de estado de paquetería para clientes en espera',
      'Análisis de sentimiento que alerta al equipo en reclamos prioritarios'
    ]
  },
  {
    id: 'agency',
    label: 'Agencias y Grupos Multimarca',
    title: 'Control Centralizado de Múltiples Marcas en una Sola Plataforma',
    badge: 'Agencias y Corporativos',
    description: 'Gestiona más de 10 páginas de Facebook, cuentas de Instagram y líneas de WhatsApp de diversas marcas desde una única sala de control.',
    stats: [
      { value: '10+', label: 'Marcas gestionadas bajo un mismo panel' },
      { value: '100%', label: 'Catálogos aislados y contextualizados por marca' },
      { value: '5 Min', label: 'Velocidad de incorporación de nuevas marcas' }
    ],
    highlights: [
      'Permisos por roles para administradores, moderadores y supervisores',
      'Bases de conocimiento independientes y tonos de voz propios para cada marca',
      'Analítica agregada de ingresos y conversaciones de todas las tiendas',
      'Arquitectura oficial de Meta Cloud API con webhooks dedicados'
    ]
  }
];

export function SolutionsPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const [activeTab, setActiveTab] = useState('d2c');

  const solutions = currentLang === 'bn' ? SOLUTIONS_BN : currentLang === 'es' ? SOLUTIONS_ES : SOLUTIONS_EN;
  const currentSolution = solutions.find(s => s.id === activeTab) || solutions[0];

  const ui = {
    en: {
      eyebrow: 'TAILORED COMMERCE ARCHITECTURE',
      title: 'Tailored solutions for modern social commerce',
      subtitle: 'Explore industry-specific automation built to turn customer chats into verified sales, eliminate moderator bottlenecks, and accelerate growth.',
      readyBadge: '⚡ Configured for immediate rollout',
      capabilitiesTitle: 'Core Capabilities Included:',
      bookBtn: `Book a Demo for ${currentSolution.badge}`,
      trialBtn: 'Start Free Trial',
      platformEyebrow: 'THE PLATFORM FOUNDATION',
      platformTitle: 'Every solution powered by unified AI commerce',
      ctaTitle: 'Ready to deploy an autonomous sales solution?',
      ctaSub: 'Our solutions team will configure a personalized walkthrough using your actual store catalog and Meta channels.',
      ctaBook: 'Schedule Live Demo',
      ctaTalk: 'Talk to Solutions Engineer'
    },
    bn: {
      eyebrow: 'কাস্টমাইজড কমার্স আর্কিটেকচার',
      title: 'আধুনিক সোশ্যাল কমার্সের জন্য বিশেষায়িত সমাধান',
      subtitle: 'কাস্টমার চ্যাটকে নিশ্চিত বিক্রয়ে রূপান্তর করতে, বিলম্বিত রিপ্লাই দূর করতে এবং দ্রুত প্রবৃদ্ধির জন্য তৈরি বিশেষ এআই সমাধানগুলো জানুন।',
      readyBadge: '⚡ তাৎক্ষণিক সেটআপের জন্য প্রস্তুত',
      capabilitiesTitle: 'মূল যে যে সুবিধাগুলো অন্তর্ভুক্ত:',
      bookBtn: `${currentSolution.badge}-এর জন্য ডেমো বুক করুন`,
      trialBtn: 'ফ্রি ট্রায়াল শুরু করুন',
      platformEyebrow: 'প্ল্যাটফর্মের মূল ভিত্তি',
      platformTitle: 'একীভূত এআই কমার্স প্রযুক্তির শক্তিতে প্রতিটি সমাধান',
      ctaTitle: 'স্বয়ংক্রিয় সেলস সল্যুশন চালু করতে প্রস্তুত?',
      ctaSub: 'আমাদের টিম আপনার নিজস্ব ক্যাটালগ ও সোশ্যাল চ্যানেলের ওপর একটি পার্সোনালাইজড লাইভ ডেমো পরিচালনা করবে।',
      ctaBook: 'লাইভ ডেমো শিডিউল করুন',
      ctaTalk: 'ইঞ্জিনিয়ারিং টিমের সাথে কথা বলুন'
    },
    es: {
      eyebrow: 'ARQUITECTURA DE COMERCIO A MEDIDA',
      title: 'Soluciones a medida para el comercio social moderno',
      subtitle: 'Explora automatizaciones creadas para convertir chats en ventas confirmadas, eliminar demoras de atención y acelerar el crecimiento.',
      readyBadge: '⚡ Configurado para despliegue inmediato',
      capabilitiesTitle: 'Capacidades Clave Incluidas:',
      bookBtn: `Agendar Demo para ${currentSolution.badge}`,
      trialBtn: 'Comenzar Prueba Gratuita',
      platformEyebrow: 'EL FUNDAMENTO DE LA PLATAFORMA',
      platformTitle: 'Cada solución respaldada por comercio unificado con IA',
      ctaTitle: '¿Listo para implementar una solución de ventas autónoma?',
      ctaSub: 'Nuestro equipo de soluciones configurará una demostración personalizada con tu catálogo y canales de Meta reales.',
      ctaBook: 'Agendar Demostración en Vivo',
      ctaTalk: 'Hablar con Ingeniero de Soluciones'
    }
  };

  const t = ui[currentLang] || ui.en;

  const pillars = [
    {
      icon: ShoppingBag,
      title: currentLang === 'bn' ? 'স্বয়ংক্রিয় ইন-চ্যাট বিক্রয়' : currentLang === 'es' ? 'Ventas Autónomas en el Chat' : 'Autonomous In-Chat Sales',
      desc: currentLang === 'bn' ? 'হোয়াটসঅ্যাপ ও ইনস্টাগ্রামের ভেতর ক্যাটালগ নির্বাচন, সাইজ ও অর্ডার নিশ্চিতকরণ সম্পন্ন করে।' : currentLang === 'es' ? 'Guía a clientes en selección de productos, tallas y checkout en WhatsApp e Instagram.' : 'Guides customers through catalog selection, sizing, and order confirmation inside WhatsApp and Instagram.'
    },
    {
      icon: Zap,
      title: currentLang === 'bn' ? 'সাব-সেকেন্ড দ্রুত উত্তর' : currentLang === 'es' ? 'Respuestas en Milisegundos' : 'Sub-Second Reply Latency',
      desc: currentLang === 'bn' ? 'সমস্ত মেটা চ্যানেলে ১.২ সেকেন্ডে উত্তর দেয়, ফলে দেরিতে রিপ্লাইয়ের জন্য কোনো সেল মিস হয় না।' : currentLang === 'es' ? 'Responde en 1.2 segundos en todos los canales oficiales de Meta sin perder compradores.' : 'Replies in 1.2 seconds across all Meta channels, eliminating lost sales from delayed replies.'
    },
    {
      icon: Bot,
      title: currentLang === 'bn' ? 'সাবলীল বহুভাষিক এআই' : currentLang === 'es' ? 'IA Multilingüe Nativa' : 'Native Multilingual AI',
      desc: currentLang === 'bn' ? 'বাংলা, বাংলিশ, ইংরেজি ও স্প্যানিশ ভয়েস নোট ও টেক্সট মেসেজে দারুণ সাবলীল।' : currentLang === 'es' ? 'Fluido en español, inglés, bengalí y notas de voz con total naturalidad.' : 'Fluent in Bangla, Banglish, Spanish, and English voice notes and text messages.'
    },
    {
      icon: TrendingUp,
      title: currentLang === 'bn' ? 'কুরিয়ার ও স্টক সিঙ্ক' : currentLang === 'es' ? 'Sincronización de Envíos y Stock' : 'Couriers & Stock Sync',
      desc: currentLang === 'bn' ? 'তাৎক্ষণিক পার্সেল ট্র্যাকিং লিংকের জন্য কুরিয়ারের সাথে সরাসরি সংযুক্ত।' : currentLang === 'es' ? 'Conexión directa con paqueterías y stock en tiempo real para generar guías inmediatas.' : 'Connects directly with couriers and warehouse stock for immediate tracking generation.'
    },
    {
      icon: ShieldCheck,
      title: currentLang === 'bn' ? 'এন্টারপ্রাইজ নিরাপত্তা নীতি' : currentLang === 'es' ? 'Límites Empresariales Seguros' : 'Enterprise Guardrails',
      desc: currentLang === 'bn' ? 'সঠিক মূল্যের নিশ্চয়তা দেয় এবং অননুমোদিত ডিসকাউন্ট বা ভুল তথ্য দেওয়া রোধ করে।' : currentLang === 'es' ? 'Estricta concordancia de precios y políticas para evitar descuentos no autorizados.' : 'Strict price grounding and confidence thresholds prevent hallucinations and unauthorized discounts.'
    },
    {
      icon: Users,
      title: currentLang === 'bn' ? '১-ক্লিকে টিম হ্যান্ডঅফ' : currentLang === 'es' ? 'Copiloto de Equipo en 1 Clic' : '1-Click Team Copilot',
      desc: currentLang === 'bn' ? 'যেকোনো সময় সম্পূর্ণ চ্যাট হিস্ট্রিসহ আপনার কর্মীরা সহজেই চ্যাটের দায়িত্ব নিতে পারেন।' : currentLang === 'es' ? 'Los asesores humanos pueden intervenir en cualquier momento con todo el historial.' : 'Human moderators can step in anytime with complete chat history and AI draft suggestions.'
    }
  ];

  return (
    <div className="solutions-page-wrapper" style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {t.eyebrow}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {t.title}
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Industry Pill Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', overflowX: 'auto', padding: '4px' }}>
          <div className="capsule-filter-group" style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
            {solutions.map(sol => (
              <button
                key={sol.id}
                type="button"
                onClick={() => setActiveTab(sol.id)}
                className={`capsule-filter-btn ${activeTab === sol.id ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {sol.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Solution Showcase Card */}
        <div className="solution-showcase-box" style={{
          background: 'rgba(18, 24, 38, 0.72)',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 8px 30px rgba(9, 42, 32, 0.05)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span className="badge badge-mint" style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}>
              {currentSolution.badge}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t.readyBadge}
            </span>
          </div>

          <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.2 }}>
            {currentSolution.title}
          </h2>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px', marginBottom: '2rem' }}>
            {currentSolution.description}
          </p>

          {/* Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
            padding: '1.5rem',
            background: 'var(--mint-soft)',
            borderRadius: '16px',
            border: '1px solid rgba(15, 169, 104, 0.2)'
          }}>
            {currentSolution.stats.map((st, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary-dark)', fontFamily: 'var(--font-heading)' }}>
                  {st.value}
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '0.25rem' }}>
                  {st.label}
                </div>
              </div>
            ))}
          </div>

          {/* Key Deliverables Grid */}
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {t.capabilitiesTitle}
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            marginBottom: '2.5rem'
          }}>
            {currentSolution.highlights.map((h, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: 'rgba(18, 24, 38, 0.72)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1rem'
              }}>
                <CheckCircle2 size={18} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 550, lineHeight: 1.5 }}>
                  {h}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button variant="primary" size="lg" onClick={() => onNavigate('book-demo')} style={{ borderRadius: '999px' }}>
              <span>{t.bookBtn}</span>
              <ArrowRight size={17} />
            </Button>
            <Button variant="secondary" size="lg" onClick={() => onNavigate('signup')} style={{ borderRadius: '999px' }}>
              <span>{t.trialBtn}</span>
            </Button>
          </div>
        </div>

        {/* 6 Architectural Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.5rem' }}>
            {t.platformEyebrow}
          </span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            {t.platformTitle}
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '4rem'
        }}>
          {pillars.map((col, idx) => {
            const Icon = col.icon;
            return (
              <div key={idx} style={{
                background: 'rgba(18, 24, 38, 0.72)',
                border: '1.5px solid var(--border)',
                borderRadius: '18px',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(9, 42, 32, 0.04)',
                transition: 'transform 0.2s ease, border-color 0.2s ease'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'var(--mint-soft)',
                  border: '1px solid rgba(15, 169, 104, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-dark)',
                  marginBottom: '1rem'
                }}>
                  <Icon size={20} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {col.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {col.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Final CTA Banner */}
        <div style={{
          background: 'var(--primary-dark)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          color: '#FFFFFF',
          border: '1.5px solid rgba(15, 169, 104, 0.3)',
          boxShadow: '0 20px 50px rgba(9, 42, 32, 0.2)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            {t.ctaTitle}
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.975rem', lineHeight: 1.6 }}>
            {t.ctaSub}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('book-demo')}
              style={{ background: 'var(--green)', borderColor: 'var(--green)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>{t.ctaBook}</span>
              <ArrowRight size={17} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('contact')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>{t.ctaTalk}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
