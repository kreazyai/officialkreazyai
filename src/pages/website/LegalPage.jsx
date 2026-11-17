import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  Clock, 
  Globe2,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const LEGAL_TEXT = {
  en: {
    heroEyebrow: 'ENTERPRISE GOVERNANCE & TRUST',
    heroTitle: 'KreazyAI Legal & Privacy Center',
    heroSubtitle: 'Complete transparency regarding how KreazyAI protects merchant data, respects customer conversation privacy, and enforces bank-grade security across Meta Cloud APIs.',
    tabPrivacy: 'Privacy Policy',
    tabTerms: 'Terms of Service',
    lastUpdated: 'Last Updated: November 15, 2026',
    effectiveDate: 'Effective Date: January 1, 2026',
    versionBadge: 'Version 2.4.0 — Production',
    
    // Privacy Badges
    badgeGdpr: 'GDPR & CCPA Compliant',
    badgeMeta: 'Official Meta Cloud API',
    badgeAi: 'Zero Foundation Training',
    badgeSecurity: 'AES-256 & TLS 1.3',

    // Quick TOC Labels
    tocLabel: 'Quick Navigation',

    // Privacy Policy Sections
    privacyTitle: 'KreazyAI Master Privacy Policy',
    privacyLead: 'This Privacy Policy details the strict privacy and security standards governing the collection, ingestion, storage, and processing of conversation records, product catalog data, and transaction information processed through KreazyAI conversational AI software.',
    
    p1Head: '1. Introduction & Organizational Scope',
    p1Body: 'KreazyAI ("we", "our", or "us") operates an autonomous conversational commerce platform for retail merchants ("Merchants"). When Merchants connect their official WhatsApp Business Accounts, Instagram Professional accounts, and Facebook Pages to KreazyAI, our system processes incoming interactions exclusively to automate customer inquiries, synchronize inventory catalogs, and capture verified commerce orders.',

    p2Head: '2. Information We Ingest & Process',
    p2Body: 'We practice strict data minimization. Information processed is limited to:',
    p2List: [
      'Merchant Account Data: Business name, business email, phone number, and encrypted OAuth access tokens required to establish official Meta Cloud API handshakes.',
      'Customer Message Streams: Textual messages, media attachments, and voice notes transmitted by buyers through connected social channels for immediate intent classification.',
      'Commerce Catalog Data: Product SKUs, variant specifications (size, color), price values, and stock counts uploaded by Merchants or synced from e-commerce backends.',
      'Order Fulfillment Attributes: Customer delivery recipient name, shipping address, contact phone number, and payment status (Cash on Delivery, bKash, Nagad, card confirmation).'
    ],

    p3Head: '3. Explicit Zero-Training & AI Governance Guarantee',
    p3Body: 'We provide an irrevocable contractual guarantee regarding AI model training:',
    p3Highlight: 'Your store conversation logs, catalog data, and customer customer profiles are NEVER used to train, retrain, or fine-tune public foundation models (such as OpenAI GPT, Meta LLaMA, or Anthropic Claude). All LLM inference occurs within isolated, stateless API sessions with zero cross-tenant memory leakage.',

    p4Head: '4. Third-Party Data Processors & Infrastructure',
    p4Body: 'KreazyAI integrates strictly with audited enterprise infrastructure partners:',
    p4List: [
      'Meta Graph & Cloud API: Transmits customer messaging payloads over Meta-certified webhooks using SHA-256 HMAC signature validation.',
      'PostgreSQL & SQLite Storage: Primary relational storage hosted in secure ISO/IEC 27001-certified data centers with automated encryption at rest.',
      'Logistics Courier Gateways: Dispatch endpoints (Pathao, Steadfast, RedX) receive only finalized shipping address details required for parcel delivery fulfillment.'
    ],

    p5Head: '5. Security Architecture & Encryption Standards',
    p5Body: 'All communications are protected by modern cryptographic protocols:',
    p5List: [
      'In Transit: All HTTP and WebSocket traffic requires TLS 1.3 encryption with strict HSTS headers.',
      'At Rest: Sensitive credential tokens, API secrets, and customer identifiable records are secured with AES-256-GCM encryption.',
      'Tenant Isolation: Every merchant database environment is logically isolated using multi-tenant security barriers preventing unauthorized cross-workspace queries.'
    ],

    p6Head: '6. Data Retention & Right to Erasure',
    p6Body: 'Merchants maintain full sovereignty over their data. Inactive message logs are pruned per merchant-configured retention schedules (default 180 days). Merchants may submit an automated "Purge Workspace Data" request at any time to permanently expunge all associated customer records within 48 hours.',

    p7Head: '7. Merchant & Consumer Rights (GDPR & CCPA)',
    p7Body: 'End-customers contacting merchants through KreazyAI-powered channels may request access to, rectification of, or permanent deletion of their personal contact details by messaging the merchant directly or contacting our Data Protection Officer.',

    p8Head: '8. Data Protection Officer & Compliance Inquiries',
    p8Body: 'For questions regarding data processing practices, compliance certifications, or enterprise DPA agreements, contact our Data Protection Office at privacy@kreazyai.com or compliance@kreazyai.com.',

    // Terms of Service Sections
    termsTitle: 'Terms of Commercial Service',
    termsLead: 'These Terms of Service ("Agreement") form a legally binding contract between KreazyAI Technologies and the business or individual ("Merchant") accessing our conversational software platform.',

    t1Head: '1. Commercial Software License',
    t1Body: 'Subject to timely subscription payment and compliance with this Agreement, KreazyAI grants the Merchant a non-exclusive, non-transferable, revocable license to connect commercial social media channels to the KreazyAI autonomous conversational engine.',

    t2Head: '2. Acceptable Use & Meta Platform Compliance',
    t2Body: 'Merchants agree to operate in full accordance with Meta Commerce Policies, WhatsApp Business Messaging Policies, and local retail consumer protection regulations. Prohibited uses include:',
    t2List: [
      'Sending unsolicited marketing spam or unauthorized bulk promotional blasts outside Meta-approved 24-hour customer service windows.',
      'Promoting illicit, counterfeit, fraudulent, or regulated goods violating international commerce statutes.',
      'Attempting to reverse engineer, decompile, or bypass multi-tenant security perimeters of the KreazyAI platform.'
    ],

    t3Head: '3. Subscription Fees, Currency & Billing',
    t3Body: 'Platform fees are billed in advance on monthly or annual billing cycles. Prices are denominated in USD ($) and local currency equivalents (৳ BDT). Subscriptions may be canceled at any time prior to the next billing cycle via the Billing settings module.',

    t4Head: '4. Service Level Agreement (SLA) & 99.9% Target Uptime',
    t4Body: 'KreazyAI commits to an enterprise target uptime of 99.9% for core message routing and order capture engines. Scheduled maintenance is conducted during off-peak hours with prior merchant dashboard notification. Outages caused by upstream Meta Cloud API disruptions are covered under standard force majeure provisions.',

    t5Head: '5. Intellectual Property & Store Content Ownership',
    t5Body: 'Merchants retain 100% intellectual property ownership over their product descriptions, photography, brand assets, and customer databases. KreazyAI owns all proprietary algorithms, system architectures, UI designs, and conversational workflow engines.',

    t6Head: '6. Limitation of Liability',
    t6Body: 'To the maximum extent permitted by applicable law, KreazyAI shall not be liable for indirect, incidental, or consequential damages resulting from store inventory discrepancies, courier fulfillment delays, or upstream Meta platform policy changes.',

    t7Head: '7. Account Termination & Order Export',
    t7Body: 'Either party may terminate service at any time. Upon termination, Merchants are granted a 14-day grace period to download full CSV exports of customer records, conversation analytics, and order histories before data retirement.',

    t8Head: '8. Governing Law & Dispute Resolution',
    t8Body: 'This Agreement is governed by applicable commercial laws. In the event of dispute, parties agree to pursue informal mediation in good faith prior to initiating formal arbitration.'
  },

  bn: {
    heroEyebrow: 'এন্টারপ্রাইজ গভর্নেন্স ও বিশ্বস্ততা',
    heroTitle: 'ক্রেজি এআই লিগ্যাল ও প্রাইভেসি সেন্টার',
    heroSubtitle: 'মার্চেন্ট ডেটা সুরক্ষা, গ্রাহকদের কথোপকথনের গোপনীয়তা এবং মেটা ক্লাউড এপিআই-এর সর্বোচ্চ নিরাপত্তা নিশ্চিত করতে আমাদের সুনির্দিষ্ট নীতিমালা।',
    tabPrivacy: 'প্রাইভেসি পলিসি',
    tabTerms: 'ব্যবহারের শর্তাবলী',
    lastUpdated: 'সর্বশেষ আপডেট: ১৫ নভেম্বর, ২০২৬',
    effectiveDate: 'কার্যকর তারিখ: ১ জানুয়ারি, ২০২৬',
    versionBadge: 'ভার্সন ২.৪.০ — প্রোডাকশন',
    
    badgeGdpr: 'জিডিপিআর ও সিসিপিএ সম্মত',
    badgeMeta: 'অফিসিয়াল মেটা ক্লাউড এপিআই',
    badgeAi: 'পাবলিক এআই মডেল ট্রেইনিং মুক্ত',
    badgeSecurity: 'AES-256 ও TLS 1.3 এনক্রিপশন',

    tocLabel: 'দ্রুত নেভিগেশন',

    privacyTitle: 'ক্রেজি এআই মাস্টার প্রাইভেসি পলিসি',
    privacyLead: 'এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে কীভাবে ক্রেজি এআই কনভার্সেশনাল সফটওয়্যার মার্চেন্টদের ডেটা, চ্যাট রেকর্ড এবং লেনদেনের তথ্য সংগ্রহ ও নিরাপদ রাখে।',
    
    p1Head: '১. ভূমিকা ও পরিধি',
    p1Body: 'ক্রেজি এআই অনলাইন রিটেইলার এবং ব্যবসায়িক ক্লায়েন্টদের ("মার্চেন্ট") জন্য স্বয়ংক্রিয় সোশ্যাল কমার্স সফটওয়্যার পরিচালনা করে। মার্চেন্টরা তাদের অফিসিয়াল হোয়াটসঅ্যাপ বিজনেস, ইনস্টাগ্রাম প্রফেশনাল ও ফেসবুক পেজ যুক্ত করলে এআই স্বয়ংক্রিয়ভাবে গ্রাহক সেবা ও অর্ডার গ্রহণ করে।',

    p2Head: '২. তথ্য সংগ্রহ ও প্রক্রিয়াকরণ',
    p2Body: 'আমরা কঠোর ডাটা মিনিমাইজেশন নীতি অনুসরণ করি। সংগৃহীত তথ্য কেবল সেবা প্রদানের জন্য সীমিত:',
    p2List: [
      'মার্চেন্ট অ্যাকাউন্ট ডাটা: ব্যবসার নাম, অফিসিয়াল ইমেইল, ফোন নম্বর এবং মেটা ক্লাউড এপিআই কানেকশন টোকেন।',
      'গ্রাহকদের চ্যাট মেসেজ: গ্রাহকদের প্রেরিত টেক্সট, ছবি ও ভয়েস নোট যা শুধুমাত্র পণ্য অনুসন্ধান ও অর্ডারের উত্তর দিতে তাৎক্ষণিকভাবে প্রসেস হয়।',
      'পণ্যের ক্যাটালগ ডাটা: পণ্যের নাম, সাইজ, রঙ, মূল্য এবং স্টক পরিমাণ।',
      'অর্ডার ডেলিভারি বিবরণ: প্রাপকের নাম, ডেলিভারি ঠিকানা, মোবাইল নম্বর এবং পেমেন্ট স্ট্যাটাস (ক্যাশ অন ডেলিভারি, বিকাশ, নগদ)।'
    ],

    p3Head: '৩. এআই ট্রেইনিং মুক্ত ডেটা সুরক্ষা নিশ্চয়তা',
    p3Body: 'আমরা এআই মডেল সম্পর্কিত সুস্পষ্ট চুক্তিভিত্তিক নিশ্চয়তা প্রদান করি:',
    p3Highlight: 'আপনার স্টোরের চ্যাট হিস্ট্রি বা গ্রাহকের তথ্য কখনোই কোনো পাবলিক এআই মডেল (যেমন OpenAI GPT বা Meta LLaMA) ট্রেইনিংয়ে ব্যবহার করা হয় না। প্রতিটি কথোপকথন সম্পূর্ণ আইসোলেটেড ও সুরক্ষিত থাকে।',

    p4Head: '৪. থার্ড-পার্টি ডাটা প্রসেসর ও অবকাঠামো',
    p4Body: 'ক্রেজি এআই শুধুমাত্র অনুমোদিত এন্টারপ্রাইজ অবকাঠামো ব্যবহার করে:',
    p4List: [
      'মেটা ক্লাউড এপিআই: অফিসিয়াল SHA-256 HMAC সিগনেচার যাচাইয়ের মাধ্যমে নিরাপদ ওয়েববুক যোগাযোগ।',
      'পোস্টগ্রেসকিউএল ও সিকিউর ডাটাবেস: ISO/IEC 27001 সার্টিফায়েড ডেটাসেন্টারে সংরক্ষিত।',
      'কুরিয়ার গেটওয়ে: কেবল পার্সেল ডেলিভারি সম্পন্ন করার জন্য কুরিয়ার এপিআই-তে (পাঠাও, স্টিডফাস্ট, রেডএক্স) ঠিকানা পাঠানো হয়।'
    ],

    p5Head: '৫. নিরাপত্তা মানদণ্ড ও এনক্রিপশন',
    p5Body: 'সকল ডাটা আধুনিক এনক্রিপশনের মাধ্যমে সুরক্ষিত থাকে:',
    p5List: [
      'ইন ট্রানজিট: সকল ওয়েব ট্রাফিকে TLS 1.3 এনক্রিপশন বাধ্যতামূলক।',
      'অ্যাট রেস্ট: সংবেদনশীল ডাটা এবং অ্যাক্সেস টোকেন AES-256 এনক্রিপশনে সংরক্ষিত।',
      'টেন্যান্ট আইসোলেশন: প্রতিটি মার্চেন্টের ডেটা সম্পূর্ণ আলাদা সুরক্ষিত ওয়ার্কস্পেসে সংরক্ষিত থাকে।'
    ],

    p6Head: '৬. ডেটা সংরক্ষণ ও মুছে ফেলার অধিকার',
    p6Body: 'মার্চেন্টরা যেকোনো সময় ড্যাশবোর্ড থেকে তাদের স্টোরের সকল ডেটা স্থায়ীভাবে মুছে ফেলার ("Purge Data") অনুরোধ করতে পারেন, যা ৪৮ ঘণ্টার মধ্যে কার্যকর হয়।',

    p7Head: '৭. মার্চেন্ট ও গ্রাহকদের অধিকার (GDPR)',
    p7Body: 'গ্রাহকরা তাদের ব্যক্তিগত তথ্য প্রদর্শন, সংশোধন বা স্থায়ী অপসারণের জন্য মার্চেন্ট অথবা আমাদের ডেটা প্রটেকশন অফিসে যোগাযোগ করতে পারেন।',

    p8Head: '৮. ডেটা প্রটেকশন অফিস ও যোগাযোগ',
    p8Body: 'প্রাইভেসি ও কমপ্লায়েন্স সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের ইমেইল করুন: privacy@kreazyai.com বা compliance@kreazyai.com।',

    termsTitle: 'বাণিজ্যিক ব্যবহারের নীতিমালা ও শর্তাবলী',
    termsLead: 'এই নীতিমালা ক্রেজি এআই এবং প্ল্যাটফর্ম ব্যবহারকারী ব্যবসায়িক প্রতিষ্ঠানের ("মার্চেন্ট") মধ্যকার একটি আইনি চুক্তি।',

    t1Head: '১. বাণিজ্যিক প্ল্যাটফর্ম লাইসেন্স',
    t1Body: 'সাবস্ক্রিপশন ফি পরিশোধ সাপেক্ষে মার্চেন্টদের তাদের সোশ্যাল কমার্স চ্যানেলগুলোতে ক্রেজি এআই ইঞ্জিন ব্যবহারের অ-একচেটিয়া ও প্রত্যাহারযোগ্য লাইসেন্স প্রদান করা হয়।',

    t2Head: '২. গ্রহণযোগ্য ব্যবহার ও মেটা পলিসি সম্মতি',
    t2Body: 'মার্চেন্টরা মেটা কমার্স পলিসি এবং হোয়াটসঅ্যাপ বিজনেস পলিসি পুরোপুরি মেনে চলতে বাধ্য থাকবেন:',
    t2List: [
      '২৪ ঘণ্টার গ্রাহক সেবা উইন্ডোর বাইরে অননুমোদিত স্প্যাম বা বাল্ক প্রমোশন পাঠানো সম্পূর্ণ নিষিদ্ধ।',
      'জাল, অবৈধ বা আন্তর্জাতিক আইন লঙ্ঘনকারী পণ্য বিক্রি করা যাবে না।',
      'সফটওয়্যারের কোড রিভার্স-ইঞ্জিনিয়ার বা নিরাপত্তা ব্যবস্থা লঙ্ঘনের চেষ্টা করা যাবে না।'
    ],

    t3Head: '৩. সাবস্ক্রিপশন ফি ও বিলিং',
    t3Body: 'প্ল্যাটফর্মের চার্জ প্রতি মাসে বা বছরে অগ্রিম প্রদেয়। ফি ইউএসডি ($) অথবা সমপরিমাণ বাংলাদেশি টাকায় (৳ BDT) নির্ধারিত।',

    t4Head: '৪. সার্ভিস লেভেল এগ্রিমেন্ট (৯৯.৯% আপটাইম)',
    t4Body: 'আমরা মেসেজিং ও অর্ডার ইঞ্জিনের জন্য ৯৯.৯% আপটাইম বজায় রাখতে প্রতিশ্রুতিবদ্ধ। নিয়মিত মেইনটেন্যান্স পূর্বঘোষণা দিয়ে পরিচালিত হয়।',

    t5Head: '৫. মেধা সম্পদ ও তথ্যের মালিকানা',
    t5Body: 'মার্চেন্টরা তাদের পণ্যের তথ্য ও গ্রাহক তালিকার ১০০% স্বত্বাধিকারী থাকবেন। ক্রেজি এআই তাদের অ্যালগরিদম ও সফটওয়্যার আর্কিটেকচারের মালিক।',

    t6Head: '৬. দায়বদ্ধতার সীমাবদ্ধতা',
    t6Body: 'কুরিয়ার ডেলিভারি বিলম্ব বা মেটা এপিআই-এর নিজস্ব বিঘ্নের জন্য ক্রেজি এআই দায়ী থাকবে না।',

    t7Head: '৭. অ্যাকাউন্ট বাতিল ও ডাটা এক্সপোর্ট',
    t7Body: 'অ্যাকাউন্ট বাতিলের পর মার্চেন্টরা তাদের সম্পূর্ণ গ্রাহক ও অর্ডার হিস্ট্রি CSV আকারে ডাউনলোড করার জন্য ১৪ দিনের সময় পাবেন।',

    t8Head: '৮. প্রযোজ্য আইন ও বিরোধ নিষ্পত্তি',
    t8Body: 'যেকোনো বিরোধের ক্ষেত্রে উভয় পক্ষ প্রথমে সৌহার্দ্যপূর্ণ আলোচনার মাধ্যমে নিষ্পত্তি করতে সম্মত থাকবেন।'
  },

  es: {
    heroEyebrow: 'GOBERNANZA EMPRESARIAL Y CONFIANZA',
    heroTitle: 'Centro Legal y de Privacidad de KreazyAI',
    heroSubtitle: 'Transparencia absoluta sobre cómo KreazyAI protege los datos de comerciantes, respeta la privacidad de los chats y garantiza seguridad de nivel bancario en las APIs de Meta Cloud.',
    tabPrivacy: 'Política de Privacidad',
    tabTerms: 'Términos de Servicio',
    lastUpdated: 'Última actualización: 15 de noviembre de 2026',
    effectiveDate: 'Fecha de vigencia: 1 de enero de 2026',
    versionBadge: 'Versión 2.4.0 — Producción',

    badgeGdpr: 'Cumple con GDPR y CCPA',
    badgeMeta: 'API Oficial de Meta Cloud',
    badgeAi: 'Cero Entrenamiento de Modelos',
    badgeSecurity: 'AES-256 y TLS 1.3',

    tocLabel: 'Navegación Rápida',

    privacyTitle: 'Política Maestra de Privacidad de KreazyAI',
    privacyLead: 'Esta Política detalla los estándares rigurosos de privacidad y seguridad que rigen la recopilación, almacenamiento y procesamiento de conversaciones, catálogos y transacciones comerciales procesadas por KreazyAI.',

    p1Head: '1. Introducción y Alcance Organizacional',
    p1Body: 'KreazyAI ("nosotros") opera una plataforma de comercio conversacional autónomo para minoristas comerciales ("Comerciantes"). Al conectar canales como WhatsApp Business, Instagram y Facebook, nuestro sistema procesa interacciones exclusivamente para automatizar atención al cliente y procesar pedidos.',

    p2Head: '2. Información que Recopilamos y Procesamos',
    p2Body: 'Practicamos una estricta minimización de datos. La información procesada se limita a:',
    p2List: [
      'Datos de Cuenta del Comerciante: Nombre comercial, correo electrónico y tokens OAuth encriptados para la integración con Meta Cloud API.',
      'Flujos de Mensajes de Clientes: Mensajes de texto y notas de voz para clasificación de intención y respuestas de productos.',
      'Datos de Catálogo Comercial: SKUs, tallas, colores, precios y existencias de inventario.',
      'Atributos de Entrega y Pedidos: Nombre del destinatario, dirección de entrega, teléfono de contacto y estado de pago.'
    ],

    p3Head: '3. Garantía Explícita de Cero Entrenamiento de IA',
    p3Body: 'Otorgamos una garantía contractual irrevocable sobre la gobernanza de modelos de inteligencia artificial:',
    p3Highlight: 'Los registros de chat y catálogos de su tienda NUNCA se utilizan para entrenar o ajustar modelos fundacionales públicos (como OpenAI GPT o Meta LLaMA). Todas las sesiones son aisladas y sin fuga entre espacios de trabajo.',

    p4Head: '4. Procesadores de Datos de Terceros e Infraestructura',
    p4Body: 'KreazyAI se integra exclusivamente con socios auditados de infraestructura empresarial:',
    p4List: [
      'Meta Cloud API: Transmite mensajes mediante webhooks certificados con validación de firmas SHA-256 HMAC.',
      'Bases de Datos Seguras: Alojadas en centros de datos certificados ISO/IEC 27001 con cifrado en reposo.',
      'Pasarelas de Envíos y Logística: Reciben únicamente los datos indispensables para completar la entrega del paquete.'
    ],

    p5Head: '5. Estándares de Seguridad y Cifrado',
    p5Body: 'Todas las comunicaciones están protegidas por protocolos criptográficos avanzados:',
    p5List: [
      'En Tránsito: Todo el tráfico requiere cifrado TLS 1.3 con encabezados HSTS estrictos.',
      'En Reposo: Los registros y tokens sensibles están protegidos con cifrado AES-256-GCM.',
      'Aislamiento Multinquilino: Cada tienda opera en un entorno lógico independiente que previene accesos cruzados no autorizados.'
    ],

    p6Head: '6. Retención de Datos y Derecho de Supresión',
    p6Body: 'Los comerciantes pueden purgar de forma permanente todos sus registros de clientes y mensajes en cualquier momento con efecto en menos de 48 horas.',

    p7Head: '7. Derechos del Consumidor (GDPR y CCPA)',
    p7Body: 'Los consumidores finales pueden solicitar el acceso, rectificación o eliminación de sus datos personales a través del comerciante o de nuestro Oficial de Protección de Datos.',

    p8Head: '8. Oficial de Protección de Datos y Contacto',
    p8Body: 'Para consultas sobre cumplimiento o acuerdos DPA empresariales, escriba a privacy@kreazyai.com o compliance@kreazyai.com.',

    termsTitle: 'Términos del Servicio Comercial',
    termsLead: 'Estos Términos de Servicio constituyen un contrato vinculante entre KreazyAI y el comerciante que accede a nuestra plataforma.',

    t1Head: '1. Licencia de Software Comercial',
    t1Body: 'KreazyAI otorga al Comerciante una licencia revocable, no exclusiva e intransferible para conectar canales comerciales a nuestro motor conversacional autónomo.',

    t2Head: '2. Uso Aceptable y Políticas de Meta',
    t2Body: 'Los comerciantes se comprometen a respetar las Políticas Comerciales de Meta y WhatsApp Business Messaging:',
    t2List: [
      'Prohibido el envío de spam masivo fuera de las ventanas autorizadas de atención al cliente de 24 horas.',
      'Prohibida la venta de productos ilícitos o fraudulentos.',
      'Prohibido intentar descompilar o eludir las medidas de seguridad del sistema.'
    ],

    t3Head: '3. Tarifas, Moneda y Facturación',
    t3Body: 'Las suscripciones se cobran por adelantado en ciclos mensuales o anuales, denominadas en USD ($) o monedas locales equivalentes.',

    t4Head: '4. Acuerdo de Nivel de Servicio (99.9% Uptime)',
    t4Body: 'KreazyAI se compromete a un objetivo de disponibilidad del 99.9% en su motor central de mensajes y procesamiento de pedidos.',

    t5Head: '5. Propiedad Intelectual',
    t5Body: 'Los Comerciantes son propietarios al 100% de sus catálogos, imágenes y bases de clientes. KreazyAI es propietario exclusivo de sus algoritmos y código de software.',

    t6Head: '6. Limitación de Responsabilidad',
    t6Body: 'KreazyAI no será responsable por daños indirectos derivados de interrupciones imprevistas en la API de Meta Graph o retrasos de servicios de mensajería externa.',

    t7Head: '7. Terminación y Exportación de Datos',
    t7Body: 'Al cancelar el servicio, los comerciantes disponen de 14 días para exportar sus historiales y clientes en formato CSV antes del retiro de datos.',

    t8Head: '8. Ley Aplicable y Resolución de Disputas',
    t8Body: 'Este Acuerdo se rige por las leyes comerciales pertinentes, comprometiéndose las partes a la mediación de buena fe antes de cualquier acción formal.'
  }
};

