import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link, useLocation } from 'react-router-dom';
import { trackWaClick } from '../utils/trackWaClick';

// ── Markdown Parser ──────────────────────────────────────────────────
const parseMarkdown = (text) => {
  if (!text) return '';
  let html = text;
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/^(\*\*\*|---|___)$/gm, '<hr class="my-3 border-t border-gray-300/50"/>');
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-xs font-bold mt-2 mb-1">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-xs font-bold mt-2 mb-1">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h6 class="text-sm font-bold mt-2 mb-1">$1</h6>');
  html = html.replace(/^### (.+)$/gm, '<h5 class="text-sm font-semibold mt-2 mb-1">$1</h5>');
  html = html.replace(/^## (.+)$/gm, '<h4 class="text-base font-bold mt-3 mb-1">$1</h4>');
  html = html.replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-1.5">$1</h3>');
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-300 text-xs p-3 rounded-lg my-2 overflow-x-auto font-mono whitespace-pre-wrap">$1</pre>');
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-red-600 text-xs px-1.5 py-0.5 rounded font-mono">$1</code>');
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em class="italic">$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through opacity-60">$1</del>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-2"/>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 transition-colors">$1</a>');
  html = html.replace(/^&gt;&gt; (.+)$/gm, '<blockquote class="border-l-4 border-amber-400 bg-amber-50/50 pl-3 py-1 my-1 ml-4 text-xs italic text-gray-600">$1</blockquote>');
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 bg-blue-50/50 pl-3 py-1 my-1 text-xs italic text-gray-600">$1</blockquote>');
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="chat-ol-item ml-4 text-sm list-decimal" value="$1">$2</li>');
  html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="chat-ul-item ml-4 text-sm list-disc">$1</li>');
  html = html.replace(/((?:<li class="chat-ol-item[^>]*>.*?<\/li>\n?)+)/g, '<ol class="space-y-0.5 my-1.5">$1</ol>');
  html = html.replace(/((?:<li class="chat-ul-item[^>]*>.*?<\/li>\n?)+)/g, '<ul class="space-y-0.5 my-1.5">$1</ul>');
  html = html.replace(/\\([*_~`#>\-\[\]()!])/g, '$1');
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');
  html = html.replace(/\n/g, '<br/>');
  return html;
};

// ── JSON Parser from AI Response ──────────────────────────────────────
const parseAIResponse = (text) => {
  if (!text) return null;
  // If it's pure standard response without structure, fallback later
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e2) { }
    }
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try { return JSON.parse(text.substring(startIdx, endIdx + 1)); } catch (e3) { }
    }
  }
  // Fallback for non-JSON or older text messages
  return { answer: text, quick_questions: [], related_links: [] };
};

// ── Base System Prompt ───────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `Kamu adalah **Ateka AI Assistant**, asisten virtual pintar dari **CV Ateka Tehnik Surakarta** — perusahaan manufaktur dan instalasi mesin penggilingan padi (Rice Milling Unit / RMU) yang berpengalaman lebih dari 20 tahun.

## Identitas & Produk
- Spesialisasi: Manufaktur & Instalasi RMU
- Produk: Paket 1-2 Ton (Menengah), 3-5 Ton (Industri), Satake (Ekspor), Mobile, dan Pemula. Juga Elevator, Blower, Dryer.
- Jangkauan: Nasional (Jawa, Sumatera, dll)

## Informasi Kontak Perusahaan
CV Ateka Tehnik
Kantor Pusat: Jl. Grompol - Jambangan, Gondang, Kedungjeruk, Kec. Mojogedang, Kabupaten Karanganyar, Jawa Tengah
Email: info@atekatehnik.com
Whatsapp: 0881080634612
*PENTING: Jika pengguna menanyakan nomor WhatsApp, kontak, atau cara komunikasi langsung, SELALU arahkan mereka untuk klik tombol "Hubungi Agen" di bawah chat.*

## ATURAN WAJIB FORMAT JSON 
Kamu **HARUS SELALU** merespons dalam format JSON murni. Jangan tambahkan teks apa pun di luar blok JSON. Gunakan format skema berikut (Wajib!):

\`\`\`json
{
  "answer": "Respon jawaban kamu kepada user. Gunakan markdown untuk memformat teks agar rapi dan mudah dibaca (bold, lists, dsb). Jika ditanya harga yang rumit arahkan ke WhatsApp agen.",
  "quick_questions": ["Pertanyaan lanjutan 1 terkait page/jawaban", "Pertanyaan lanjutan 2"],
  "related_links": [
    {
       "type": "product",
       "title": "Nama Produk / Post Terkait",
       "subtitle": "Penjelasan sangat singkat (1 kalimat max)",
       "image": "URL gambar persis dari daftar referensi",
       "link": "URL link persis dari daftar referensi"
    }
  ]
}
\`\`\`

Jika kamu perlu menyertakan referensi link/produk, KAMU HANYA BOLEH menggunakan URL dan gambar dari daftar "Katalog Referensi" yang diberikan di konteks tambahan di bawah. Jangan pernah mengarang URL sendiri!`;

// ── Session Key Helpers ─────────────────────────────────────────────
const SESSION_STORAGE_KEY = 'ateka_chat_session';

const generateSessionKey = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getOrCreateSessionKey = () => {
  let key = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!key) {
    key = generateSessionKey();
    localStorage.setItem(SESSION_STORAGE_KEY, key);
  }
  return key;
};

// ── ChatbotWidget Component ─────────────────────────────────────────
const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isGeneratingInit, setIsGeneratingInit] = useState(false);
  const [catalogRefList, setCatalogRefList] = useState('');
  const [contextualQuickQuestions, setContextualQuickQuestions] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionKeyRef = useRef(getOrCreateSessionKey());
  const historyLoadedRef = useRef(false);
  const catalogLoadedRef = useRef(false);
  const location = useLocation();
  const { t } = useLanguage();

  const WA_LINK = 'https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik.com.%20Halo%20Ateka%20Tehnik%2C%20saya%20tertarik%20dengan%20produk%20Anda.';

  // Default quick questions if AI background generation hasn't completed
  const defaultQuickQuestions = [
    t('chatbot.q1'),
    t('chatbot.q2'),
    t('chatbot.q3'),
    t('chatbot.q4')
  ];

  // ── Auto-scroll ───────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, contextualQuickQuestions, scrollToBottom]);

  // Focus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ── Helper: Get Current Page Context ──────────────────────────────
  const getPageContextText = useCallback(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(el => el.innerText.trim())
      .filter(t => t.length > 0)
      .slice(0, 5)
      .join(' | ');
    return `URL: ${window.location.pathname}
Title: ${document.title}
Konten/Topik Terlihat: ${headings || 'Halaman Landing/General'}`;
  }, [location.pathname]);

  // ── Initial Load Logic ────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      if (!historyLoadedRef.current) {
        historyLoadedRef.current = true;
        loadChatHistory();
      }
      if (!catalogLoadedRef.current) {
        catalogLoadedRef.current = true;
        fetchCatalogReferences();
      }
    }
  }, [isOpen]);

  // Fetch true catalog to prevent hallucinations
  const fetchCatalogReferences = async () => {
    try {
      const [prodRes, postRes] = await Promise.all([
        fetch('/api/products.php?limit=30'), // Top 30 products
        fetch('/api/posts.php?limit=15')     // 15 recent posts
      ]);
      const prodData = await prodRes.json();
      const postData = await postRes.json();

      let refList = '## Katalog Referensi (Link & Gambar Wajib dari sini jika relevan!)\n\n### PRODUK:\n';
      if (prodData.success) {
        prodData.data?.products?.forEach(p => {
          refList += `- TITLE: "${p.nama}", KATEGORI: "${p.kategori}", IMAGE: "${p.gambar}", LINK: "/product/${p.slug}"\n`;
        }) || prodData.products?.forEach(p => {
          refList += `- TITLE: "${p.nama}", KATEGORI: "${p.kategori}", IMAGE: "${p.gambar}", LINK: "/product/${p.slug}"\n`;
        });
      }

      refList += '\n### ARTIKEL/POST:\n';
      if (postData.success) {
        postData.data?.posts?.forEach(p => {
          refList += `- TITLE: "${p.title}", IMAGE: "${p.cover_image}", LINK: "/post/${p.slug}"\n`;
        }) || postData.posts?.forEach(p => {
          refList += `- TITLE: "${p.title}", IMAGE: "${p.cover_image}", LINK: "/post/${p.slug}"\n`;
        });
      }

      setCatalogRefList(refList);
    } catch (err) {
      console.warn('Failed to load catalog references for chatbot context');
    }
  };

  // Generate background initial questions
  const generateInitialPageQuestions = async (contextStr) => {
    // If not empty, we don't override initial messages layout
    if (messages.length > 0) return;

    setIsGeneratingInit(true);
    try {
      const prompt = `User baru saja membuka chat di halaman ini:
${contextStr}

Berikan 3 pertanyaan (quick_questions) yang paling relevan dengan konteks halaman HANYA dalam format JSON: { "answer": "", "quick_questions": ["q1", "q2", "q3"], "related_links": [] }`;

      // We pass skipSession = true so it doesn't pollute the DB with empty answers
      const rawResponse = await sendToOpenRouter(prompt, null, true, true);
      const parsed = parseAIResponse(rawResponse);
      if (parsed && parsed.quick_questions?.length > 0) {
        setContextualQuickQuestions(parsed.quick_questions);
      }
    } catch (e) {
      console.error('Failed to gen init questions', e);
    } finally {
      setIsGeneratingInit(false);
    }
  };

  // Trigger background questions when page changes if chat is open & empty
  useEffect(() => {
    if (isOpen && messages.length === 0 && !isGeneratingInit) {
      const pageCtx = getPageContextText();
      generateInitialPageQuestions(pageCtx);
    }
  }, [location.pathname, isOpen]); // Only empty dependency or when path changes without chat msgs


  // ── Load Chat History ──────────────────────────────────────────────
  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch(`/api/chat_history.php?action=load&session_key=${encodeURIComponent(sessionKeyRef.current)}`);
      const data = await res.json();
      if (data.success && data.messages && data.messages.length > 0) {
        const restored = data.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
          rawText: msg.content, // keep original json format
          timestamp: new Date(msg.sent_at),
          isError: msg.is_error === 1 || msg.is_error === '1',
        }));
        setMessages(restored);
      } else {
        // Empty history, start background gen
        generateInitialPageQuestions(getPageContextText());
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ── Clear Chat (new session) ───────────────────────────────────────
  const handleClearChat = async () => {
    try {
      await fetch('/api/chat_history.php?action=clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_key: sessionKeyRef.current }),
      });
    } catch (err) { }

    const newKey = generateSessionKey();
    localStorage.setItem(SESSION_STORAGE_KEY, newKey);
    sessionKeyRef.current = newKey;
    setMessages([]);
    setContextualQuickQuestions([]);
    generateInitialPageQuestions(getPageContextText());
  };

  // ── Call OpenRouter API ────────────────────────────────────────────
  const sendToOpenRouter = async (userMessage, overrideMessages = null, skipSession = false, isBackgroundInit = false) => {
    const pageCtx = getPageContextText();
    const systemContent = `${BASE_SYSTEM_PROMPT}\n\n${catalogRefList}\n\nKonteks Halaman Saat Ini:\n${pageCtx}`;

    // Construct conversation history for context, ensuring AI sees its own history as raw JSON
    const conversationHistory = isBackgroundInit ? [] : messages.map((msg) => ({
      role: msg.role,
      content: msg.rawText || msg.content // keep it JSON so AI remembers its format!
    }));

    const requestMessages = overrideMessages || [
      { role: 'system', content: systemContent },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Always use backend call so that chats are saved in the DB
    const payload = {
      messages: requestMessages,
      page_url: window.location.href,
      session_key: skipSession ? null : sessionKeyRef.current
    };

    const response = await fetch('/api/chat.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '{ "answer": "Maaf, terjadi kesalahan. Silakan coba lagi.", "quick_questions": [], "related_links": [] }';
  };

  // ── Handle Send Message ────────────────────────────────────────────
  const handleSend = async (messageText) => {
    const text = (messageText || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg = { role: 'user', content: text, rawText: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await sendToOpenRouter(text);
      const assistantMsg = { role: 'assistant', content: reply, rawText: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg = {
        role: 'assistant',
        content: '{ "answer": "Maaf, terjadi kendala teknis. Layanan API mungkin sedang sibuk.", "quick_questions": [], "related_links": [] }',
        rawText: '{ "answer": "Maaf, terjadi kendala teknis. Layanan API mungkin sedang sibuk.", "quick_questions": [], "related_links": [] }',
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeQuickQuestions = contextualQuickQuestions.length > 0 ? contextualQuickQuestions : defaultQuickQuestions;

  // ── Time Formatter ─────────────────────────────────────────────────
  const formatTime = (date) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <button
            onClick={() => {
              setIsOpen(true);
              if (window.innerWidth < 640) setIsFullscreen(true);
            }}
            className="bg-primary-container text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-primary transition-all group active:scale-95"
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">smart_toy</span>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">{t('chatbot.name')}</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></div>
          </button>
        </div>
      )}

      {isOpen && (
        <div className={`fixed z-[60] bg-surface-container-lowest shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${isFullscreen ? "inset-0 rounded-none" : "bottom-6 right-6 w-[85vw] sm:w-[380px] h-[600px] max-h-[85vh] rounded-xl border border-outline-variant/30"}`}>

          {/* Header */}
          <div className="bg-primary-container text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl">smart_toy</span>
              <div>
                <h4 className="font-headline font-bold leading-tight">{t('chatbot.name')}</h4>
                <p className="text-xs text-secondary-fixed opacity-80 mt-0.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse"></span>
                  {t('chatbot.status')}
                </p>
              </div>
            </div>
            <div className="flex gap-1 text-white/70">
              <button onClick={handleClearChat} className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" title={t('chatbot.clearChat') || 'Bersihkan Chat'}>
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              </button>
              <button onClick={() => setIsFullscreen(!isFullscreen)} className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}>
                <span className="material-symbols-outlined text-[20px]">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
              </button>
              <button onClick={() => { setIsOpen(false); setIsFullscreen(false); }} className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10" title="Tutup Chat">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Chat Messaging Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50 chatbot-scroll">

            {/* Welcome */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-sm">smart_toy</span>
              </div>
              <div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.04)] text-sm text-on-surface border border-outline-variant/10 leading-relaxed">
                  {t('chatbot.welcome')}
                </div>
              </div>
            </div>

            {isLoadingHistory && (
              <div className="flex justify-center py-3">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant/60">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Memuat riwayat chat...
                </div>
              </div>
            )}

            {/* Init Quick Questions */}
            {messages.length === 0 && !isLoadingHistory && (
              <div className="flex flex-col gap-2 pl-11">
                <p className="text-[11px] font-bold text-on-surface-variant mb-0.5 mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                  {isGeneratingInit ? <span className="material-symbols-outlined text-[14px] animate-spin">sync</span> : null}
                  Terkait Halaman Ini:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(isGeneratingInit && contextualQuickQuestions.length === 0 ? defaultQuickQuestions : activeQuickQuestions).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      disabled={isGeneratingInit || isLoading}
                      className="text-left text-xs bg-white border border-outline-variant/50 shadow-sm text-on-surface hover:bg-secondary hover:text-white hover:border-secondary transition-all px-3.5 py-2 rounded-full w-fit leading-relaxed disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages rendering */}
            {messages.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              let parsedMsg = null;
              if (isAI && !msg.isError) {
                parsedMsg = parseAIResponse(msg.content);
              }

              return (
                <div key={index} className={`flex gap-3 ${!isAI ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  {isAI ? (
                    <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-sm">person</span>
                    </div>
                  )}

                  <div className={`max-w-[85%] flex flex-col min-w-0 ${!isAI ? 'items-end' : 'items-start'}`}>
                    {/* Message Bubble */}
                    <div className={`p-3 text-sm leading-relaxed border overflow-hidden ${!isAI
                      ? 'bg-secondary text-white rounded-2xl rounded-tr-none shadow-md border-transparent'
                      : `bg-white text-on-surface rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.04)] border-outline-variant/20 ${msg.isError ? 'border-red-300 bg-red-50' : ''}`
                      }`}>

                      {isAI ? (
                        <>
                          <div
                            className="chatbot-markdown prose prose-sm max-w-none leading-relaxed text-[13px] break-words"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.isError ? msg.content : parsedMsg.answer) }}
                          />

                          {/* Rich Related Links UI */}
                          {parsedMsg && parsedMsg.related_links && parsedMsg.related_links.length > 0 && (
                            <div className={`mt-4 flex gap-2.5 chatbot-scroll ${isFullscreen ? 'flex-col sm:flex-row sm:overflow-x-auto sm:pb-2 sm:snap-x sm:-mr-2 sm:pr-2' : 'flex-col'}`}>
                              {parsedMsg.related_links.map((link, i) => (
                                <Link to={link.link || '#'} key={i} target="_blank" className={`shrink-0 bg-surface-container-lowest hover:bg-surface-container transition-colors rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col shadow-sm group ${isFullscreen ? 'w-full sm:w-44 sm:snap-start' : 'w-full'}`}>
                                  {link.image && (
                                    <div className="h-24 w-full bg-surface-container-high overflow-hidden shrink-0">
                                      <img src={link.image} alt={link.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none' }} />
                                    </div>
                                  )}
                                  <div className="p-2.5 flex-1 flex flex-col">
                                    <h5 className="text-[11px] font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">{link.title || 'Informasi Terkait'}</h5>
                                    {link.subtitle && <p className="text-[10px] text-on-surface-variant line-clamp-2 mt-0.5 leading-tight">{link.subtitle}</p>}
                                    <div className="mt-auto pt-2 text-[10px] font-semibold text-secondary flex items-center gap-1">
                                      Lihat Detail <span className="material-symbols-outlined text-[12px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>

                    <span className="text-[9px] text-on-surface-variant/50 mt-1 px-1 font-medium">
                      {formatTime(msg.timestamp)}
                    </span>

                    {/* AI Quick Questions below its specific message */}
                    {isAI && !msg.isError && parsedMsg.quick_questions?.length > 0 && index === messages.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {parsedMsg.quick_questions.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(q)}
                            disabled={isLoading}
                            className="text-[11px] text-left border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-colors leading-tight font-medium shadow-sm active:scale-95 disabled:opacity-50"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Contact Action only on last msg */}
                    {isAI && index === messages.length - 1 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <a
                          href={WA_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackWaClick('chatbot', 'contact-agent')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-700 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all duration-200 group flex-1 justify-center sm:flex-none"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          {t('chatbot.contactAgent')}
                        </a>
                        <Link
                          to="/contact"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container hover:text-white transition-all duration-200 group flex-1 justify-center sm:flex-none"
                        >
                          <span className="material-symbols-outlined text-xs">engineering</span>
                          {t('chatbot.techInquiry')}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-outline-variant/10 flex items-center gap-1.5">
                  <div className="chatbot-typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '0ms' }}></div>
                  <div className="chatbot-typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '150ms' }}></div>
                  <div className="chatbot-typing-dot w-1.5 h-1.5 rounded-full bg-primary" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0">
            <div className="flex gap-2 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatbot.placeholder')}
                disabled={isLoading}
                className="flex-1 bg-surface border border-outline-variant/40 text-sm rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-1 top-1 bottom-1 bg-primary text-white w-10 min-w-10 rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">{isLoading ? 'hourglass_top' : 'send'}</span>
              </button>
            </div>
            <p className="text-center text-[9px] text-on-surface-variant/40 mt-2 font-medium tracking-wide">
              Powered by Ateka AI
            </p>
          </div>
        </div>
      )}

      <style>{`
        .chatbot-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
        .chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
        .chatbot-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 99px; }
        .chatbot-typing-dot { animation: chatbot-bounce 1s infinite ease-in-out alternate; }
        @keyframes chatbot-bounce {
          0% { transform: translateY(0); opacity: 0.5; }
          100% { transform: translateY(-4px); opacity: 1; }
        }
        .chatbot-markdown strong { font-weight: 700; }
        .chatbot-markdown em { font-style: italic; }
        .chatbot-markdown del { text-decoration: line-through; opacity: 0.6; }
        .chatbot-markdown a { color: #2563eb; text-decoration: underline; }
        .chatbot-markdown a:hover { color: #1d4ed8; }
        .chatbot-markdown h3, .chatbot-markdown h4, .chatbot-markdown h5, .chatbot-markdown h6 {
          margin-top: 0.5rem; margin-bottom: 0.25rem; font-weight: 600;
        }
        .chatbot-markdown ul, .chatbot-markdown ol { padding-left: 1rem; }
        .chatbot-markdown li { margin-bottom: 0.125rem; }
        .chatbot-markdown blockquote { margin: 0.375rem 0; }
        .chatbot-markdown hr { margin: 0.5rem 0; border-color: rgba(0,0,0,0.1); }
        .chatbot-markdown pre { white-space: pre-wrap; word-break: break-word; }
        .chatbot-markdown code { font-size: 0.75rem; }
        .chatbot-markdown p { margin-bottom: 0.5rem; }
        .chatbot-markdown p:last-child { margin-bottom: 0; }
      `}</style>
    </>
  );
};

export default ChatbotWidget;
