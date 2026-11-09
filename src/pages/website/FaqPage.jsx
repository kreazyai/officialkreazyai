import React, { useState } from 'react';
import { ChevronDown, Search, ArrowRight, MessageSquare, Headphones } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';

const FAQ_ITEMS_EN = [
  {
    category: 'General',
    q: 'What is KreazyAI and who is it designed for?',
    a: 'KreazyAI is an AI-powered business automation platform designed for modern online retailers and multi-channel commerce brands. It automates customer conversations, product sizing guidance, order capturing, and customer operations across WhatsApp, Instagram, and Facebook Messenger.'
  },
  {
    category: 'General',
    q: 'How is KreazyAI different from a standard support chatbot?',
    a: 'Traditional chatbots only serve canned answers or pass links. KreazyAI functions as an autonomous commerce agent: it connects directly to your live product catalog, checks inventory, answers sizing questions based on real specs, generates secure checkout links, and writes orders to your backend.'
  },
  {
    category: 'AI',
    q: 'How does the AI know my products and policies?',
    a: 'During setup, you connect your store catalog or upload product information, sizing specifications, FAQs, and policies. KreazyAI grounds every response in your verified data and adheres to confidence thresholds to prevent hallucinations.'
  },
  {
    category: 'AI',
    q: 'Can the AI speak multiple languages?',
    a: 'Yes. KreazyAI natively detects the customer language (including English, Spanish, Bengali, and Banglish) and responds fluently in that language while maintaining your brand tone.'
  },
  {
    category: 'Integrations',
    q: 'Does KreazyAI use official Meta APIs?',
    a: 'Yes. We strictly utilize official Meta Cloud APIs for WhatsApp Business, Instagram Graph, and Facebook Pages. There are no unofficial scrapers or browser extensions, protecting your business accounts from blocks or bans.'
  },
  {
    category: 'Integrations',
    q: 'Can I connect Shopify or WooCommerce?',
    a: 'Yes. We provide native real-time sync with Shopify and WooCommerce to automatically pull new products, update stock levels, and sync customer orders.'
  },
  {
    category: 'Orders',
    q: 'Can a customer place and pay for an order directly in WhatsApp or Instagram?',
    a: 'Yes. KreazyAI can generate direct secure checkout payment links or Cash on Delivery workflows. Once confirmed, the order is recorded in your KreazyAI dashboard.'
  },
  {
    category: 'Orders',
    q: 'How are delivery updates handled?',
    a: 'When an order status changes to "Shipped" and a tracking number is added, KreazyAI automatically sends an interactive courier update to the customer on the channel where they ordered.'
  },
  {
    category: 'Products',
    q: 'What happens when an item goes out of stock?',
    a: 'Because KreazyAI syncs with your inventory in real-time, the AI will immediately inform inquiring customers that the variant is currently out of stock and offer to recommend an in-stock alternative.'
  },
  {
    category: 'Security',
    q: 'Is customer conversational data secure and private?',
    a: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We never use your private store data, conversations, or customer records to train public AI models.'
  },
  {
    category: 'Security',
    q: 'What prevents the AI from giving away unauthorized discounts?',
    a: 'You set strict rule-based boundaries in the AI Assistant Studio (e.g. maximum 10% discount). Any request beyond your predefined parameters is automatically declined or escalated to a human supervisor for approval.'
  },
  {
    category: 'Support',
    q: 'How does human handoff work if a customer demands a real person?',
    a: 'When a customer requests a human or expresses frustration, KreazyAI triggers a handoff event. The conversation is flagged in your inbox with full context and an AI-drafted reply, allowing your team to take over immediately.'
  },
  {
    category: 'Pricing',
    q: 'Can I change my plan or cancel at any time?',
    a: 'Yes. There are no long-term contracts on monthly plans. You can upgrade, downgrade, or cancel directly from your workspace billing settings at any time.'
  }
];

