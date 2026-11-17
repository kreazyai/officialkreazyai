import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ChevronLeft, 
  ChevronDown, 
  MoreHorizontal, 
  ExternalLink, 
  Paperclip, 
  Smile, 
  Mic, 
  Home, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  Truck
} from 'lucide-react';
import { leadService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import '../../styles/chatWidget.css';

// ─── LANGUAGE DETECTION ENGINE ──────────────────────────────────────────────
function detectLanguage(text) {
  if (!text) return 'en';
  const clean = text.toLowerCase().trim();

  // 1. Bengali Unicode Character Range
  if (/[\u0980-\u09FF]/.test(text)) {
    return 'bn';
  }

  // 2. Banglish Phonetic Patterns
  const banglishWords = [
    'koto', 'dam', 'dam koto', 'dam koto?', 'taka', 'tk', 'kivabe', 'ki vabe', 'ki bhabe',
    'kaj kore', 'shuru', 'shuru korbo', 'lagbe', 'chai', 'parbo', 'dekhabo', 'apnader',
    'apnar', 'amar', 'amake', 'thikana', 'kotha', 'bolte', 'bhai', 'vai', 'kono',
    'achhe', 'ase', 'hobe', 'korbo', 'parbe', 'jante', 'dhonnobad', 'dhonno', 'shob',
    'bhalo', 'deben', 'nibona', 'korte', 'pari', 'dorkar', 'keno', 'aro', 'ekhon'
  ];
  if (banglishWords.some(w => clean.includes(w))) {
    return 'bn';
  }

  // 3. Spanish Accents & Vocabulary
  if (/[áéíóúüñ¿¡]/.test(text)) {
    return 'es';
  }
  const spanishWords = [
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'precios', 'precio',
    'planes', 'plan', 'cuanto', 'cuánto', 'cuesta', 'como funciona', 'cómo funciona',
    'servicios', 'servicio', 'mejor', 'ayuda', 'demostracion', 'demostración', 'demo',
    'tienda', 'ventas', 'pedidos', 'gracias', 'quiero', 'por favor', 'informacion',
    'información', 'asesor', 'soporte'
  ];
  if (spanishWords.some(w => clean.includes(w))) {
    return 'es';
  }

  return 'en';
}

// ─── FORMAT TEXT WITH BOLD HIGHLIGHTS & BULLETS ─────────────────────────────
function formatMessageContent(text, onNavigate) {
  if (!text) return null;
  const lines = text.split('\n');

  return lines.map((line, lIdx) => {
    if (line.trim() === '') {
      return <div key={lIdx} style={{ height: '8px' }} />;
    }

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    const parts = line.split(/(\*\*[^*]+\*\*|compare plans page|pricing page|প্রাইসিং পেজে|লাইভ ডেমো|página de precios)/gi);

    return (
      <div key={lIdx} style={{ marginBottom: '4px', paddingLeft: isBullet ? '6px' : '0' }}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} style={{ fontWeight: 700, color: '#111827' }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (
            part.toLowerCase() === 'compare plans page' || 
            part.toLowerCase() === 'pricing page' ||
            part.toLowerCase() === 'প্রাইসিং পেজে' ||
            part.toLowerCase() === 'página de precios'
          ) {
            return (
              <button
                key={pIdx}
                type="button"
                onClick={() => onNavigate && onNavigate('pricing')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#481577',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit'
                }}
              >
                {part}
              </button>
            );
          }
          return part;
        })}
      </div>
    );
  });
}

