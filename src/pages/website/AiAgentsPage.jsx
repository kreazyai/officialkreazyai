import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Headphones,
  Target,
  Languages,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  MessageSquare,
  ShoppingBag,
  Send,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const AGENTS_DATA = {
  en: [
    {
      id: 'sales',
      name: 'Autonomous Sales Agent',
      role: 'Lead Ingestion & In-Chat Commerce',
      tag: 'Revenue Driver',
      speed: '1.2s avg reply',
      description: 'Understands customer style, sizing preferences, and budget to recommend the exact right product, calculate totals, and complete in-chat checkout.',
      capabilities: [
        'Checks live inventory and SKU availability before recommending products',
        'Calculates accurate order totals including shipping fees by location',
        'Captures and verifies customer name, phone number, and delivery address',
        'Enforces maximum discount rules to protect merchant profit margins'
      ],
      sampleSnippet: 'Recommends matching apparel & creates confirmed order in under 2 minutes'
    },
    {
      id: 'support',
      name: '24/7 Customer Support Agent',
      role: 'Instant Resolution & Policy Concierge',
      tag: 'Customer Success',
      speed: '98% First-Contact SLA',
      description: 'Answers repetitive customer inquiries instantly—delivery timelines, tracking statuses, exchange rules, and store locations without human delay.',
      capabilities: [
        'Grounded strictly on your uploaded store policies, FAQ, and shipping rules',
        'Provides live courier tracking updates (Steadfast, Pathao, RedX)',
        'Understands customer sentiment and prioritizes urgent complaints',
        'Maintains full conversation history across multiple messaging sessions'
      ],
      sampleSnippet: 'Answers delivery fees, parcel locations & policy questions with zero lag'
    },
    {
      id: 'qualifier',
      name: 'Lead Qualification Agent',
      role: 'High-Intent Customer Scoring',
      tag: 'Pipeline Builder',
      speed: 'Real-Time CRM Sync',
      description: 'Separates window shoppers from ready-to-buy customers, scoring purchase urgency and pushing qualified buyer data directly to your CRM.',
      capabilities: [
        'Extracts buyer timeline, order quantity, and preferred payment methods',
        'Scores leads (Hot, Warm, Low) based on conversational engagement depth',
        'Automatically logs customer records into your CRM and Google Sheets',
        'Triggers automated re-engagement reminders if a customer drops off'
      ],
      sampleSnippet: 'Filters high-intent buyers and syncs contact details automatically'
    },
    {
      id: 'multilingual',
      name: 'Multilingual & Voice Agent',
      role: 'Bangla, Banglish & English Processing',
      tag: 'Localized Engine',
      speed: 'Voice & Text',
      description: 'Engineered specifically for South Asian retail communication. Listens to customer voice messages and parses conversational Banglish seamlessly.',
      capabilities: [
        'Transcribes customer audio voice notes in Bangla and English in seconds',
        'Flawlessly understands romanized Banglish spelling variations',
        'Adapts tone of voice to match your brand (casual, professional, luxury)',
        'Switches languages mid-conversation based on customer preference'
      ],
      sampleSnippet: 'Understands customer voice notes and conversational Banglish naturally'
    },
    {
      id: 'vision',
      name: 'Visual Catalog Agent',
      role: 'Screenshot & Photo Recognition',
      tag: 'Computer Vision',
      speed: 'Instant Match',
      description: 'Customers frequently send screenshots of products from your social media posts. The Vision Agent recognizes the SKU, price, and variant instantly.',
      capabilities: [
        'Matches uploaded product screenshots against your live product catalog',
        'Extracts transaction ID and amount from bank and mobile payment slips',
        'Recognizes fabric color variations and apparel patterns from buyer photos',
        'Confirms order matching without requiring product link copy-pasting'
      ],
      sampleSnippet: 'Identifies products from customer photo uploads and payment receipts'
    },
    {
      id: 'moderator',
      name: 'Supervisor & Safety Copilot',
      role: 'Human In-the-Loop Orchestration',
      tag: 'Enterprise Safety',
      speed: '1-Click Takeover',
      description: 'Monitors ongoing conversations with strict confidence thresholds. Flags complex negotiations or negative sentiment for instant moderator takeover.',
      capabilities: [
        'Zero-hallucination safeguard: refuses to invent unverified prices or phantom stock',
        '1-click human agent takeover with comprehensive context brief',
        'Generates suggested AI responses that human staff can approve or edit',
        'Comprehensive audit logs of all bot and human interactions'
      ],
      sampleSnippet: 'Escalates sensitive inquiries to human moderators with draft replies'
    }
  ],

  bn: [
    {
      id: 'sales',
      name: 'স্বয়ংক্রিয় বিক্রয় এজেন্ট',
      role: 'লিড সংগ্রহ ও ইন-চ্যাট বিক্রয়',
      tag: 'আয়ের মূল চালিকাশক্তি',
      speed: '১.২ সেকেন্ডে গড় উত্তর',
      description: 'গ্রাহকের পছন্দ, সাইজ এবং বাজেট বুঝে সঠিক পণ্য সুপারিশ করে, মোট মূল্য হিসাব করে এবং ইন-চ্যাটেই অর্ডার সম্পন্ন করে।',
      capabilities: [
        'পণ্য রিকমেন্ড করার আগে লাইভ ইনভেন্টরি ও এসকেইউ স্টক যাচাই করে',
        'গ্রাহকের এলাকা ও লোকেশন অনুযায়ী সঠিক ডেলিভারি চার্জসহ মোট বিল নির্ধারণ করে',
        'গ্রাহকের নাম, ফোন নম্বর ও পূর্ণাঙ্গ ডেলিভারি ঠিকানা নির্ভুলভাবে সংগ্রহ করে',
        'ব্যবসার প্রফিট মার্জিন বাঁচাতে অনুমোদিত সর্বোচ্চ ডিসকাউন্ট সীমা নিয়ন্ত্রণ করে'
      ],
      sampleSnippet: 'ম্যাচিং ড্রেস রিকমেন্ড করে ২ মিনিটের মধ্যে কনফার্মড অর্ডার তৈরি করে'
    },
    {
      id: 'support',
      name: '২৪/৭ কাস্টমার সাপোর্ট এজেন্ট',
      role: 'তাৎক্ষণিক সমাধান ও পলিসি কনসিয়ার্জ',
      tag: 'গ্রাহক সন্তুষ্টি',
      speed: '৯৮% প্রথম স্পর্শে সমাধান',
      description: 'বারবার আসা গ্রাহক প্রশ্নের উত্তর তাৎক্ষণিক দেয়—ডেলিভারি সময়সীমা, ট্র্যাকিং স্ট্যাটাস, এক্সচেঞ্জ পলিসি ও শোরুমের লোকেশন কোনো বিলম্ব ছাড়াই।',
      capabilities: [
        'আপনার আপলোড করা স্টোর পলিসি, প্রশ্নোত্তর ও ডেলিভারি নিয়মে কঠোরভাবে সীমাবদ্ধ',
        'কুরিয়ার লাইভ পার্সেল ট্র্যাকিং আপডেট প্রদান করে (Steadfast, Pathao, RedX)',
        'গ্রাহকের মনোভাব বুঝে জরুরি অভিযোগ দ্রুত চিহ্নিত ও অগ্রাধিকার দেয়',
        'একাধিক সেশনের কথোপকথনের সম্পূর্ণ ইতিহাস সংরক্ষণ করে'
      ],
      sampleSnippet: 'ডেলিভারি চার্জ, পার্সেল লোকেশন ও পলিসি প্রশ্নের তাৎক্ষণিক সঠিক উত্তর দেয়'
    },
    {
      id: 'qualifier',
      name: 'লিড কোয়ালিফিকেশন এজেন্ট',
      role: 'উচ্চ আগ্রহের গ্রাহক স্কোরিং',
      tag: 'পাইপলাইন নির্মাতা',
      speed: 'রিয়েল-টাইম CRM সিঙ্ক',
      description: 'সাধারণ দর্শক ও প্রকৃত ক্রেতাকে আলাদা করে, কেনার তাগিদ মূল্যায়ন করে এবং যোগ্য ক্রেতার তথ্য সরাসরি আপনার CRM-এ পাঠায়।',
      capabilities: [
        'ক্রেতার ক্রয়ের সময়সীমা, অর্ডারের পরিমাণ ও পছন্দের পেমেন্ট পদ্ধতি বের করে',
        'কথোপকথনের গভীরতার ভিত্তিতে লিড স্কোর (হট, ওয়ার্ম, লো) নির্ধারণ করে',
        'স্বয়ংক্রিয়ভাবে কাস্টমার রেকর্ড আপনার সিআরএম ও গুগল শিটে সেভ করে',
        'গ্রাহক উত্তর না দিলে রিমাইন্ডার পাঠানোর স্বয়ংক্রিয় ট্রিগার চালু করে'
      ],
      sampleSnippet: 'উচ্চ আগ্রহী ক্রেতাদের ফিল্টার করে ও কন্টাক্ট ডিটেইলস স্বয়ংক্রিয়ভাবে সিঙ্ক করে'
    },
    {
      id: 'multilingual',
      name: 'বহুভাষিক ও ভয়েস এজেন্ট',
      role: 'বাংলা, বাংলিশ ও ইংরেজি প্রসেসিং',
      tag: 'স্থানীয় ভাষার ইঞ্জিন',
      speed: 'ভয়েস ও টেক্সট',
      description: 'বিশেষভাবে স্থানীয় ও আন্তর্জাতিক যোগাযোগের জন্য তৈরি। গ্রাহকের পাঠানো অডিও ভয়েস মেসেজ শুনে এবং সাধারণ কথ্য বাংলিশ নিখুঁতভাবে বোঝে।',
      capabilities: [
        'বাংলা ও ইংরেজিতে পাঠানো অডিও ভয়েস নোট কয়েক সেকেন্ডে টেক্সটে রূপান্তর করে',
        'রোমান অক্ষরে লেখা বিভিন্ন বাংলিশ বানানের রূপ সঠিকভাবে অনুধাবন করে',
        'আপনার ব্র্যান্ডের সাথে সামঞ্জস্য রেখে টোন পরিবর্তন করে (ক্যাজুয়াল বা ফর্মাল)',
        'গ্রাহকের পছন্দের ওপর ভিত্তি করে কথোপকথনের মাঝেই ভাষা পরিবর্তন করে'
      ],
      sampleSnippet: 'গ্রাহকের অডিও ভয়েস নোট ও স্বাভাবিক বাংলিশ বাক্য সাবলীলভাবে বোঝে'
    },
    {
      id: 'vision',
      name: 'ভিজ্যুয়াল ক্যাটালগ এজেন্ট',
      role: 'স্ক্রিনশট ও ছবি শনাক্তকরণ',
      tag: 'কম্পিউটার ভিশন',
      speed: 'তাৎক্ষণিক ম্যাচ',
      description: 'সোশ্যাল মিডিয়া পোস্ট থেকে তোলা প্রোডাক্টের স্ক্রিনশট গ্রাহকরা পাঠালে ভিশন এজেন্ট তাৎক্ষণিক SKU, দাম ও ভেরিয়েন্ট শনাক্ত করে।',
      capabilities: [
        'গ্রাহকের পাঠানো ছবির সাথে আপনার লাইভ প্রোডাক্ট ক্যাটালগের মিল খুঁজে বের করে',
        'ব্যাংক ও মোবাইল পেমেন্ট স্লিপ থেকে ট্রানজেকশন আইডি ও টাকার পরিমাণ রিড করে',
        'ক্রেতার ছবি থেকে কাপড়ের রঙ ও প্যাটার্নের ভিন্নতা শনাক্ত করে',
        'পণ্য লিংক কপি করার ঝামেলা ছাড়াই ইন-চ্যাটে অর্ডার ম্যাচ কনফার্ম করে'
      ],
      sampleSnippet: 'ছবি ও পেমেন্ট রসিদ দেখে সাথে সাথে পণ্য ও লেনদেন শনাক্ত করে'
    },
    {
      id: 'moderator',
      name: 'সুপারভাইজার ও সুরক্ষা কোপাইলট',
      role: 'হিউম্যান-ইন-দ্য-লুপ পরিচালনা',
      tag: 'এন্টারপ্রাইজ নিরাপত্তা',
      speed: '১-ক্লিকে টেকওভার',
      description: 'উচ্চ কনফিডেন্স স্কোরে কথোপকথন নজরদারি করে। জটিল দরকষাকষি বা নেতিবাচক মনোভাব দেখলে মানব অপারেটরের হাতে দেওয়ার নোটিফিকেশন পাঠায়।',
      capabilities: [
        'জিরো-হ্যালোসিনেশন সুরক্ষা: মনগড়া দাম বা ভুয়া স্টক তৈরি কঠোরভাবে নিষিদ্ধ',
        'সম্পূর্ণ পূর্ববর্তী ইতিহাসসহ ১-ক্লিকে মানুষের কথোপকথন নিজের হাতে নেওয়ার সুবিধা',
        'প্রস্তাবিত এআই উত্তরের খসড়া তৈরি করে যা মানব কর্মী অনুমোদন বা এডিট করতে পারে',
        'বট ও হিউম্যানের সকল ইন্টারঅ্যাকশনের পূর্ণাঙ্গ অডিট লগ সংরক্ষণ'
      ],
      sampleSnippet: 'সংবেদনশীল জিজ্ঞাসা খসড়া উত্তরসহ সরাসরি মানব মডারেটরের কাছে পাঠায়'
    }
  ],

  es: [
    {
      id: 'sales',
      name: 'Agente de Ventas Autónomo',
      role: 'Captación de Prospectos y Comercio en Chat',
      tag: 'Motor de Ingresos',
      speed: '1.2s respuesta prom.',
      description: 'Comprende el estilo, preferencias de talla y presupuesto del cliente para recomendar el producto exacto, calcular totales y completar la compra en chat.',
      capabilities: [
        'Verifica inventario en vivo y disponibilidad de SKU antes de recomendar productos',
        'Calcula totales exactos de pedido incluyendo costos de envío según ubicación',
        'Captura y verifica nombre, número de teléfono y dirección de entrega del cliente',
        'Aplica reglas de descuento máximo para proteger los márgenes del comercio'
      ],
      sampleSnippet: 'Recomienda prendas combinables y genera pedido confirmado en menos de 2 minutos'
    },
    {
      id: 'support',
      name: 'Agente de Soporte al Cliente 24/7',
      role: 'Resolución Inmediata y Conserje de Políticas',
      tag: 'Éxito del Cliente',
      speed: '98% SLA Primer Contacto',
      description: 'Responde consultas repetitivas de clientes al instante: tiempos de entrega, estados de seguimiento, políticas de cambio y ubicaciones sin demoras.',
      capabilities: [
        'Basado estrictamente en las políticas de tienda, FAQ y reglas de envío subidas',
        'Proporciona actualizaciones de seguimiento en tiempo real de empresas de paquetería',
        'Detecta el tono del cliente y prioriza reclamaciones urgentes',
        'Mantiene el historial completo de conversación a través de múltiples sesiones'
      ],
      sampleSnippet: 'Responde costos de envío, ubicación de paquetes y políticas sin demoras'
    },
    {
      id: 'qualifier',
      name: 'Agente de Calificación de Prospectos',
      role: 'Puntuación de Clientes de Alta Intención',
      tag: 'Constructor de Pipeline',
      speed: 'Sincronización CRM en Vivo',
      description: 'Separa a los curiosos de los compradores decididos, evaluando la urgencia de compra y enviando datos calificados directamente a su CRM.',
      capabilities: [
        'Extrae tiempos de compra, volumen de pedido y métodos de pago preferidos',
        'Clasifica prospectos (Caliente, Tibio, Bajo) según profundidad de interacción',
        'Registra automáticamente perfiles en su CRM y hojas de cálculo',
        'Activa recordatorios automáticos de reactivación si un cliente abandona'
      ],
      sampleSnippet: 'Filtra compradores decididos y sincroniza datos de contacto automáticamente'
    },
    {
      id: 'multilingual',
      name: 'Agente Multilingüe y de Voz',
      role: 'Procesamiento de Voz y Múltiples Idiomas',
      tag: 'Motor Localizado',
      speed: 'Voz y Texto',
      description: 'Diseñado para comercio global y local. Escucha notas de voz de clientes y procesa variaciones coloquiales y de dialecto sin interrupciones.',
      capabilities: [
        'Transcribe notas de voz enviadas por clientes en segundos',
        'Comprende con precisión variaciones ortográficas y términos informales',
        'Adapta el tono de voz a su marca (casual, profesional, de lujo)',
        'Cambia de idioma en mitad de la conversación según la preferencia del cliente'
      ],
      sampleSnippet: 'Entiende notas de voz y expresiones informales de forma natural'
    },
    {
      id: 'vision',
      name: 'Agente de Catálogo Visual',
      role: 'Reconocimiento de Fotos y Capturas',
      tag: 'Visión Computarizada',
      speed: 'Coincidencia Instantánea',
      description: 'Los clientes suelen enviar capturas de pantalla de sus publicaciones en redes. El Agente Visual reconoce el SKU, precio y variante al instante.',
      capabilities: [
        'Compara capturas de pantalla subidas con su catálogo de productos activo',
        'Extrae números de referencia y montos de comprobantes bancarios y de pago',
        'Reconoce variaciones de color y patrones textiles de fotos del cliente',
        'Confirma el producto del pedido sin requerir enlaces compartidos'
      ],
      sampleSnippet: 'Identifica productos desde fotos del cliente y recibos de pago al instante'
    },
    {
      id: 'moderator',
      name: 'Copiloto de Supervisión y Seguridad',
      role: 'Orquestación Humano-en-el-Bucle',
      tag: 'Seguridad Empresarial',
      speed: 'Toma de Control en 1 Clic',
      description: 'Supervisa conversaciones con estrictos umbrales de confianza. Alerta sobre negociaciones complejas o quejas para intervención humana inmediata.',
      capabilities: [
        'Protección cero alucinaciones: rechaza inventar precios o existencias fantasma',
        'Toma de control humano en 1 clic con resumen de contexto completo',
        'Genera borradores de respuesta que el personal puede aprobar o editar',
        'Registros de auditoría completos de todas las interacciones del bot y humanos'
      ],
      sampleSnippet: 'Deriva consultas delicadas a moderadores humanos con borradores listos'
    }
  ]
};