const FAQ_ITEMS_BN = [
  {
    category: 'সাধারণ',
    q: 'ক্রেজি এআই কী এবং এটি কাদের জন্য তৈরি?',
    a: 'ক্রেজি এআই হলো আধুনিক অনলাইন রিটেইলার এবং সোশ্যাল কমার্স ব্র্যান্ডগুলোর জন্য একটি এআই চালিত অটোমেশন প্ল্যাটফর্ম। এটি হোয়াটসঅ্যাপ, ইনস্টাগ্রাম এবং ফেসবুক মেসেঞ্জারে কাস্টমার চ্যাট, সাইজ গাইড, অর্ডার গ্রহণ এবং কাস্টমার অপারেশন অটোমেট করে।'
  },
  {
    category: 'সাধারণ',
    q: 'সাধারণ চ্যাটবটের সাথে ক্রেজি এআই-র পার্থক্য কী?',
    a: 'সাধারণ চ্যাটবট শুধু নির্দিষ্ট উত্তর দেয় বা লিংক পাঠায়। অন্যদিকে ক্রেজি এআই একটি স্বয়ংক্রিয় কমার্স এজেন্ট হিসেবে কাজ করে: এটি সরাসরি আপনার লাইভ প্রোডাক্ট ক্যাটালগে স্টক চেক করে, সাইজের প্রশ্নের উত্তর দেয়, সিকিউর চেকআউট লিংক তৈরি করে এবং ড্যাশবোর্ডে অর্ডার এন্ট্রি করে।'
  },
  {
    category: 'এআই',
    q: 'এআই কীভাবে আমার পণ্য এবং শপের নিয়মাবলী জানে?',
    a: 'সেটআপের সময় আপনি আপনার ক্যাটালগ বা পণ্যের তথ্য, সাইজ স্পেসিফিকেশন, এফএকিউ এবং পলিসি যুক্ত করেন। ক্রেজি এআই কোনো ভুল তথ্য (হ্যালুসিনেশন) এড়াতে strictly আপনার ডেটার ওপর ভিত্তি করে উত্তর দেয়।'
  },
  {
    category: 'এআই',
    q: 'এআই কি একাধিক ভাষা বুঝতে পারে?',
    a: 'হ্যাঁ। ক্রেজি এআই বাংলা, বাংলিশ, ইংরেজি এবং স্প্যানিশসহ একাধিক ভাষা স্বয়ংক্রিয়ভাবে শনাক্ত করে স্বাভাবিক ও মার্জিত ভাষায় উত্তর দিতে পারে।'
  },
  {
    category: 'ইন্টিগ্রেশন',
    q: 'ক্রেজি এআই কি অফিসিয়াল মেটা এপিআই ব্যবহার করে?',
    a: 'হ্যাঁ। আমরা হোয়াটসঅ্যাপ বিজনেস, ইনস্টাগ্রাম এবং ফেসবুকের জন্য অফিশিয়াল মেটা ক্লাউড এপিআই ব্যবহার করি। কোনো আনঅফিসিয়াল স্ক্র্যাপার বা এক্সটেনশন ব্যবহার করা হয় না, ফলে আপনার অ্যাকাউন্ট নিরাপদ থাকে।'
  },
  {
    category: 'ইন্টিগ্রেশন',
    q: 'আমি কি শপিফাই বা উউকমার্স কানেক্ট করতে পারি?',
    a: 'হ্যাঁ। নতুন প্রোডাক্ট আপলোড, স্টক আপডেট এবং অর্ডার সিঙ্ক করার জন্য আমাদের রিয়েল-টাইম শপিফাই ও উউকমার্স ইন্টিগ্রেশন রয়েছে।'
  },
  {
    category: 'অর্ডার',
    q: 'গ্রাহকরা কি হোয়াটসঅ্যাপ বা ইনস্টাগ্রাম চ্যাটের ভেতর সরাসরি পেমেন্ট করতে পারবে?',
    a: 'হ্যাঁ। ক্রেজি এআই দেশীয় বিকাশ, নগদ, ক্যাশ অন ডেলিভারি (COD) অথবা কার্ড পেমেন্টের মাধ্যমে অর্ডার কনফার্ম করে ড্যাশবোর্ডে সংরক্ষণ করে।'
  },
  {
    category: 'অর্ডার',
    q: 'ডেলিভারি আপডেট কীভাবে ট্র্যাক হয়?',
    a: 'অর্ডারের স্ট্যাটাস "Shipped" হলে এবং ট্র্যাকিং নম্বর যোগ হলে, ক্রেজি এআই স্বয়ংক্রিয়ভাবে গ্রাহকের সংশ্লিষ্ট চ্যাটে কুরিয়ার ট্র্যাকিং লিংক পাঠিয়ে দেয়।'
  },
  {
    category: 'পণ্য',
    q: 'কোনো পণ্য স্টক আউট হলে কী ঘটে?',
    a: 'রিয়েল-টাইম ইনভেন্টরি সিঙ্ক থাকায়, এআই গ্রাহককে তাৎক্ষণিকভাবে জানায় যে পণ্যটি শেষ হয়ে গেছে এবং স্টকে থাকা অনুরূপ বিকল্প পণ্য দেখার পরামর্শ দেয়।'
  },
  {
    category: 'নিরাপত্তা',
    q: 'গ্রাহকের চ্যাট ডেটা কতটা নিরাপদ ও গোপনীয়?',
    a: 'সব ডেটা TLS 1.3 এবং AES-256 এনক্রিপশনের মাধ্যমে সম্পূর্ণ সুরক্ষিত। আপনার কোনো ব্যক্তিগত ডেটা বা চ্যাট হিস্ট্রি পাবলিক এআই মডেল ট্রেইনিংয়ে ব্যবহার করা হয় না।'
  },
  {
    category: 'নিরাপত্তা',
    q: 'এআই যাতে অতিরিক্ত ডিসকাউন্ট না দেয় তার কি কোনো নিয়ন্ত্রণ আছে?',
    a: 'হ্যাঁ। আপনি স্টুডিওতে সর্বোচ্চ ডিসকাউন্ট সীমা (যেমন সর্বোচ্চ ১০%) নির্ধারণ করে দিতে পারেন। সীমার বাইরে কোনো অনুরোধ এলে এআই তা প্রত্যাখ্যান করে বা অনুমোদনের জন্য টিমের কাছে পাঠায়।'
  },
  {
    category: 'সাপোর্ট',
    q: 'গ্রাহক মানুষের সাথে কথা বলতে চাইলে কীভাবে কাজ করে?',
    a: 'গ্রাহক প্রতিনিধির সাথে কথা বলতে চাইলে সাথে সাথে নোটিফিকেশন আসে এবং সম্পূর্ণ চ্যাট হিস্ট্রিসহ এক ক্লিকে আপনার প্রতিনিধি দায়িত্ব নিতে পারেন।'
  },
  {
    category: 'প্রাইসিং',
    q: 'আমি কি যেকোনো সময় প্ল্যান পরিবর্তন বা বাতিল করতে পারি?',
    a: 'হ্যাঁ। কোনো দীর্ঘমেয়াদী চুক্তির বাধ্যবাধকতা নেই। আপনি যেকোনো সময় আপনার ওয়ার্কস্পেস থেকে প্ল্যান পরিবর্তন বা বাতিল করতে পারবেন।'
  }
];

