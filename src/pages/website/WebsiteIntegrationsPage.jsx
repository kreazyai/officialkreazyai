import React, { useState } from 'react';
import {
  MessageSquare,
  Share2,
  Globe,
  ShoppingBag,
  Truck,
  Table,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useLanguage } from '../../context/LanguageContext';

const INTEGRATIONS_LANG_DATA = {
  en: {
    badge: 'ECOSYSTEM & CONNECTIVITY',
    title: 'Connect your entire commerce stack in minutes',
    subtitle: 'Official Meta Cloud APIs, e-commerce storefronts, logistics couriers, and CRM pipelines — seamlessly synchronized with zero code required.',
    categories: [
      { id: 'all', label: 'All Integrations' },
      { id: 'meta', label: 'Meta Channels' },
      { id: 'ecommerce', label: 'E-Commerce' },
      { id: 'logistics', label: 'Couriers & Logistics' },
      { id: 'crm', label: 'CRM & Data' }
    ],
    items: [
      {
        id: 'whatsapp',
        category: 'meta',
        name: 'WhatsApp Business Cloud',
        partnerTag: 'Official Meta Partner',
        setupTime: '⚡ 2 min setup',
        desc: 'Official Meta Cloud API. Automates 1-on-1 customer chats, product catalog cards, interactive button menus, and order tracking alerts.',
        features: ['Verified green checkmark compatible', 'Interactive buttons & list messages', 'Automated shipping alerts & notifications']
      },
      {
        id: 'instagram',
        category: 'meta',
        name: 'Instagram Direct Automation',
        partnerTag: 'Official Meta Graph',
        setupTime: '⚡ 1 click connect',
        desc: 'Direct integration with Instagram Professional. Auto-respond to story mentions, post comments, and DMs with interactive product cards.',
        features: ['Story mention auto-replies', 'Comment-to-DM automated triggers', 'In-chat product catalog browsing']
      },
      {
        id: 'messenger',
        category: 'meta',
        name: 'Facebook Messenger Pages',
        partnerTag: 'Official Meta Graph',
        setupTime: '⚡ 1 click connect',
        desc: 'Synchronizes your business Facebook page inbox. Converts Click-to-Messenger ad traffic into confirmed paid orders with zero delay.',
        features: ['Paid ad lead instant conversion', 'Multi-page consolidated inbox', 'Automated customer contact saving']
      },
      {
        id: 'webchat',
        category: 'meta',
        name: 'Website Live Chat SDK',
        partnerTag: 'Embeddable JS',
        setupTime: '⚡ Copy & paste snippet',
        desc: 'Lightweight, high-speed chat widget for your website or online store. Engages visitors and captures orders without slowing down page load.',
        features: ['Sub-20kb asynchronous script', 'Customizable brand color & avatar', 'Seamless visitor-to-order flow']
      },
      {
        id: 'shopify',
        category: 'ecommerce',
        name: 'Shopify Storefront Sync',
        partnerTag: 'Direct OAuth App',
        setupTime: '⚡ Real-time sync',
        desc: 'Bi-directional synchronization with Shopify. Live inventory reservation, product variant lookup, and automatic order creation.',
        features: ['Real-time SKU & stock balance', 'Automated order and customer sync', 'Discount code validation']
      },
      {
        id: 'woocommerce',
        category: 'ecommerce',
        name: 'WooCommerce API v3',
        partnerTag: 'REST Integration',
        setupTime: '⚡ 3 min setup',
        desc: 'Connect your WordPress WooCommerce store. Search products, verify stock availability, and push confirmed in-chat orders instantly.',
        features: ['Automatic order creation in WP', 'Customer billing address sync', 'Real-time category indexing']
      },
      {
        id: 'steadfast',
        category: 'logistics',
        name: 'Steadfast Courier API',
        partnerTag: 'Bangladesh Logistics',
        setupTime: '⚡ Auto-dispatch',
        desc: 'Generate courier consignment numbers and print shipping invoices the second an order is confirmed in WhatsApp or Messenger.',
        features: ['Automated tracking number generation', 'Dhaka & nationwide parcel delivery', 'In-chat delivery status retrieval']
      },
      {
        id: 'pathao',
        category: 'logistics',
        name: 'Pathao Courier Ingestion',
        partnerTag: 'Merchant Partner',
        setupTime: '⚡ Auto-dispatch',
        desc: 'Direct courier booking via Pathao Merchant API. Push customer phone number, delivery address, and COD amount with automated dispatch.',
        features: ['Instant delivery pickup requests', 'Real-time parcel webhook updates', 'Automated COD reconciliation']
      },
      {
        id: 'redx',
        category: 'logistics',
        name: 'RedX Logistics API',
        partnerTag: 'Enterprise Delivery',
        setupTime: '⚡ Auto-dispatch',
        desc: 'Nationwide Bangladesh parcel logistics. Automatic order dispatching, invoice printing, and delivery notifications sent to customer chats.',
        features: ['Full district coverage mapping', 'Live tracking URL auto-sent to buyer', 'Automated return alert tracking']
      },
      {
        id: 'sheets',
        category: 'crm',
        name: 'Google Sheets Live Sync',
        partnerTag: 'Cloud Sync',
        setupTime: '⚡ Instant setup',
        desc: 'Instantly append verified customer phone numbers, orders, items purchased, and revenue totals into your Google Sheets spreadsheet.',
        features: ['Zero delay row appending', 'Separate sheets per channel or date', 'Custom column mapping']
      },
      {
        id: 'hubspot',
        category: 'crm',
        name: 'HubSpot CRM Integration',
        partnerTag: 'CRM Connector',
        setupTime: '⚡ OAuth connect',
        desc: 'Sync qualified retail leads, conversational transcripts, and deal stages directly into your HubSpot sales pipeline.',
        features: ['Lead contact timeline logging', 'Automated deal creation', 'Custom property mapping']
      },
      {
        id: 'webhooks',
        category: 'crm',
        name: 'Custom REST API & Webhooks',
        partnerTag: 'Developer Platform',
        setupTime: '⚡ HMAC SHA-256',
        desc: 'Connect your proprietary ERP, warehouse system, or POS backend with real-time JSON webhooks and REST endpoints.',
        features: ['HMAC SHA-256 signature verification', 'Sub-second event delivery', 'Full request retry queue']
      }
    ],
    securityTitle: 'Built on official Meta enterprise cloud endpoints',
    securityDesc: 'No unofficial browser automation or risky wrappers. All channels connect directly through verified APIs.',
    sec1Title: 'Official Meta Verified',
    sec1Desc: 'Direct handshake with Meta Graph API endpoints ensures 100% account safety and zero ban risk.',
    sec2Title: 'End-to-End Encryption',
    sec2Desc: 'Customer messages and order data are transmitted over TLS 1.3 with AES-256 data protection.',
    sec3Title: '99.99% Uptime Guarantee',
    sec3Desc: 'Multi-region queue architecture guarantees zero dropped messages even during peak viral sales events.',
    ctaTitle: 'Need a custom CRM or ERP integration?',
    ctaDesc: 'Our engineering team connects custom inventory systems, warehouse management software, and payment gateways for enterprise retailers.',
    ctaBtnDemo: 'Schedule Live Integration Demo',
    ctaBtnTalk: 'Talk to Integration Engineer'
  },

  bn: {
    badge: 'ইকোসিস্টেম ও কানেক্টিভিটি',
    title: 'আপনার সম্পূর্ণ কমার্স স্ট্যাক সংযুক্ত করুন মাত্র কয়েক মিনিটে',
    subtitle: 'অফিসিয়াল মেটা ক্লাউড এপিআই, ই-কমার্স স্টোর, কুরিয়ার লজিস্টিকস এবং সিআরএম পাইপলাইন—কোনো কোডিং ছাড়াই সম্পূর্ণ স্বয়ংক্রিয় সিঙ্ক।',
    categories: [
      { id: 'all', label: 'সকল ইন্টিগ্রেশন' },
      { id: 'meta', label: 'মেটা চ্যানেল' },
      { id: 'ecommerce', label: 'ই-কমার্স' },
      { id: 'logistics', label: 'কুরিয়ার ও ডেলিভারি' },
      { id: 'crm', label: 'সিআরএম ও ডাটা' }
    ],
    items: [
      {
        id: 'whatsapp',
        category: 'meta',
        name: 'হোয়াটসঅ্যাপ বিজনেস ক্লাউড',
        partnerTag: 'অফিসিয়াল মেটা পার্টনার',
        setupTime: '⚡ মাত্র ২ মিনিটে সেটআপ',
        desc: 'মেটার অফিশিয়াল ক্লাউড এপিআই। ওয়ান-অন-ওয়ান চ্যাট, প্রোডাক্ট ক্যাটালগ কার্ড, ইন্টারেক্টিভ বাটন এবং ট্র্যাকিং এলার্ট অটোমেট করে।',
        features: ['গ্রিন টিকমার্ক একাউন্টের সাথে পূর্ণ উপযোগী', 'ইন্টারেক্টিভ বাটন ও লিস্ট মেসেজ', 'স্বয়ংক্রিয় শিপিং ও ডেলিভারি নোটিফিকেশন']
      },
      {
        id: 'instagram',
        category: 'meta',
        name: 'ইনস্টাগ্রাম ডিরেক্ট অটোমেশন',
        partnerTag: 'অফিসিয়াল মেটা গ্রাফ',
        setupTime: '⚡ ১-ক্লিকে সংযোগ',
        desc: 'ইনস্টাগ্রাম প্রফেশনাল একাউন্টের সাথে সরাসরি যুক্ত। স্টোরি মেনশন, কমেন্ট ও ইনবক্স মেসেজে সাথে সাথে প্রোডাক্ট কার্ড পাঠায়।',
        features: ['স্টোরি মেনশন অটো-রিপ্লাই', 'কমেন্ট-টু-ডিএম অটোমেটেড ট্রিগার', 'ইন-চ্যাটে ক্যাটালগ ব্রাউজিং সুবিধা']
      },
      {
        id: 'messenger',
        category: 'meta',
        name: 'ফেসবুক মেসেঞ্জার পেজ',
        partnerTag: 'অফিসিয়াল মেটা গ্রাফ',
        setupTime: '⚡ ১-ক্লিকে সংযোগ',
        desc: 'আপনার অফিশিয়াল ফেসবুক পেজের ইনবক্স সিঙ্ক করে। বিজ্ঞাপনে ক্লিক করা কাস্টমারদের কোনো বিলম্ব ছাড়াই কনফার্মড অর্ডারে রূপান্তর করে।',
        features: ['পেইড অ্যাড লিড তাৎক্ষণিক কনভার্সন', 'মাল্টি-পেজ একীভূত ইনবক্স', 'স্বয়ংক্রিয় গ্রাহক যোগাযোগ সংরক্ষণ']
      },
      {
        id: 'webchat',
        category: 'meta',
        name: 'ওয়েবসাইট লাইভ চ্যাট এসডিকে',
        partnerTag: 'এমবেডেবল জেএস',
        setupTime: '⚡ কপি-পেস্ট কোড স্নিপেট',
        desc: 'আপনার ওয়েবসাইটের জন্য দ্রুতগতির লাইভ চ্যাট উইজেট। সাইটের স্পিড না কমিয়েই ভিজিটরদের সাথে যুক্ত হয় ও অর্ডার নিশ্চিত করে।',
        features: ['২০ কিলোবাইটেরও হালকা এসিঙ্ক স্ক্রিপ্ট', 'কাস্টম ব্র্যান্ড কালার ও অ্যাভাটার', 'ভিজিটর থেকে অর্ডারে নির্বিঘ্ন রূপান্তর']
      },
      {
        id: 'shopify',
        category: 'ecommerce',
        name: 'শপিফাই স্টোরফ্রন্ট সিঙ্ক',
        partnerTag: 'ডাইরেক্ট ও-অথ অ্যাপ',
        setupTime: '⚡ রিয়েল-টাইম সিঙ্ক',
        desc: 'শপিফাই-এর সাথে দ্বিমুখী সিঙ্ক। লাইভ ইনভেন্টরি রিজার্ভেশন, প্রোডাক্ট ভেরিয়েন্ট যাচাই এবং স্বয়ংক্রিয় অর্ডার তৈরি।',
        features: ['রিয়েল-টাইম এসকেইউ ও স্টক ব্যালেন্স', 'স্বয়ংক্রিয় অর্ডার ও গ্রাহক সিঙ্ক', 'ডিসকাউন্ট কুপন যাচাইকরণ']
      },
      {
        id: 'woocommerce',
        category: 'ecommerce',
        name: 'উ-কমার্স এপিআই ৩.০',
        partnerTag: 'রেস্ট ইন্টিগ্রেশন',
        setupTime: '⚡ ৩ মিনিটে সেটআপ',
        desc: 'আপনার ওয়ার্ডপ্রেস উ-কমার্স স্টোর যুক্ত করুন। পণ্য সার্চ, স্টক প্রাপ্যতা যাচাই এবং চ্যাট থেকে সরাসরি অর্ডার প্লেস করুন।',
        features: ['ওয়ার্ডপ্রেসে স্বয়ংক্রিয় অর্ডার তৈরি', 'গ্রাহকের বিলিং ও শিপিং ঠিকানা সিঙ্ক', 'রিয়েল-টাইম ক্যাটাগরি ইনডেক্সিং']
      },
      {
        id: 'steadfast',
        category: 'logistics',
        name: 'স্টিডফাস্ট কুরিয়ার এপিআই',
        partnerTag: 'বাংলাদেশ লজিস্টিকস',
        setupTime: '⚡ অটো-ডিসপ্যাচ',
        desc: 'হোয়াটসঅ্যাপ বা মেসেঞ্জারে অর্ডার কনফার্ম হওয়ার সাথে সাথেই পার্সেল কনসাইনমেন্ট তৈরি ও ইনভয়েস প্রিন্ট করার সুবিধা।',
        features: ['স্বয়ংক্রিয় ট্র্যাকিং নম্বর তৈরি', 'সারা বাংলাদেশে নির্ভরযোগ্য ডেলিভারি', 'চ্যাটের ভেতর লাইভ পার্সেল ট্র্যাকিং']
      },
      {
        id: 'pathao',
        category: 'logistics',
        name: 'পাঠাও কুরিয়ার লজিস্টিকস',
        partnerTag: 'মার্চেন্ট পার্টনার',
        setupTime: '⚡ অটো-ডিসপ্যাচ',
        desc: 'পাঠাও মার্চেন্ট এপিআই-এর মাধ্যমে সরাসরি পার্সেল বুকিং। গ্রাহকের ফোন নম্বর, ঠিকানা ও সিওডি এমাউন্ট পাঠিয়ে সাথে সাথে পিকআপ রিকোয়েস্ট।',
        features: ['তাৎক্ষণিক পিকআপ রিকোয়েস্ট তৈরি', 'রিয়েল-টাইম পার্সেল ওয়েবহুক আপডেট', 'স্বয়ংক্রিয় সিওডি পেমেন্ট সমন্বয়']
      },
      {
        id: 'redx',
        category: 'logistics',
        name: 'রেডএক্স ডেলিভারি এপিআই',
        partnerTag: 'এন্টারপ্রাইজ ডেলিভারি',
        setupTime: '⚡ অটো-ডিসপ্যাচ',
        desc: 'সারাদেশে পার্সেল লজিস্টিকস। স্বয়ংক্রিয় অর্ডার বুকিং, চালান প্রিন্ট এবং গ্রাহকের চ্যাটে ডেলিভারি আপডেট প্রেরণ।',
        features: ['৬৪ জেলায় পূর্ণ কভারেজ ম্যাপিং', 'গ্রাহককে স্বয়ংক্রিয় ট্র্যাকিং লিংক প্রদান', 'রিটার্ন পার্সেলের দ্রুত নোটিফিকেশন']
      },
      {
        id: 'sheets',
        category: 'crm',
        name: 'গুগল শিটস লাইভ সিঙ্ক',
        partnerTag: 'ক্লাউড সিঙ্ক',
        setupTime: '⚡ তাৎক্ষণিক সেটআপ',
        desc: 'যাচাইকৃত ফোন নম্বর, অর্ডার, পণ্যের তালিকা এবং আয়ের পরিমাণ সরাসরি আপনার গুগল স্প্রেডশিটে সেভ করুন।',
        features: ['কোনো বিলম্ব ছাড়াই রো যোগ করার সুবিধা', 'চ্যানেল বা তারিখভিত্তিক আলাদা শিট', 'কাস্টম কলাম ম্যাপিং']
      },
      {
        id: 'hubspot',
        category: 'crm',
        name: 'হ্যাবস্পট সিআরএম ইন্টিগ্রেশন',
        partnerTag: 'সিআরএম কানেক্টর',
        setupTime: '⚡ ও-অথ সংযোগ',
        desc: 'যোগ্য রিটেল লিড, কথোপকথনের বিবরণ এবং ডিল পর্যায় সরাসরি আপনার হ্যাবস্পট সেলস পাইপলাইনে যুক্ত করুন।',
        features: ['লিড কন্টাক্ট টাইমলাইন সংরক্ষণ', 'স্বয়ংক্রিয় ডিল তৈরি', 'কাস্টম প্রপার্টি ম্যাপিং']
      },
      {
        id: 'webhooks',
        category: 'crm',
        name: 'কাস্টম রেস্ট এপিআই ও ওয়েবহুক',
        partnerTag: 'ডেভেলপার প্ল্যাটফর্ম',
        setupTime: '⚡ HMAC SHA-256',
        desc: 'রিয়েল-টাইম JSON ওয়েবহুক এবং REST এন্ডপয়েন্টের মাধ্যমে আপনার নিজস্ব ERP, ওয়্যারহাউস বা POS সফটওয়্যার যুক্ত করুন।',
        features: ['HMAC SHA-256 নিরাপত্তা সিগনেচার', 'সাব-সেকেন্ড ইভেন্ট ডেলিভারি', 'ফুল রিকোয়েস্ট রিট্রাই কিউ']
      }
    ],
    securityTitle: 'মেটার অফিশিয়াল এন্টারপ্রাইজ ক্লাউড এন্ডপয়েন্টে নির্মিত',
    securityDesc: 'কোনো অনিরাপদ ব্রাউজার অটোমেশন নয়। সকল চ্যানেল সরাসরি ভেরিফাইড এপিআই-এর মাধ্যমে যুক্ত হয়।',
    sec1Title: 'অফিসিয়াল মেটা ভেরিফাইড',
    sec1Desc: 'মেটা গ্রাফ এপিআই-এর সরাসরি সংযোগ ১০০% অ্যাকাউন্ট নিরাপত্তা এবং জিরো ব্যান ঝুঁকি নিশ্চিত করে।',
    sec2Title: 'এন্ড-টু-এন্ড এনক্রিপশন',
    sec2Desc: 'গ্রাহকের বার্তা এবং অর্ডারের তথ্য TLS 1.3 ও AES-256 ডাটা সুরক্ষার মাধ্যমে আদান-প্রদান করা হয়।',
    sec3Title: '৯৯.৯৯% আপটাইম গ্যারান্টি',
    sec3Desc: 'মাল্টি-রিজিয়ন কিউ আর্কিটেকচার ভাইরাল বিক্রয়ের সময়েও কোনো বার্তা মিস হতে দেয় না।',
    ctaTitle: 'কাস্টম সিআরএম বা ইআরপি ইন্টিগ্রেশন প্রয়োজন?',
    ctaDesc: 'আমাদের ইঞ্জিনিয়ারিং দল বড় রিটেইলারদের জন্য কাস্টম ইনভেন্টরি, ওয়্যারহাউস এবং পেমেন্ট গেটওয়ে ইন্টিগ্রেশন সম্পন্ন করে দেয়।',
    ctaBtnDemo: 'লাইভ ইন্টিগ্রেশন ডেমো শিডিউল করুন',
    ctaBtnTalk: 'ইন্টিগ্রেশন ইঞ্জিনিয়ারের সাথে কথা বলুন'
  },

  es: {
    badge: 'ECOSISTEMA Y CONECTIVIDAD',
    title: 'Conecte toda su infraestructura comercial en minutos',
    subtitle: 'APIs oficiales de Meta Cloud, tiendas de comercio electrónico, empresas de logística y CRM: sincronización perfecta sin necesidad de código.',
    categories: [
      { id: 'all', label: 'Todas las Integraciones' },
      { id: 'meta', label: 'Canales de Meta' },
      { id: 'ecommerce', label: 'Comercio Electrónico' },
      { id: 'logistics', label: 'Logística y Paquetería' },
      { id: 'crm', label: 'CRM y Datos' }
    ],
    items: [
      {
        id: 'whatsapp',
        category: 'meta',
        name: 'WhatsApp Business Cloud',
        partnerTag: 'Socio Oficial de Meta',
        setupTime: '⚡ Configuración en 2 min',
        desc: 'API oficial de Meta Cloud. Automatiza conversaciones privadas, catálogos, botones interactivos y alertas de envío.',
        features: ['Compatible con verificación oficial', 'Botones interactivos y listas', 'Alertas automáticas de paquetería']
      },
      {
        id: 'instagram',
        category: 'meta',
        name: 'Automatización de Instagram Direct',
        partnerTag: 'API Oficial de Meta Graph',
        setupTime: '⚡ Conexión en 1 clic',
        desc: 'Integración directa con Instagram Professional. Responde historias, comentarios y mensajes privados con tarjetas de producto.',
        features: ['Respuestas a menciones de historias', 'Disparadores de comentario a DM', 'Catálogo de productos en chat']
      },
      {
        id: 'messenger',
        category: 'meta',
        name: 'Páginas de Facebook Messenger',
        partnerTag: 'API Oficial de Meta Graph',
        setupTime: '⚡ Conexión en 1 clic',
        desc: 'Sincroniza la bandeja de entrada de su página comercial. Convierte prospectos de anuncios de mensajes en ventas confirmadas al instante.',
        features: ['Conversión rápida de anuncios', 'Bandeja consolidada multipágina', 'Guardado automático de contactos']
      },
      {
        id: 'webchat',
        category: 'meta',
        name: 'SDK de Chat en Vivo para Web',
        partnerTag: 'Script JS Integrable',
        setupTime: '⚡ Código para copiar y pegar',
        desc: 'Widget de chat ligero y ultra veloz para su tienda o sitio web. Capta visitantes y pedidos sin afectar la velocidad de carga.',
        features: ['Script asíncrono menor a 20kb', 'Color y avatar personalizables', 'Conversión fluida de visitante a comprador']
      },
      {
        id: 'shopify',
        category: 'ecommerce',
        name: 'Sincronización con Shopify',
        partnerTag: 'Aplicación Directa OAuth',
        setupTime: '⚡ Sincro en tiempo real',
        desc: 'Sincronización bidireccional con Shopify. Reserva de existencias en vivo, búsqueda de variantes y creación automática de pedidos.',
        features: ['Balance de SKU en tiempo real', 'Sincro de pedidos y clientes', 'Validación de cupones de descuento']
      },
      {
        id: 'woocommerce',
        category: 'ecommerce',
        name: 'WooCommerce API v3',
        partnerTag: 'Integración REST',
        setupTime: '⚡ Configuración en 3 min',
        desc: 'Conecte su tienda WordPress WooCommerce. Busque productos, verifique stock y envíe pedidos confirmados en chat al instante.',
        features: ['Creación automática de pedidos en WP', 'Sincronización de direcciones de facturación', 'Indexación de categorías en vivo']
      },
      {
        id: 'steadfast',
        category: 'logistics',
        name: 'API de Paquetería Steadfast',
        partnerTag: 'Logística Regional',
        setupTime: '⚡ Despacho automático',
        desc: 'Genera números de seguimiento e imprime facturas en el segundo en que se confirma un pedido en WhatsApp o Messenger.',
        features: ['Generación automática de guía', 'Cobertura metropolitana y nacional', 'Consulta de estado de envío en chat']
      },
      {
        id: 'pathao',
        category: 'logistics',
        name: 'Integración de Envíos Pathao',
        partnerTag: 'Socio de Comercios',
        setupTime: '⚡ Despacho automático',
        desc: 'Reserva directa de envíos mediante la API comercial de Pathao. Envía teléfono, dirección y cobro contra entrega con recogida automática.',
        features: ['Solicitudes de recogida instantáneas', 'Actualizaciones por webhook en tiempo real', 'Conciliación automática de cobro']
      },
      {
        id: 'redx',
        category: 'logistics',
        name: 'API de Logística RedX',
        partnerTag: 'Distribución Empresarial',
        setupTime: '⚡ Despacho automático',
        desc: 'Logística y distribución integral. Despacho automatizado de paquetes, facturas y alertas al chat del comprador.',
        features: ['Mapeo de cobertura completa', 'Enlace de seguimiento enviado al comprador', 'Alertas de devolución automatizadas']
      },
      {
        id: 'sheets',
        category: 'crm',
        name: 'Sincronización con Google Sheets',
        partnerTag: 'Sincronización en la Nube',
        setupTime: '⚡ Configuración instantánea',
        desc: 'Guarde de inmediato teléfonos verificados, pedidos, artículos adquiridos y montos de ventas en su hoja de cálculo.',
        features: ['Inserción de filas sin demora', 'Hojas separadas por canal o fecha', 'Mapeo personalizado de columnas']
      },
      {
        id: 'hubspot',
        category: 'crm',
        name: 'Integración con HubSpot CRM',
        partnerTag: 'Conector de CRM',
        setupTime: '⚡ Conexión OAuth',
        desc: 'Sincronice prospectos calificados, transcripciones de chats y etapas de venta directamente en su pipeline de HubSpot.',
        features: ['Registro de cronología del contacto', 'Creación automática de negocios', 'Mapeo de propiedades a medida']
      },
      {
        id: 'webhooks',
        category: 'crm',
        name: 'API REST y Webhooks Personalizados',
        partnerTag: 'Plataforma para Desarrolladores',
        setupTime: '⚡ HMAC SHA-256',
        desc: 'Conecte su ERP propio, sistema de almacén o terminal punto de venta con webhooks JSON en tiempo real y endpoints REST.',
        features: ['Firma de seguridad HMAC SHA-256', 'Entrega de eventos en milisegundos', 'Cola de reintentos completa']
      }
    ],
    securityTitle: 'Construido sobre puntos de enlace empresariales de Meta',
    securityDesc: 'Sin automatizaciones de navegador no oficiales ni emuladores riesgosos. Todos los canales se conectan con APIs oficiales.',
    sec1Title: 'Verificado Oficial por Meta',
    sec1Desc: 'Conexión directa con la API Meta Graph garantizando 100% de seguridad y cero riesgo de bloqueos.',
    sec2Title: 'Cifrado de Extremo a Extremo',
    sec2Desc: 'Los mensajes de clientes y pedidos se transmiten sobre TLS 1.3 con protección de datos AES-256.',
    sec3Title: 'Garantía de Disponibilidad del 99.99%',
    sec3Desc: 'Arquitectura de colas multirregión que asegura cero pérdida de mensajes durante eventos virales de venta.',
    ctaTitle: '¿Requiere una integración de CRM o ERP a medida?',
    ctaDesc: 'Nuestro equipo de ingeniería conecta sistemas de inventario propietarios, software de almacén y pasarelas para grandes minoristas.',
    ctaBtnDemo: 'Programar Demo de Integraciones',
    ctaBtnTalk: 'Hablar con Ingeniero de Integración'
  }
};