const UI_TEXT = {
  en: {
    badge: 'SPECIALIZED WORKFORCE',
    title: 'Meet your autonomous AI workforce',
    subtitle: 'Specialized autonomous agents trained to sell, recommend, qualify leads, and support customers across WhatsApp, Instagram, and Messenger — 24/7.',
    capabilitiesLabel: 'Capabilities:',
    simBadge: 'LIVE AGENT SIMULATION',
    simTitlePrefix: 'See how the ',
    simTitleSuffix: ' conducts business',
    simSubtitle: 'Real multi-turn conversation simulation handling customer inquiries, verifying inventory, and confirming orders in real time.',
    channelTag: 'WhatsApp Business',
    onlineStatus: 'Online • Meta Cloud Verified',
    botHeader: 'KREAZY AI Assistant',
    sampleCust1: 'Hi, do you have this in Black, size M? And what is the delivery charge?',
    sampleBot1: 'Yes! Black in size M is currently available in live stock ($24 / ৳1,450). Delivery within city takes 24-48 hours. Can you share your name, phone number, and delivery address to confirm the order?',
    sampleCust2: 'Please confirm my order. Name: Tanvir Ahmed, Phone: +1 415-555-0192, Address: 120 Market St, Suite 400, Banani.',
    orderConfirmedTag: 'ORDER CONFIRMED #KZ-9941',
    orderItem: 'Minimalist Black T-Shirt (Size: M) • ৳1,450',
    orderDelivery: 'Banani • Standard Express',
    orderTotal: '৳1,520 (Cash on Delivery)',
    orderSynced: 'Synced to CRM & Courier Dispatch',
    repliedSpeed: '10:14 AM • Replied in 1.1s',
    guardrailsTitle: 'Built with zero-hallucination retail safety',
    guardrailsSubtitle: 'Your brand reputation is protected with multi-layered guardrails and instant human oversight.',
    g1Title: 'Strict Catalog Grounding',
    g1Desc: 'Agents only quote verified prices and items present in your live store database.',
    g2Title: 'Discount Thresholds',
    g2Desc: 'Hard caps prevent unauthorized bargaining and protect your product margins.',
    g3Title: 'Instant Human Takeover',
    g3Desc: 'Moderators can intervene at any moment with full chat summary and suggested replies.',
    ctaTitle: 'Deploy custom AI agents for your business',
    ctaSubtitle: 'Connect your Meta channels and let our engineering team calibrate your store agents in under 24 hours.',
    btnDemo: 'Book a Demo',
    btnTrial: 'Start Free Trial'
  },
  bn: {
    badge: 'বিশেষজ্ঞ এআই কর্মীদল',
    title: 'আপনার ব্যবসার স্বয়ংক্রিয় এআই কর্মীবাহিনী',
    subtitle: 'হোয়াটসঅ্যাপ, ইনস্টাগ্রাম এবং মেসেঞ্জারে ২৪/৭ বিক্রি, পণ্য রিকমেন্ড, লিড যাচাই ও কাস্টমার সাপোর্টের জন্য প্রশিক্ষিত স্পেশালাইজড এআই এজেন্ট।',
    capabilitiesLabel: 'প্রধান সক্ষমতা:',
    simBadge: 'লাইভ এজেন্ট সিমুলেশন',
    simTitlePrefix: '',
    simTitleSuffix: ' কীভাবে কাজ পরিচালনা করে দেখুন',
    simSubtitle: 'গ্রাহকের জিজ্ঞাসা পরিচালনা, ইনভেন্টরি যাচাই এবং তাৎক্ষণিক অর্ডার নিশ্চিতকরণের বাস্তব কথোপকথন সিমুলেশন।',
    channelTag: 'হোয়াটসঅ্যাপ বিজনেস',
    onlineStatus: 'অনলাইন • মেটা ক্লাউড ভেরিফাইড',
    botHeader: 'ক্রেজি এআই অ্যাসিস্ট্যান্ট',
    sampleCust1: 'আপু এইটা কি ব্ল্যাক কালার M সাইজ হবে? আর ডেলিভারি চার্জ কত?',
    sampleBot1: 'জি! ব্ল্যাক কালার সাইজ M এখন লাইভ স্টকে এভেইলেবল আছে (৳১,৪৫০)। ঢাকা সিটিতে ডেলিভারি চার্জ ৳৭০, ২৪-৪৮ ঘণ্টার মধ্যে পাবেন। আপনার অর্ডার কনফার্ম করতে নাম, ঠিকানা ও ফোন নম্বর দিন।',
    sampleCust2: 'অর্ডার কনফার্ম করে দেন। নাম: তানভীর আহমেদ, ফোন: ০১৭১২৩৪৫৬৭৮, ঠিকানা: বাসা ১২, রোড ৫, বনানী, ঢাকা।',
    orderConfirmedTag: 'অর্ডার কনফার্মড #KZ-9941',
    orderItem: 'মিনিমালিস্ট ব্ল্যাক টি-শার্ট (সাইজ: M) • ৳১,৪৫০',
    orderDelivery: 'বনানী, ঢাকা • স্ট্যান্ডার্ড এক্সপ্রেস (৳৭০)',
    orderTotal: '৳১,৫২০ (ক্যাশ অন ডেলিভারি)',
    orderSynced: 'সিআরএম ও কুরিয়ার ডিসপ্যাচে সংরক্ষিত হয়েছে',
    repliedSpeed: '১০:১৪ AM • ১.১ সেকেন্ডে উত্তর প্রদান',
    guardrailsTitle: 'জিরো-হ্যালোসিনেশন বাণিজ্যিক সুরক্ষা ব্যবস্থা',
    guardrailsSubtitle: 'বহুস্তরীয় সুরক্ষা ও তাত্ক্ষণিক মানব তত্ত্বাবধানের মাধ্যমে আপনার ব্র্যান্ডের সুনাম সম্পূর্ণ সুরক্ষিত থাকে।',
    g1Title: 'কঠোর ক্যাটালগ গ্রাউন্ডিং',
    g1Desc: 'এজেন্টরা শুধুমাত্র আপনার লাইভ ডাটাবেসে থাকা যাচাইকৃত মূল্য ও পণ্য উদ্ধৃত করে।',
    g2Title: 'ডিসকাউন্ট সুরক্ষা সীমা',
    g2Desc: 'অননুমোদিত দরকষাকষি প্রতিরোধ করে ব্যবসার প্রফিট মার্জিন সুরক্ষিত রাখে।',
    g3Title: 'এক ক্লিকে মানুষের নিয়ন্ত্রণ',
    g3Desc: 'সম্পূর্ণ চ্যাট সামারি এবং প্রস্তাবিত উত্তরসহ যেকোনো মুহূর্তে টিম সদস্য চ্যাটে অংশ নিতে পারে।',
    ctaTitle: 'আপনার ব্যবসার জন্য কাস্টম এআই এজেন্ট নিযুক্ত করুন',
    ctaSubtitle: 'আপনার মেটা চ্যানেলগুলো সংযুক্ত করুন এবং ২৪ ঘণ্টার মধ্যে আমাদের টিম আপনার স্টোরের এআই এজেন্ট কনফিগার করে দেবে।',
    btnDemo: 'ডেমো বুক করুন',
    btnTrial: 'ফ্রি ট্রায়াল শুরু করুন'
  },
  es: {
    badge: 'FUERZA LABORAL ESPECIALIZADA',
    title: 'Conozca a su equipo autónomo de IA',
    subtitle: 'Agentes autónomos especializados y capacitados para vender, recomendar, calificar prospectos y atender clientes en WhatsApp, Instagram y Messenger — 24/7.',
    capabilitiesLabel: 'Capacidades:',
    simBadge: 'SIMULACIÓN DE AGENTE EN VIVO',
    simTitlePrefix: 'Vea cómo opera el ',
    simTitleSuffix: '',
    simSubtitle: 'Simulación de conversación multi-turno real gestionando consultas de clientes, verificando inventario y confirmando pedidos en tiempo real.',
    channelTag: 'WhatsApp Business',
    onlineStatus: 'En Línea • Verificado por Meta Cloud',
    botHeader: 'Asistente KREAZY AI',
    sampleCust1: '¿Hola, tienen este modelo en negro talla M? ¿Y cuál es el costo de envío?',
    sampleBot1: '¡Sí! El color negro en talla M está disponible en stock ($24 / ৳1,450). El envío llega en 24-48 hrs. ¿Deseas confirmar tu pedido con tu nombre, dirección y teléfono?',
    sampleCust2: '¡Confirmar pedido! Nombre: Carlos Mendoza, Teléfono: +34 612 345 678, Dirección: Calle Mayor 14, 2B, Madrid.',
    orderConfirmedTag: 'PEDIDO CONFIRMADO #KZ-9941',
    orderItem: 'Camiseta Negra Minimalista (Talla: M) • ৳1,450',
    orderDelivery: 'Madrid • Envío Express',
    orderTotal: '৳1,520 (Pago Contra Entrega)',
    orderSynced: 'Sincronizado con CRM y Despacho de Paquetería',
    repliedSpeed: '10:14 AM • Respondido en 1.1s',
    guardrailsTitle: 'Diseñado con seguridad comercial sin alucinaciones',
    guardrailsSubtitle: 'La reputación de su marca está protegida con defensas multicapa y supervisión humana instantánea.',
    g1Title: 'Anclaje Estricto al Catálogo',
    g1Desc: 'Los agentes solo cotizan precios e inventarios verificados de su base de datos activa.',
    g2Title: 'Límites de Descuento',
    g2Desc: 'Límites estrictos que evitan regateos no autorizados y protegen sus márgenes comerciales.',
    g3Title: 'Toma de Control Humano Inmediata',
    g3Desc: 'Los moderadores pueden intervenir en cualquier momento con resumen completo y respuestas sugeridas.',
    ctaTitle: 'Despliegue agentes de IA personalizados para su empresa',
    ctaSubtitle: 'Conecte sus canales de Meta y deje que nuestro equipo configure sus agentes en menos de 24 horas.',
    btnDemo: 'Reservar Demostración',
    btnTrial: 'Comenzar Prueba Gratuita'
  }
};