const FAQ_ITEMS_ES = [
  {
    category: 'General',
    q: '¿Qué es KreazyAI y para quién está diseñado?',
    a: 'KreazyAI es una plataforma de automatización de comercio impulsada por IA diseñada para marcas y minoristas modernos. Automatiza conversaciones con clientes, asesoría de tallas, toma de pedidos y soporte en WhatsApp, Instagram y Facebook Messenger.'
  },
  {
    category: 'General',
    q: '¿En qué se diferencia KreazyAI de un chatbot convencional?',
    a: 'Los chatbots tradicionales solo envían respuestas fijas o enlaces externos. KreazyAI funciona como un agente comercial autónomo: se conecta a tu catálogo en vivo, consulta existencias, resuelve dudas de tallas, genera enlaces de pago seguros y registra pedidos en tu sistema.'
  },
  {
    category: 'IA',
    q: '¿Cómo conoce la IA mis productos y políticas de tienda?',
    a: 'Durante la configuración inicial, vinculas tu catálogo de productos o cargas especificaciones de tallas, preguntas frecuentes y políticas. KreazyAI responde basándose estrictamente en tus datos verificados para evitar alucinaciones.'
  },
  {
    category: 'IA',
    q: '¿Puede la IA comunicarse en múltiples idiomas?',
    a: 'Sí. KreazyAI detecta de forma nativa el idioma del cliente (incluyendo español, inglés y bengalí) y responde fluidamente respetando el tono de tu marca.'
  },
  {
    category: 'Integraciones',
    q: '¿Utiliza KreazyAI las APIs oficiales de Meta?',
    a: 'Sí. Utilizamos estrictamente las APIs oficiales de Meta Cloud para WhatsApp Business, Instagram Graph y Facebook Pages, protegiendo tus cuentas de cualquier riesgo de bloqueo o suspensión.'
  },
  {
    category: 'Integraciones',
    q: '¿Puedo conectar Shopify o WooCommerce?',
    a: 'Sí. Ofrecemos sincronización nativa en tiempo real con Shopify y WooCommerce para actualizar productos, niveles de inventario y pedidos.'
  },
  {
    category: 'Pedidos',
    q: '¿Pueden los clientes comprar y pagar directamente en WhatsApp o Instagram?',
    a: 'Sí. KreazyAI puede generar enlaces de pago seguros o registrar pedidos contra entrega directamente en el chat, guardando la transacción confirmada en tu panel.'
  },
  {
    category: 'Pedidos',
    q: '¿Cómo se gestionan las actualizaciones de envío?',
    a: 'Cuando el pedido cambia a estado "Enviado" con número de guía, KreazyAI envía automáticamente un enlace de rastreo interactivo al cliente en su mismo chat.'
  },
  {
    category: 'Productos',
    q: '¿Qué sucede si un artículo se queda sin existencias?',
    a: 'Al sincronizarse en tiempo real con tu inventario, la IA informa al comprador que la talla o variante está agotada y le recomienda alternativas disponibles en stock.'
  },
  {
    category: 'Seguridad',
    q: '¿Están protegidos y seguros los datos de mis clientes?',
    a: 'Toda la información está cifrada en tránsito (TLS 1.3) y en reposo (AES-256). Nunca usamos tus datos de clientes ni conversaciones para entrenar modelos públicos de IA.'
  },
  {
    category: 'Seguridad',
    q: '¿Qué evita que la IA ofrezca descuentos no autorizados?',
    a: 'Puedes definir límites estrictos basados en reglas (por ejemplo, descuento máximo del 10%). Cualquier solicitud que supere este parámetro se rechaza o escala a un supervisor humano.'
  },
  {
    category: 'Soporte',
    q: '¿Cómo funciona la transferencia a asesores humanos?',
    a: 'Cuando un cliente solicita hablar con una persona real, KreazyAI transfiere el caso de inmediato. La conversación se marca en tu bandeja con el historial y un borrador sugerido por IA.'
  },
  {
    category: 'Precios',
    q: '¿Puedo cambiar de plan o cancelar en cualquier momento?',
    a: 'Sí. No hay contratos forzosos. Puedes cambiar de plan o cancelar tu suscripción desde el panel en cualquier momento sin penalizaciones.'
  }
];