export function LegalPage({ initialTab = 'privacy' }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const t = LEGAL_TEXT[langKey] || LEGAL_TEXT.en;

  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div className="legal-page-root">
      {/* ─── Hero Header Banner ─────────────────────────────────────────────── */}
      <section className="legal-hero-section">
        <div className="container">
          <div className="legal-hero-card">
            <div className="legal-hero-badge-row">
              <span className="legal-hero-eyebrow">
                <ShieldCheck size={14} className="legal-eyebrow-icon" />
                {t.heroEyebrow}
              </span>
              <span className="legal-version-pill">{t.versionBadge}</span>
            </div>

            <h1 className="legal-hero-title">{t.heroTitle}</h1>
            <p className="legal-hero-subtitle">{t.heroSubtitle}</p>

            <div className="legal-trust-pills-grid">
              <div className="legal-trust-pill">
                <CheckCircle2 size={15} className="legal-pill-icon" />
                <span>{t.badgeGdpr}</span>
              </div>
              <div className="legal-trust-pill">
                <Globe2 size={15} className="legal-pill-icon" />
                <span>{t.badgeMeta}</span>
              </div>
              <div className="legal-trust-pill">
                <Lock size={15} className="legal-pill-icon" />
                <span>{t.badgeAi}</span>
              </div>
              <div className="legal-trust-pill">
                <Server size={15} className="legal-pill-icon" />
                <span>{t.badgeSecurity}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content Container ─────────────────────────────────────────── */}
      <section className="legal-content-section">
        <div className="container" style={{ maxWidth: '960px' }}>
          
          {/* Responsive Tab Controls */}
          <div className="legal-tabs-wrapper">
            <div className="legal-tabs-bar" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'privacy'}
                className={`legal-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                onClick={() => setActiveTab('privacy')}
              >
                <ShieldCheck size={18} className="legal-tab-icon" />
                <span>{t.tabPrivacy}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'terms'}
                className={`legal-tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
                onClick={() => setActiveTab('terms')}
              >
                <FileText size={18} className="legal-tab-icon" />
                <span>{t.tabTerms}</span>
              </button>
            </div>

            <div className="legal-meta-strip">
              <span className="legal-meta-item">
                <Clock size={13} />
                {t.lastUpdated}
              </span>
              <span className="legal-meta-dot">•</span>
              <span className="legal-meta-item">
                <CheckCircle2 size={13} />
                {t.effectiveDate}
              </span>
            </div>
          </div>

          {/* Document Content Card */}
          <article className="legal-document-card">
            {activeTab === 'privacy' ? (
              <div className="legal-doc-body" id="privacy-document">
                <header className="legal-doc-header">
                  <h2 className="legal-doc-title">{t.privacyTitle}</h2>
                  <p className="legal-doc-lead">{t.privacyLead}</p>
                </header>

                <div className="legal-doc-divider" />

                {/* Section 1 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.p1Head}</h3>
                  <p className="legal-section-text">{t.p1Body}</p>
                </section>

                {/* Section 2 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.p2Head}</h3>
                  <p className="legal-section-text">{t.p2Body}</p>
                  <ul className="legal-feature-list">
                    {t.p2List.map((item, idx) => (
                      <li key={idx} className="legal-feature-item">
                        <ChevronRight size={15} className="legal-bullet-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Section 3 — High Visibility Zero Training Guarantee */}
                <section className="legal-section-block legal-highlight-box">
                  <div className="legal-highlight-header">
                    <Lock size={18} className="legal-lock-icon" />
                    <h3 className="legal-highlight-title">{t.p3Head}</h3>
                  </div>
                  <p className="legal-highlight-text">{t.p3Highlight}</p>
                </section>

                {/* Section 4 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.p4Head}</h3>
                  <p className="legal-section-text">{t.p4Body}</p>
                  <ul className="legal-feature-list">
                    {t.p4List.map((item, idx) => (
                      <li key={idx} className="legal-feature-item">
                        <ChevronRight size={15} className="legal-bullet-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.p5Head}</h3>
                  <p className="legal-section-text">{t.p5Body}</p>
                  <ul className="legal-feature-list">
                    {t.p5List.map((item, idx) => (
                      <li key={idx} className="legal-feature-item">
                        <ChevronRight size={15} className="legal-bullet-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Section 6 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.p6Head}</h3>
                  <p className="legal-section-text">{t.p6Body}</p>
                </section>

                {/* Section 7 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.p7Head}</h3>
                  <p className="legal-section-text">{t.p7Body}</p>
                </section>

                {/* Section 8: DPO Contact Card */}
                <section className="legal-section-block legal-contact-subcard">
                  <div className="legal-dpo-icon-wrap">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="legal-section-heading" style={{ margin: '0 0 6px 0' }}>{t.p8Head}</h3>
                    <p className="legal-section-text" style={{ margin: 0 }}>{t.p8Body}</p>
                    <div className="legal-email-action-row">
                      <a href="mailto:privacy@kreazyai.com" className="legal-email-link">privacy@kreazyai.com</a>
                      <span className="legal-email-sep">•</span>
                      <a href="mailto:compliance@kreazyai.com" className="legal-email-link">compliance@kreazyai.com</a>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="legal-doc-body" id="terms-document">
                <header className="legal-doc-header">
                  <h2 className="legal-doc-title">{t.termsTitle}</h2>
                  <p className="legal-doc-lead">{t.termsLead}</p>
                </header>

                <div className="legal-doc-divider" />

                {/* Terms Section 1 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t1Head}</h3>
                  <p className="legal-section-text">{t.t1Body}</p>
                </section>

                {/* Terms Section 2 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t2Head}</h3>
                  <p className="legal-section-text">{t.t2Body}</p>
                  <ul className="legal-feature-list">
                    {t.t2List.map((item, idx) => (
                      <li key={idx} className="legal-feature-item">
                        <ChevronRight size={15} className="legal-bullet-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Terms Section 3 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t3Head}</h3>
                  <p className="legal-section-text">{t.t3Body}</p>
                </section>

                {/* Terms Section 4 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t4Head}</h3>
                  <p className="legal-section-text">{t.t4Body}</p>
                </section>

                {/* Terms Section 5 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t5Head}</h3>
                  <p className="legal-section-text">{t.t5Body}</p>
                </section>

                {/* Terms Section 6 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t6Head}</h3>
                  <p className="legal-section-text">{t.t6Body}</p>
                </section>

                {/* Terms Section 7 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t7Head}</h3>
                  <p className="legal-section-text">{t.t7Body}</p>
                </section>

                {/* Terms Section 8 */}
                <section className="legal-section-block">
                  <h3 className="legal-section-heading">{t.t8Head}</h3>
                  <p className="legal-section-text">{t.t8Body}</p>
                </section>
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