export function AiAgentsPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const [selectedAgentId, setSelectedAgentId] = useState('sales');

  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const agents = AGENTS_DATA[langKey] || AGENTS_DATA.en;
  const ui = UI_TEXT[langKey] || UI_TEXT.en;

  const activeAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="ai-agents-page-wrapper" style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {ui.title}
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {ui.subtitle}
          </p>
        </div>

        {/* Agents Grid (All 6 Agents in Clear Box Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {agents.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgentId(agent.id)}
                style={{
                  background: 'rgba(18, 24, 38, 0.72)',
                  border: isSelected ? '2px solid var(--green)' : '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: isSelected ? '0 12px 32px rgba(15, 169, 104, 0.14)' : '0 4px 16px rgba(9, 42, 32, 0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700, background: 'rgba(15, 169, 104, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    {agent.speed}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  {agent.name}
                </h3>
                <div style={{ fontSize: '0.825rem', color: 'var(--green-dark)', fontWeight: 600, marginBottom: '0.75rem' }}>
                  {agent.role}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {agent.description}
                </p>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 750, color: 'var(--primary-dark)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {ui.capabilitiesLabel}
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {agent.capabilities.slice(0, 2).map((cap, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Conversation Simulation Card */}
        <div style={{
          background: 'rgba(18, 24, 38, 0.72)',
          border: '1.5px solid var(--border)',
          borderRadius: '24px',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          boxShadow: '0 12px 40px rgba(9, 42, 32, 0.06)',
          marginBottom: '3.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {ui.simTitlePrefix}{activeAgent.name}{ui.simTitleSuffix}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              {ui.simSubtitle}
            </p>
          </div>

          {/* WhatsApp / Chat Screen Container */}
          <div style={{
            maxWidth: '680px',
            margin: '0 auto',
            background: 'var(--mint-soft)',
            border: '1.5px solid rgba(15, 169, 104, 0.25)',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(9, 42, 32, 0.08)'
          }}>
            {/* Top Bar */}
            <div style={{
              background: 'linear-gradient(135deg, #161D2C 0%, #0F1420 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#FFFFFF',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <Bot size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 750 }}>{ui.botHeader}</div>
                  <div style={{ fontSize: '0.72rem', color: '#AEEBCB' }}>{ui.onlineStatus}</div>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.15)', padding: '3px 8px', borderRadius: '6px' }}>
                {ui.channelTag}
              </span>
            </div>

            {/* Chat Body */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Message 1: Customer */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: 'rgba(18, 24, 38, 0.72)', padding: '0.85rem 1rem', borderRadius: '14px 14px 14px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {ui.sampleCust1}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                  10:14 AM
                </div>
              </div>

              {/* Message 2: AI Agent */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '85%', background: '#E3F8ED', border: '1px solid rgba(15, 169, 104, 0.3)', padding: '0.85rem 1rem', borderRadius: '14px 14px 4px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--primary-dark)', lineHeight: 1.45 }}>
                  {ui.sampleBot1}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--green-dark)', textAlign: 'right', marginTop: '4px' }}>
                  {ui.repliedSpeed}
                </div>
              </div>

              {/* Message 3: Customer */}
              <div style={{ alignSelf: 'flex-start', maxWidth: '82%', background: 'rgba(18, 24, 38, 0.72)', padding: '0.85rem 1rem', borderRadius: '14px 14px 14px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {ui.sampleCust2}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                  10:15 AM
                </div>
              </div>

              {/* Message 4: AI Agent Confirmed Order Card */}
              <div style={{ alignSelf: 'flex-end', maxWidth: '88%', background: 'rgba(18, 24, 38, 0.72)', border: '1.5px solid var(--green)', padding: '1rem', borderRadius: '14px 14px 4px 14px', boxShadow: '0 4px 12px rgba(15, 169, 104, 0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--green)" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--primary-dark)' }}>{ui.orderConfirmedTag}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  <strong>Item:</strong> {ui.orderItem}<br />
                  <strong>Delivery:</strong> {ui.orderDelivery}<br />
                  <strong>Total:</strong> {ui.orderTotal}
                </div>
                <div style={{ fontSize: '0.75rem', background: 'var(--mint-soft)', padding: '6px 10px', borderRadius: '6px', color: 'var(--primary-dark)', fontWeight: 600 }}>
                  {ui.orderSynced}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enterprise Governance & Guardrails Strip */}
        <div style={{
          background: 'var(--mint-soft)',
          border: '1.5px solid rgba(15, 169, 104, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '3.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {ui.guardrailsTitle}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.25rem auto 0 auto' }}>
              {ui.guardrailsSubtitle}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ background: 'rgba(18, 24, 38, 0.72)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {ui.g1Title}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                {ui.g1Desc}
              </p>
            </div>
            <div style={{ background: 'rgba(18, 24, 38, 0.72)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {ui.g2Title}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                {ui.g2Desc}
              </p>
            </div>
            <div style={{ background: 'rgba(18, 24, 38, 0.72)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {ui.g3Title}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                {ui.g3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="final-cta-card" style={{
          background: 'linear-gradient(135deg, rgba(32, 14, 22, 0.94) 0%, rgba(18, 24, 38, 0.98) 100%)',
          border: '1px solid rgba(255, 51, 75, 0.32)',
          borderRadius: '24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 50px rgba(255, 51, 75, 0.12)',
          padding: 'clamp(2.5rem, 5vw, 4rem) 2rem',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.35rem)', fontWeight: 850, letterSpacing: '-0.025em', color: '#FFFFFF', marginBottom: '0.85rem' }}>
            {ui.ctaTitle}
          </h2>
          <p style={{ maxWidth: '620px', margin: '0 auto 2rem auto', color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6 }}>
            {ui.ctaSubtitle}
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
                borderRadius: '12px',
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
              <span>{ui.btnDemo}</span>
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
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
              <span>{ui.btnTrial}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