export function FaqPage({ onNavigate }) {
  const { currentLang } = useLanguage();
  const [selectedCat, setSelectedCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const faqItems = currentLang === 'bn' ? FAQ_ITEMS_BN : currentLang === 'es' ? FAQ_ITEMS_ES : FAQ_ITEMS_EN;

  const categories = currentLang === 'bn' 
    ? ['সব', 'সাধারণ', 'এআই', 'ইন্টিগ্রেশন', 'অর্ডার', 'পণ্য', 'নিরাপত্তা', 'সাপোর্ট', 'প্রাইসিং']
    : currentLang === 'es'
    ? ['Todos', 'General', 'IA', 'Integraciones', 'Pedidos', 'Productos', 'Seguridad', 'Soporte', 'Precios']
    : ['All', 'General', 'AI', 'Integrations', 'Orders', 'Products', 'Security', 'Support', 'Pricing'];

  const allCategoryLabel = categories[0];

  const toggleItem = (idx) => {
    setOpenItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredFaqs = faqItems.filter(item => {
    const matchesCat = selectedCat === 'All' || selectedCat === allCategoryLabel || item.category === selectedCat;
    const matchesSearch = item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const texts = {
    en: {
      title: 'Everything you need to know about KreazyAI',
      subtitle: 'Learn about our AI architecture, Meta channel connections, order workflows, and safety controls.',
      searchPlaceholder: 'Search questions by keyword (e.g. Meta, pricing, handoff, WhatsApp)...',
      noMatchTitle: 'No matching questions found',
      noMatchDesc: 'Try searching for a different keyword or choose another category.',
      stillTitle: 'Still have questions?',
      stillDesc: "Can't find what you're looking for? Our solutions team is available to walk you through our platform.",
      bookBtn: 'Book a 1-on-1 Demo'
    },
    bn: {
      title: 'ক্রেজি এআই সম্পর্কে আপনার যা কিছু জানা দরকার',
      subtitle: 'আমাদের এআই আর্কিটেকচার, মেটা চ্যানেল ইন্টিগ্রেশন, অর্ডার ওয়ার্কফ্লো এবং নিরাপত্তা ব্যবস্থা সম্পর্কে জানুন।',
      searchPlaceholder: 'প্রশ্ন খুঁজুন (যেমন: মেটা, প্রাইসিং, বিকাশ, হোয়াটসঅ্যাপ)...',
      noMatchTitle: 'কোনো প্রশ্ন খুঁজে পাওয়া যায়নি',
      noMatchDesc: 'অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করুন অথবা অন্য ক্যাটাগরি বেছে নিন।',
      stillTitle: 'আরও কিছু জানার আছে?',
      stillDesc: 'আপনার প্রয়োজনীয় উত্তর খুঁজে পাননি? আমাদের টিম আপনাকে প্ল্যাটফর্মটি সরাসরি বুঝিয়ে দেবে।',
      bookBtn: '১-অন-১ ডেমো বুক করুন'
    },
    es: {
      title: 'Todo lo que necesitas saber sobre KreazyAI',
      subtitle: 'Conoce nuestra arquitectura de IA, conexiones de Meta, flujos de pedidos y controles de seguridad.',
      searchPlaceholder: 'Buscar preguntas por palabra clave (ej. Meta, precios, transferencia, WhatsApp)...',
      noMatchTitle: 'No se encontraron preguntas coincidentes',
      noMatchDesc: 'Intenta buscar con otra palabra clave o selecciona otra categoría.',
      stillTitle: '¿Aún tienes preguntas?',
      stillDesc: '¿No encuentras lo que buscas? Nuestro equipo de soluciones está disponible para guiarte en la plataforma.',
      bookBtn: 'Agendar Demo 1 a 1'
    }
  };

  const t = texts[currentLang] || texts.en;

  return (
    <div style={{ padding: 'clamp(2.5rem, 5vw, 4rem) 0 clamp(4rem, 8vw, 6rem) 0' }}>
      <div className="container" style={{ maxWidth: '880px' }}>
        {/* Header */}
        <div style={{ maxWidth: '780px', margin: '0 auto clamp(2rem, 4vw, 3.25rem) auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4.5vw, 3.25rem)', fontWeight: 850, letterSpacing: '-0.04em', lineHeight: 1.08, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
            {t.title}
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {t.subtitle}
          </p>
        </div>

        {/* Search Bar in clean container */}
        <div style={{ position: 'relative', maxWidth: '680px', margin: '0 auto var(--space-8) auto' }}>
          <Input
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <div className="capsule-filter-group" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((cat, idx) => {
              const isSelected = selectedCat === cat || (idx === 0 && (selectedCat === 'All' || selectedCat === allCategoryLabel));
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(idx === 0 ? 'All' : cat)}
                  className={`capsule-filter-btn ${isSelected ? 'active' : ''}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ List in Distinct Modular Boxes */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openItems[idx];
              return (
                <div key={idx} className={`faq-box ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => toggleItem(idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <div className="faq-trigger-icon">
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="faq-answer">
                      <p>{faq.a}</p>
                      <div style={{ marginTop: '0.85rem' }}>
                        <Badge variant="mint">{faq.category}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="state-box" style={{ background: 'rgba(18, 24, 38, 0.72)', border: '1px solid var(--border)', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>{t.noMatchTitle}</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{t.noMatchDesc}</p>
            </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div style={{
          marginTop: 'clamp(3rem, 6vw, 4.5rem)',
          background: 'rgba(18, 24, 38, 0.72)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'clamp(2rem, 4vw, 3rem) 2rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(9, 42, 32, 0.05)'
        }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
            {t.stillTitle}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 1.5rem auto', lineHeight: 1.6 }}>
            {t.stillDesc}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => onNavigate && onNavigate('book-demo')} iconRight={ArrowRight}>
              {t.bookBtn}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