export function WebsiteChatWidget({ onNavigate }) {
  const { currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('home'); // 'home' | 'chat'
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'messages'

  // Input states
  const [emailInput, setEmailInput] = useState(() => {
    try {
      return localStorage.getItem('kreazy_visitor_email') || '';
    } catch {
      return '';
    }
  });
  const [messageInput, setMessageInput] = useState('');
  const [searchHelpInput, setSearchHelpInput] = useState('');
  const [hasCapturedEmail, setHasCapturedEmail] = useState(() => {
    try {
      return !!localStorage.getItem('kreazy_visitor_email');
    } catch {
      return false;
    }
  });

  const [isTyping, setIsTyping] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  // Chat message stream
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'bot',
      text: "Hi there! \n\nWhat brings you here today?",
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Auto-scroll chat body on new message
  useEffect(() => {
    if (view === 'chat' && isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, view, isOpen]);

  // Global event listener to open chat from any CTA button
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setView('chat');
      setActiveTab('messages');
    };
    window.addEventListener('kreazy-open-chat', handleOpenChat);
    return () => window.removeEventListener('kreazy-open-chat', handleOpenChat);
  }, []);

  // Handle Help Center Search submit from Home view
  const handleHelpSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchHelpInput.trim();
    if (!query) return;

    setView('chat');
    setActiveTab('messages');
    setSearchHelpInput('');
    handleUserSendMessage(query);
  };

  // Bot response generation with Multilingual Intelligence
  const generateBotResponse = (userText) => {
    const lang = detectLanguage(userText);
    const clean = userText.toLowerCase();

    // ── 1. BANGLA / BANGLISH INTELLIGENCE ───────────────────────────────────
    if (lang === 'bn') {
      // Pricing / Cost / Plans
      if (
        clean.includes('dam') || clean.includes('দাম') || clean.includes('খরচ') ||
        clean.includes('koto') || clean.includes('কত') || clean.includes('টাকা') ||
        clean.includes('প্ল্যান') || clean.includes('plan') || clean.includes('pricing') ||
        clean.includes('price') || clean.includes('best service')
      ) {
        return {
          text: "এক মুহূর্ত অপেক্ষা করুন, আমি আমাদের ফিচার ও প্ল্যানগুলো দেখে নিচ্ছি।\n\nআপনার Kreazy AI স্টোরের লক্ষ্য ও প্রয়োজনীয়তার ওপর নির্ভর করবে সেরা সার্ভিস কোনটি!\n\nআমরা ৩টি সমন্বিত প্ল্যান অফার করি যা আপনার হোয়াটসঅ্যাপ ও ইনস্টাগ্রাম বিক্রয় সম্পূর্ণ স্বয়ংক্রিয় করে:\n\n1. **Starter প্ল্যান ($49 / মাস - ~৳৫,৮৮০)**: ১,০০০ মাসিক স্বয়ংক্রিয় কথোপকথন, ১টি মেটা ভেরিফাইড হোয়াটসঅ্যাপ নম্বর এবং রিয়েল-টাইম ক্যাটালগ সিঙ্ক।\n\n2. **Growth প্ল্যান ($119 / মাস - ~৳১৪,২৮০)**: ৫,০০০ মাসিক কথোপকথন, হোয়াটসঅ্যাপ + ইনস্টাগ্রাম + মেসেঞ্জার ওমনিচ্যানেল এবং ইন-চ্যাট ক্যাশ অন ডেলিভারি (COD) চেকআউট।\n\n3. **Scale প্ল্যান ($299 / মাস - ~৳৩৫,৮৮০)**: ২৫,০০০ মাসিক কথোপকথন, ডেডিকেটেড ম্যানেজার, কাস্টম এআই ট্রেনিং ও মাল্টিপল এজেন্ট হ্যান্ডঅফ।\n\nআপনি আমাদের **প্রাইসিং পেজে** বিস্তারিত ফিচার তুলনা দেখতে পারেন।\n\nআপনি কি মূলত সামাজিক মাধ্যমে সেলস বাড়াতে চান, গ্রাহক সেবাকে স্বয়ংক্রিয় করতে চান, নাকি ওমনিচ্যানেল কমার্স পরিচালনা করতে চান? আপনার স্টোর সম্পর্কে আমাকে বলুন!",
          actions: [
            { label: 'প্রাইসিং প্ল্যান দেখুন', type: 'navigate', target: 'pricing', icon: DollarSign },
            { label: 'লাইভ ডেমো বুক করুন', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // How it works / WhatsApp / Facebook
      if (
        clean.includes('kivabe') || clean.includes('কীভাবে') || clean.includes('kaj kore') ||
        clean.includes('কাজ') || clean.includes('whatsapp') || clean.includes('হোয়াটসঅ্যাপ') ||
        clean.includes('fb') || clean.includes('ফেসবুক') || clean.includes('অটোমেশন')
      ) {
        return {
          text: "Kreazy AI সরাসরি মেটার অফিসিয়াল ক্লাউড এপিআই-এর সাথে কাজ করে:\n\n১. **তাত্ক্ষণিক উত্তর**: গ্রাহক যেকোনো মেসেজ দিলে ২ সেকেন্ডের মধ্যে প্রোডাক্ট স্পেসিফিকেশন ও সাইজ সহ নির্ভুল উত্তর দেয়।\n\n২. **ইনভেন্টরি সিঙ্ক**: স্টকে প্রোডাক্ট আছে কি না যাচাই করে স্বয়ংক্রিয় সাইজ ও রঙের রিকমেন্ডেশন পাঠায়।\n\n৩. **অর্ডার কনফার্মেশন ও কুরিয়ার**: চ্যাটেই নাম, ঠিকানা ও ফোন নম্বর সংগ্রহ করে Steadfast, Pathao বা RedX-এ সরাসরি পার্সেল বুক করে দেয়।\n\nআপনি চাইলে এখনই আমাদের সাথে একটি ১৫ মিনিটের লাইভ ডেমো বুক করতে পারেন!",
          actions: [
            { label: 'লাইভ ডেমো বুক করুন', type: 'navigate', target: 'book-demo', icon: Calendar },
            { label: 'সলিউশনস দেখুন', type: 'navigate', target: 'solutions', icon: ArrowRight }
          ]
        };
      }

      // Courier & Logistics
      if (
        clean.includes('courier') || clean.includes('কুরিয়ার') || clean.includes('delivery') ||
        clean.includes('ডেলিভারি') || clean.includes('pathao') || clean.includes('steadfast') ||
        clean.includes('redx')
      ) {
        return {
          text: "Kreazy AI সরাসরি বাংলাদেশের শীর্ষ লজিস্টিকস প্ল্যাটফর্মের সাথে সংযুক্ত:\n\n• **Steadfast Courier**: এক ক্লিকে স্বয়ংক্রিয় ট্র্যাকিং আইডি ও পার্সেল বুকিং।\n• **Pathao Courier**: রিয়েল-টাইম ডেলিভারি আপডেট ও ওয়েবহুক সিঙ্ক।\n• **RedX & Paperfly**: অর্ডার বের হলে গ্রাহকের হোয়াটসঅ্যাপে অটো ট্র্যাকিং মেসেজ পাঠানো।",
          actions: [
            { label: 'ইন্টিগ্রেশনসমূহ দেখুন', type: 'navigate', target: 'integrations', icon: Truck },
            { label: 'লাইভ ডেমো বুক করুন', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // Demo Booking
      if (
        clean.includes('demo') || clean.includes('ডেমো') || clean.includes('walkthrough') ||
        clean.includes('দেখান') || clean.includes('দেখব')
      ) {
        return {
          text: "চমৎকার! আমাদের মার্চেন্ট কনসালটেন্ট আপনার স্টোরের জন্য একটি পারসোনালাইজড ১৫ মিনিটের লাইভ ডেমো পরিচালনা করবেন।\n\nডেমোতে আপনি সরাসরি আপনার ফেসবুক পেজ বা হোয়াটসঅ্যাপে কীভাবে স্বয়ংক্রিয়ভাবে প্রোডাক্ট বিক্রি ও অর্ডার কনফার্ম হবে তা দেখতে পাবেন।",
          actions: [
            { label: 'লাইভ ডেমো বুক করুন', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // Human Agent / Support
      if (
        clean.includes('manush') || clean.includes('মানুষ') || clean.includes('agent') ||
        clean.includes('kotha') || clean.includes('কথা') || clean.includes('bhai')
      ) {
        return {
          text: "আমাদের মার্চেন্ট সাপোর্ট টিম ২৪/৭ প্রস্তুত রয়েছে!\n\n• **সরাসরি হোয়াটসঅ্যাপ**: +880 1712-345678\n• **ইমেইল**: sales@kreazyai.com\n\nআপনার ফোন নম্বরটি এখানে লিখে পাঠালে আমাদের সিনিয়র অটোমেশন ইঞ্জিনিয়ার ১৫ মিনিটের মধ্যে আপনার সাথে যোগাযোগ করবেন।",
          actions: [
            { label: 'সরাসরি হোয়াটসঅ্যাপে চ্যাট', type: 'whatsapp', target: '+8801712345678', icon: ArrowRight }
          ]
        };
      }

      // Polite / Thanks
      if (clean.includes('dhonnobad') || clean.includes('ধন্যবাদ') || clean.includes('thik ase') || clean.includes('accha')) {
        return {
          text: "আপনাকে অনেক ধন্যবাদ!  আপনার ব্যবসা সম্পর্কিত যেকোনো প্রশ্ন বা সহায়তার জন্য আমি সব সময় আছি। শুভকামনা!",
          actions: [
            { label: 'লাইভ ডেমো বুক করুন', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // Bangla General Fallback
      return {
        text: "ধন্যবাদ আপনার বার্তার জন্য! আমি Kreazy AI-এর সার্ভিস কোপাইলট। আপনার স্টোরের হোয়াটসঅ্যাপ, ইনস্টাগ্রাম বা মেসেঞ্জারে স্বয়ংক্রিয় বিক্রয় ও কাস্টমার সাপোর্ট শুরু করতে আমি কীভাবে আপনাকে সহায়তা করতে পারি?",
        actions: [
          { label: 'প্রাইসিং প্ল্যান দেখুন', type: 'navigate', target: 'pricing', icon: DollarSign },
          { label: 'লাইভ ডেমো বুক করুন', type: 'navigate', target: 'book-demo', icon: Calendar }
        ]
      };
    }

    // ── 2. SPANISH INTELLIGENCE ─────────────────────────────────────────────
    if (lang === 'es') {
      // Pricing / Best Service
      if (
        clean.includes('precio') || clean.includes('precios') || clean.includes('cuanto') ||
        clean.includes('cuánto') || clean.includes('planes') || clean.includes('plan') ||
        clean.includes('mejor servicio') || clean.includes('costo')
      ) {
        return {
          text: "Un momento mientras reviso nuestras funciones y planes para usted.\n\n¡El mejor servicio depende de lo que desee lograr con su tienda en Kreazy AI!\n\nOfrecemos planes Starter, Growth y Scale diseñados para desbloquear automatización avanzada en WhatsApp e Instagram:\n\n1. **Starter ($49 / mes)**: incluye 1,000 conversaciones automatizadas, 1 línea de WhatsApp Business y sincronización de catálogo en tiempo real.\n\n2. **Growth ($119 / mes)**: agrega omnicanalidad (WhatsApp + Instagram + Messenger), finalización de compra automatizada y enlaces de seguimiento logístico.\n\n3. **Scale ($299 / mes)**: ofrece 25,000 conversaciones automatizadas, herramientas de gestión de IA, transferencia a agentes humanos y entrenamiento personalizado de IA.\n\nPuede ver la comparativa completa de funciones y precios en nuestra **página de precios**.\n\n¿Desea utilizar Kreazy AI para ventas sociales, atención al cliente o comercio omnicanal? ¡Cuénteme qué funciones son más importantes para usted!",
          actions: [
            { label: 'Ver Planes de Precios', type: 'navigate', target: 'pricing', icon: DollarSign },
            { label: 'Reservar Demostración', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // How it works
      if (
        clean.includes('como funciona') || clean.includes('cómo funciona') ||
        clean.includes('whatsapp') || clean.includes('automatizacion') || clean.includes('automatización')
      ) {
        return {
          text: "Kreazy AI se conecta directamente a la API oficial de Meta Cloud:\n\n1. **Respuestas en menos de 2 segundos**: Responde preguntas sobre productos 24/7 sin tiempo de espera.\n\n2. **Catálogo e inventario en vivo**: Verifica tallas, colores y existencias en tiempo real.\n\n3. **Checkout dentro del chat**: Recopila la dirección de entrega y confirma pedidos al instante.\n\n¿Le gustaría agendar una demostración en vivo de 15 minutos?",
          actions: [
            { label: 'Agendar Demostración', type: 'navigate', target: 'book-demo', icon: Calendar },
            { label: 'Explorar Soluciones', type: 'navigate', target: 'solutions', icon: ArrowRight }
          ]
        };
      }

      // Demo
      if (clean.includes('demo') || clean.includes('demostracion') || clean.includes('demostración')) {
        return {
          text: "¡Con gusto! Nuestro equipo de arquitectos comerciales le mostrará una sesión personalizada de 15 minutos para ver la sincronización en vivo y pedidos automatizados.",
          actions: [
            { label: 'Reservar Demostración en Vivo', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // Thanks / Polite
      if (clean.includes('gracias') || clean.includes('ok') || clean.includes('perfecto')) {
        return {
          text: "¡De nada!  Estaré aquí si necesita algo más. ¡Mucho éxito con su negocio!",
          actions: [
            { label: 'Agendar Demostración', type: 'navigate', target: 'book-demo', icon: Calendar }
          ]
        };
      }

      // Spanish General Fallback
      return {
        text: "¡Hola! Gracias por contactarnos. Soy el Copiloto de IA de Kreazy AI. ¿En qué puedo ayudarle hoy con la automatización de sus ventas en WhatsApp e Instagram?",
        actions: [
          { label: 'Ver Precios', type: 'navigate', target: 'pricing', icon: DollarSign },
          { label: 'Reservar Demostración', type: 'navigate', target: 'book-demo', icon: Calendar }
        ]
      };
    }

    // ── 3. ENGLISH INTELLIGENCE (MATCHING Chatbot design(2).mp4) ─────────────
    // Best service / features / plans / pricing
    if (
      clean.includes('best service') || clean.includes('service') || clean.includes('features') ||
      clean.includes('pricing') || clean.includes('price') || clean.includes('cost') ||
      clean.includes('plan') || clean.includes('plans')
    ) {
      return {
        text: "One moment while I look into our features and plans for you.\n\nThe best service depends on what you're looking to achieve with your Kreazy AI store!\n\nWe offer Starter, Growth, and Scale plans that unlock advanced automation, deeper insights, and omnichannel sales tools:\n\n1. **Starter ($49/mo)** includes essentials like 1,000 automated chats, 1 WhatsApp Business line, and real-time stock sync.\n\n2. **Growth ($119/mo)** adds custom sales flows, WhatsApp + Instagram + Messenger omnichannel, and automated courier checkout.\n\n3. **Scale ($299/mo)** offers 25,000 automated chats, AI management tools, multi-agent human handoff, and dedicated AI model training.\n\nYou can check out full plan features and pricing on our **compare plans page**.\n\nAre you looking to use Kreazy AI for social selling, automated customer support, or multi-channel commerce? Let me know what features matter most to you!",
        actions: [
          { label: 'Compare Pricing Plans', type: 'navigate', target: 'pricing', icon: DollarSign },
          { label: 'Book a 1-on-1 Live Demo', type: 'navigate', target: 'book-demo', icon: Calendar }
        ]
      };
    }

    // Quick chips queries
    if (clean.includes('i have a question')) {
      return {
        text: "What can I help you with? Feel free to ask about WhatsApp automation, live catalog sync, courier tracking, or our pricing plans!",
        actions: [
          { label: 'Pricing Details', type: 'navigate', target: 'pricing', icon: DollarSign },
          { label: 'Book a Live Demo', type: 'navigate', target: 'book-demo', icon: Calendar }
        ]
      };
    }

    if (clean.includes('i found a bug')) {
      return {
        text: "We appreciate your help keeping Kreazy AI top tier! Please describe the issue you encountered, and our technical team will review and patch it right away.",
        actions: []
      };
    }

    if (clean.includes('i have product feedback')) {
      return {
        text: "We love hearing from our merchants! What feature or enhancement would help your store sell faster on WhatsApp and Instagram?",
        actions: []
      };
    }

    // Demo & consultation
    if (clean.includes('demo') || clean.includes('walkthrough') || clean.includes('meeting') || clean.includes('consultation')) {
      return {
        text: "We'd love to give you a personalized 15-minute consultation! Our commerce automation architect will walk you through live catalog syncing, instant stock verification, and automated order booking directly in WhatsApp.",
        actions: [
          { label: 'Go to Book Demo Page', type: 'navigate', target: 'book-demo', icon: Calendar },
          { label: 'WhatsApp Sales Directly', type: 'whatsapp', target: '+8801712345678', icon: ArrowRight }
        ]
      };
    }

    // Courier & Logistics
    if (clean.includes('courier') || clean.includes('delivery') || clean.includes('shipping') || clean.includes('steadfast') || clean.includes('pathao')) {
      return {
        text: "Kreazy AI seamlessly integrates with premier logistics providers:\n\n• **Steadfast Courier**: Automatic parcel consignment creation and tracking IDs.\n• **Pathao Courier**: Instant order push and delivery status webhooks.\n• **RedX & Paperfly**: Automated tracking link dispatched to your buyer's WhatsApp as soon as parcel is in transit.",
        actions: [
          { label: 'View Integrations', type: 'navigate', target: 'integrations', icon: Truck },
          { label: 'Book Live Demo', type: 'navigate', target: 'book-demo', icon: Calendar }
        ]
      };
    }

    // Polite / Thank you (matching cb2_sec_20.jpg)
    if (clean.includes('thank') || clean.includes('thanks') || clean.includes('okay') || clean.includes('alright')) {
      return {
        text: "You're very welcome! Feel free to ask if anything else comes up, or schedule a quick walkthrough whenever you're ready to automate your store. Have a great day! ",
        actions: [
          { label: 'Schedule Live Demo', type: 'navigate', target: 'book-demo', icon: Calendar }
        ]
      };
    }

    // Default English response
    return {
      text: "Thanks for reaching out! I'm Kreazy Copilot. I can guide you through setting up AI agents on WhatsApp and Instagram, connecting your product catalog, or choosing the best subscription plan. What would you like to explore?",
      actions: [
        { label: 'Compare Pricing Plans', type: 'navigate', target: 'pricing', icon: DollarSign },
        { label: 'Book a 1-on-1 Live Demo', type: 'navigate', target: 'book-demo', icon: Calendar }
      ]
    };
  };

  // Handle user sending a message
  const handleUserSendMessage = (customText) => {
    const textToSend = (customText || messageInput).trim();
    if (!textToSend) return;

    // Capture visitor email if provided in top tier
    if (emailInput && !hasCapturedEmail) {
      try {
        localStorage.setItem('kreazy_visitor_email', emailInput.trim());
        setHasCapturedEmail(true);
        leadService.submitContactInquiry({
          name: 'Chat Visitor',
          email: emailInput.trim(),
          message: textToSend,
          inquiryType: 'Chat Widget Lead'
        }).catch(() => {});
      } catch {}
    }

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setIsTyping(true);

    // Realistic typing indicator delay (550ms)
    setTimeout(() => {
      const response = generateBotResponse(textToSend);
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: response.text,
          actions: response.actions,
          time: 'Just now'
        }
      ]);
    }, 550);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserSendMessage();
    }
  };

  const handleActionClick = (action) => {
    if (action.type === 'navigate' && action.target) {
      if (onNavigate) {
        onNavigate(action.target);
      } else {
        window.location.hash = `#/${action.target}`;
      }
      setIsOpen(false);
    } else if (action.type === 'whatsapp') {
      window.open('https://wa.me/8801712345678', '_blank');
    }
  };

  const handleRestartChat = () => {
    setMessages([
      {
        id: 'msg-init',
        sender: 'bot',
        text: "Hi there! \n\nWhat brings you here today?",
        time: 'Just now'
      }
    ]);
    setShowOptionsMenu(false);
  };

  return (
    <div className="kreazy-cb-root">
      {/* ─── CHAT POPOVER WINDOW ────────────────────────────────────────── */}
      {isOpen && (
        <div 
          className="kreazy-cb-popover" 
          role="dialog" 
          aria-label="Kreazy AI Copilot"
        >
          {view === 'home' ? (
            /* ════════════════════════════════════════════════════════════════
               HOME VIEW (MATCHING Chatbot_design.mp4)
               ════════════════════════════════════════════════════════════════ */
            <div className="kreazy-cb-home-view">
              {/* Header Gradient with Brand Asterisk & Title */}
              <div className="kreazy-cb-home-header">
                <div className="kreazy-cb-home-header-top">
                  <div className="kreazy-cb-brand-asterisk">
                    
                    <span className="kreazy-cb-brand-tagline">Kreazy AI</span>
                  </div>
                  <button
                    type="button"
                    className="kreazy-cb-close-icon-btn"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Chat"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="kreazy-cb-home-hero-text">
                  <h1 className="kreazy-cb-home-hero-h1">Hello</h1>
                  <h2 className="kreazy-cb-home-hero-h2">How can we help?</h2>
                </div>
              </div>

              {/* Action Cards Container */}
              <div className="kreazy-cb-home-cards-scroll">
                {/* Card 1: Send us a message */}
                <div 
                  className="kreazy-cb-card"
                  onClick={() => {
                    setView('chat');
                    setActiveTab('messages');
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kreazy-cb-card-row">
                    <div>
                      <div className="kreazy-cb-card-title">Send us a message</div>
                      <div className="kreazy-cb-card-sub">Instant answers with AI Copilot</div>
                    </div>
                    <div className="kreazy-cb-arrow-purple">
                      <Send size={18} />
                    </div>
                  </div>
                </div>

                {/* Card 2: Search the help center */}
                <div className="kreazy-cb-search-card">
                  <div className="kreazy-cb-search-label">Search the help center</div>
                  <form onSubmit={handleHelpSearchSubmit} className="kreazy-cb-search-bar">
                    <input
                      type="text"
                      className="kreazy-cb-search-input"
                      placeholder="e.g. pricing, whatsapp api, delivery..."
                      value={searchHelpInput}
                      onChange={(e) => setSearchHelpInput(e.target.value)}
                      aria-label="Search help center"
                    />
                    <button 
                      type="submit" 
                      className="kreazy-cb-search-submit"
                      aria-label="Submit search"
                      title="Search"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </div>

                {/* Card 3: Log in to KreazyAI */}
                <div 
                  className="kreazy-cb-card"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('login');
                    } else {
                      window.location.hash = '#/login';
                    }
                    setIsOpen(false);
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="kreazy-cb-card-row">
                    <div className="kreazy-cb-card-title">Log in to KreazyAI</div>
                    <div className="kreazy-cb-arrow-purple" style={{ color: '#6B7280' }}>
                      <ExternalLink size={17} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dual Tab Bottom Navigation */}
              <div className="kreazy-cb-bottom-nav">
                <button
                  type="button"
                  className={`kreazy-cb-nav-tab ${activeTab === 'home' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('home');
                    setView('home');
                  }}
                >
                  <Home size={18} />
                  <span>Home</span>
                </button>
                <button
                  type="button"
                  className={`kreazy-cb-nav-tab ${activeTab === 'messages' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('messages');
                    setView('chat');
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
                </button>
              </div>
            </div>
          ) : (
            /* ════════════════════════════════════════════════════════════════
               CHAT VIEW (MATCHING Chatbot_design.mp4 & Chatbot design(2).mp4)
               ════════════════════════════════════════════════════════════════ */
            <div className="kreazy-cb-chat-view">
              {/* Header with back button, avatar, agent info, options */}
              <div className="kreazy-cb-chat-header">
                <div className="kreazy-cb-chat-header-left">
                  <button
                    type="button"
                    className="kreazy-cb-back-btn"
                    onClick={() => {
                      setView('home');
                      setActiveTab('home');
                    }}
                    aria-label="Back to home"
                    title="Back"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="kreazy-cb-agent-avatar">
                    <span>K</span>
                    <span className="kreazy-cb-agent-online-dot" />
                  </div>

                  <div className="kreazy-cb-agent-meta">
                    <div className="kreazy-cb-agent-name-row">
                      <span className="kreazy-cb-agent-name">Kreazy Copilot</span>
                      <span className="kreazy-cb-agent-badge">• AI Agent</span>
                    </div>
                    <span className="kreazy-cb-agent-sub">The team can also help</span>
                  </div>
                </div>

                <div className="kreazy-cb-chat-header-right">
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className="kreazy-cb-header-tool-btn"
                      onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                      aria-label="Options"
                      title="Options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {showOptionsMenu && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '6px',
                        background: '#FFFFFF',
                        borderRadius: 0,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        border: '1px solid #E5E7EB',
                        padding: '6px',
                        width: '160px',
                        zIndex: 100
                      }}>
                        <button
                          type="button"
                          onClick={handleRestartChat}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            padding: '8px 10px',
                            fontSize: '13px',
                            color: '#374151',
                            cursor: 'pointer',
                            borderRadius: 0
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>Restart Chat</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="kreazy-cb-header-tool-btn"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Message Stream */}
              <div className="kreazy-cb-chat-body" ref={chatBodyRef}>
                <div className="kreazy-cb-system-intro">
                  Ask us anything or share your feedback.
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className="kreazy-cb-msg-group">
                    {msg.sender === 'user' ? (
                      <>
                        <div className="kreazy-cb-bubble-user">
                          {msg.text}
                        </div>
                        <div className="kreazy-cb-user-meta">
                          Not seen yet • {msg.time}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="kreazy-cb-bubble-bot">
                          {formatMessageContent(msg.text, onNavigate)}

                          {msg.actions && msg.actions.length > 0 && (
                            <div className="kreazy-cb-msg-actions">
                              {msg.actions.map((act, aIdx) => {
                                const Icon = act.icon || ArrowRight;
                                return (
                                  <button
                                    key={aIdx}
                                    type="button"
                                    className={aIdx === 0 ? 'kreazy-cb-action-btn-primary' : 'kreazy-cb-action-btn-secondary'}
                                    onClick={() => handleActionClick(act)}
                                  >
                                    <Icon size={14} />
                                    <span>{act.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="kreazy-cb-bot-meta">
                          Kreazy Copilot • {msg.time}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="kreazy-cb-typing-bubble">
                    <span className="kreazy-cb-typing-dot" />
                    <span className="kreazy-cb-typing-dot" />
                    <span className="kreazy-cb-typing-dot" />
                  </div>
                )}

                {/* Quick Reply Chips on Initial Conversation */}
                {messages.length === 1 && !isTyping && (
                  <div className="kreazy-cb-chips-area">
                    <button
                      type="button"
                      className="kreazy-cb-chip-btn highlighted"
                      onClick={() => handleUserSendMessage('I have a question')}
                    >
                      I have a question
                    </button>
                    <button
                      type="button"
                      className="kreazy-cb-chip-btn"
                      onClick={() => handleUserSendMessage('I found a bug')}
                    >
                      I found a bug
                    </button>
                    <button
                      type="button"
                      className="kreazy-cb-chip-btn"
                      onClick={() => handleUserSendMessage('I have product feedback')}
                    >
                      I have product feedback
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Two-Tier Input Container (Matching cb1_sec_20.jpg & cb2_sec_20.jpg) */}
              <div className="kreazy-cb-input-container">
                {/* Top Tier: Email input (shown until captured) */}
                {!hasCapturedEmail && (
                  <div className="kreazy-cb-email-tier">
                    <input
                      type="email"
                      className="kreazy-cb-email-input"
                      placeholder="email@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      aria-label="Your email address"
                    />
                  </div>
                )}

                {/* Bottom Tier: Message input */}
                <div className="kreazy-cb-msg-tier">
                  <input
                    type="text"
                    className="kreazy-cb-msg-input"
                    placeholder="Message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping}
                    aria-label="Message text"
                  />
                </div>

                {/* Action Bar: Attachment, Smile, GIF, Mic, Send */}
                <div className="kreazy-cb-action-bar">
                  <div className="kreazy-cb-icons-left">
                    <span className="kreazy-cb-action-icon" title="Attach file">
                      <Paperclip size={16} />
                    </span>
                    <span className="kreazy-cb-action-icon" title="Emoji">
                      <Smile size={16} />
                    </span>
                    <span className="kreazy-cb-gif-tag" title="GIF">
                      GIF
                    </span>
                    <span className="kreazy-cb-action-icon" title="Voice message">
                      <Mic size={16} />
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`kreazy-cb-send-btn ${messageInput.trim() ? 'active' : ''}`}
                    onClick={() => handleUserSendMessage()}
                    disabled={!messageInput.trim() || isTyping}
                    aria-label="Send message"
                    title="Send"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── CIRCULAR FLOATING LAUNCHER TRIGGER (BOTTOM-RIGHT) ─────────── */}
      <button
        type="button"
        className={`kreazy-cb-launcher-btn ${isOpen ? 'is-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title={isOpen ? 'Close chat' : 'Chat with Kreazy AI'}
      >
        {isOpen ? (
          <ChevronDown size={28} strokeWidth={2.4} color="#FFFFFF" />
        ) : (
          <MessageSquare size={24} color="#FFFFFF" />
        )}
      </button>
    </div>
  );
}