export function WebsiteIntegrationsPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const langKey = ['en', 'bn', 'es'].includes(currentLang) ? currentLang : 'en';
  const data = INTEGRATIONS_LANG_DATA[langKey] || INTEGRATIONS_LANG_DATA.en;

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = selectedCategory === 'all'
    ? data.items
    : data.items.filter(i => i.category === selectedCategory);

  return (
    <div className="integrations-page-wrapper" style={{ padding: 'var(--space-12) 0 var(--space-20) 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: 'var(--space-10)' }}>
          <span className="badge badge-mint" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {data.badge}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            {data.title}
          </h1>
          <p style={{ maxWidth: '680px', margin: '0 auto', fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {data.subtitle}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', overflowX: 'auto', padding: '4px' }}>
          <div className="capsule-filter-group" style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
            {data.categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`capsule-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: 750,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid (Clean Boxes for Web & Mobile) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3.5rem'
        }}>
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF',
                border: '1.5px solid var(--border)',
                borderRadius: '20px',
                padding: '1.75rem',
                boxShadow: '0 4px 16px rgba(9, 42, 32, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span className="badge badge-mint" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                    {item.partnerTag}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', fontWeight: 700, background: 'rgba(15, 169, 104, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                    {item.setupTime}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {item.name}
                </h3>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {item.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Reliability Strip */}
        <div style={{
          background: 'var(--mint-soft)',
          border: '1.5px solid rgba(15, 169, 104, 0.25)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '3.5rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
              {data.securityTitle}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0.25rem auto 0 auto' }}>
              {data.securityDesc}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {data.sec1Title}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                {data.sec1Desc}
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {data.sec2Title}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                {data.sec2Desc}
              </p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.25rem' }}>
                {data.sec3Title}
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                {data.sec3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div style={{
          background: 'var(--primary-dark)',
          borderRadius: '24px',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          color: '#FFFFFF',
          border: '1.5px solid rgba(15, 169, 104, 0.3)'
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            {data.ctaTitle}
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto 1.75rem auto', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.975rem', lineHeight: 1.6 }}>
            {data.ctaDesc}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigate('book-demo')}
              style={{ background: 'var(--green)', borderColor: 'var(--green)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>{data.ctaBtnDemo}</span>
              <ArrowRight size={17} />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('contact')}
              style={{ background: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '999px', color: '#FFFFFF' }}
            >
              <span>{data.ctaBtnTalk}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
