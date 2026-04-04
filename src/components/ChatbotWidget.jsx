import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

// ── Markdown Parser ──────────────────────────────────────────────────
const parseMarkdown = (text) => {
  if (!text) return '';

  let html = text;

  // Escape HTML entities first
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Horizontal rules (must come before heading parsing)
  html = html.replace(/^(\*\*\*|---|___)$/gm, '<hr class="my-3 border-t border-gray-300/50"/>');

  // Headings (h1-h6)
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-xs font-bold mt-2 mb-1">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-xs font-bold mt-2 mb-1">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h6 class="text-sm font-bold mt-2 mb-1">$1</h6>');
  html = html.replace(/^### (.+)$/gm, '<h5 class="text-sm font-semibold mt-2 mb-1">$1</h5>');
  html = html.replace(/^## (.+)$/gm, '<h4 class="text-base font-bold mt-3 mb-1">$1</h4>');
  html = html.replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold mt-3 mb-1.5">$1</h3>');

  // Code blocks (triple backtick)
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-green-300 text-xs p-3 rounded-lg my-2 overflow-x-auto font-mono whitespace-pre-wrap">$1</pre>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-200 text-red-600 text-xs px-1.5 py-0.5 rounded font-mono">$1</code>');

  // Bold + italic (***text*** or ___text___)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong class="font-bold">$1</strong>');

  // Italic (*text* or _text_) — avoid matching inside bold/already matched
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
  html = html.replace(/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/g, '<em class="italic">$1</em>');

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del class="line-through opacity-60">$1</del>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg max-w-full my-2"/>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800 transition-colors">$1</a>');

  // Nested quotes (>>)
  html = html.replace(/^&gt;&gt; (.+)$/gm, '<blockquote class="border-l-4 border-amber-400 bg-amber-50/50 pl-3 py-1 my-1 ml-4 text-xs italic text-gray-600">$1</blockquote>');

  // Quotes (>)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-blue-400 bg-blue-50/50 pl-3 py-1 my-1 text-xs italic text-gray-600">$1</blockquote>');

  // Numbered lists
  html = html.replace(/^(\d+)\. (.+)$/gm, '<li class="chat-ol-item ml-4 text-sm list-decimal" value="$1">$2</li>');

  // Bullet lists (-, *, +)
  html = html.replace(/^[\-\*\+] (.+)$/gm, '<li class="chat-ul-item ml-4 text-sm list-disc">$1</li>');

  // Group consecutive list items
  html = html.replace(/((?:<li class="chat-ol-item[^>]*>.*?<\/li>\n?)+)/g, '<ol class="space-y-0.5 my-1.5">$1</ol>');
  html = html.replace(/((?:<li class="chat-ul-item[^>]*>.*?<\/li>\n?)+)/g, '<ul class="space-y-0.5 my-1.5">$1</ul>');

  // Escaped markdown chars
  html = html.replace(/\\([*_~`#>\-\[\]()!])/g, '$1');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="mb-2">');

  // Single newlines → <br>
  html = html.replace(/\n/g, '<br/>');

  return html;
};

// ── System Prompt (company knowledge base) ───────────────────────────
const SYSTEM_PROMPT = `Kamu adalah **Ateka AI Assistant**, asisten virtual pintar dari **CV Ateka Tehnik Surakarta** — perusahaan manufaktur dan instalasi mesin penggilingan padi (Rice Milling Unit / RMU) yang berpengalaman lebih dari 20 tahun.

## Identitas Perusahaan
- **Nama**: CV Ateka Tehnik (brand: ATEKA)
- **Alamat**: Dusun Gondang, RT 02 RW 01, Desa Kedungjeruk, Kec. Mojogedang, Kab. Karanganyar, Jawa Tengah
- **Berdiri**: Sejak tahun 2000 (20+ tahun pengalaman)
- **Spesialisasi**: Manufaktur & Instalasi Rice Milling Unit (RMU)
- **Legalitas**: SIUP, NPWP, NIB (Terverifikasi Indotrading)
- **Jangkauan**: Nasional (Jawa, Sumatera, dan wilayah lain)
- **Status**: Diamond/Platinum Member Indotrading, terdaftar E-Katalog INAPROC

## Katalog Produk

### 1. Paket 1-2 Ton/Jam (Konsumsi Lokal / Menengah)
- Komponen: 3 Elevator, 2 Huller Yanmar, 2 Polisher N70, Mesin PS100
- Cocok untuk pengusaha penggilingan lokal

### 2. Paket 3-5 Ton/Jam (Industri / Beras Premium)
- Komponen: 8 Elevator, Huller HU, Polisher N70, Separator, Seed Cleaner
- Untuk industri beras premium

### 3. Paket Satake (Beras Kualitas Ekspor)
- Komponen: Elevator, Polisher Satake, Ayakan Menir, PK HU
- Polisher Satake internasional untuk derajat sosoh tinggi

### 4. Paket Mobile / Selepan Keliling (Layanan Jemput Bola)
- Komponen: Polisher N70, Huller LM, Diesel 24 PK, Sasis Colt
- Mesin penggilingan di atas kendaraan, langsung ke lokasi panen

### 5. Paket Hemat Pemula (Usaha Baru / Mikro)
- Komponen: 1 Polisher N70, 1 Huller, 1 Diesel 24 PK
- Untuk pemula yang baru memulai usaha penggilingan

## Peralatan Pendukung
- Elevator berbagai ukuran (5" dan 6")
- Blower & Siklun (cyclone) untuk manajemen debu/bekatul
- Mesin Pengering (dryer) kapasitas 8-10 ton

## Layanan
1. **Konsultasi Teknis & Desain Sistem** — Evaluasi anggaran, rancangan tata letak optimal
2. **Instalasi Profesional** — Tim spesialis berpengalaman bertahun-tahun
3. **Pelatihan Operator Gratis** — Pelatihan hingga mahir operasional harian
4. **Garansi & Purnajual** — Garansi produk, servis ke lokasi, ketersediaan suku cadang

## Proyek yang Sudah Dikerjakan
- Ricemill Glosor di Sragen, Jawa Tengah (kapasitas besar)
- Ricemill Poles di Surakarta (beras perkotaan)
- Ricemill Premium di Jawa Barat (standar ketat pasar Jakarta)
- Unit 1 ton/jam di Lubuklinggau (Sumatera Selatan) dan Cilacap
- Distribusi ke Banten dan Jakarta melalui jaringan distributor

## Pengetahuan Umum Penggilingan Padi
Kamu juga memiliki pengetahuan umum tentang:
- Proses penggilingan padi: pengeringan → pembersihan → pemecahan kulit (husking) → penyosohan (polishing) → sortasi
- Jenis mesin: huller/husker (pemecah kulit), polisher/penyosoh, separator, elevator, dryer
- Kehilangan hasil pascapanen dan cara minimalisasinya
- Kualitas beras: derajat sosoh, broken/menir, beras kepala
- Tips memilih mesin penggilingan yang tepat sesuai kapasitas
- Perawatan rutin mesin penggilingan
- Biaya operasional dan ROI investasi penggilingan
- Regulasi dan standar beras nasional

## Aturan Respons
1. Jawab dalam **Bahasa Indonesia** yang ramah, profesional, dan informatif (kecuali user bertanya dalam bahasa lain)
2. Gunakan **format markdown** untuk membuat jawaban terstruktur dan mudah dibaca
3. Selalu kaitkan jawaban dengan produk/layanan CV Ateka Tehnik jika relevan
4. Jika ditanya harga spesifik yang tidak kamu ketahui, sarankan untuk menghubungi agen kami via WhatsApp
5. Bersikap sebagai konsultan ahli penggilingan padi — beri saran yang berbobot dan detail
6. Jawab pertanyaan umum tentang penggilingan padi dengan pengetahuan mendalam
7. SELALU akhiri jawaban panjang dengan singkat bahwa untuk penawaran lebih lanjut bisa langsung berkonsultasi
8. Jangan pernah menjawab topik yang tidak berhubungan dengan perusahaan atau penggilingan padi — arahkan kembali dengan sopan`;

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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionKeyRef = useRef(getOrCreateSessionKey());
  const historyLoadedRef = useRef(false);
  const { t } = useLanguage();

  const WA_LINK = 'https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik,com.%20Halo%20Ateka%20Tehnik%2C%20saya%20tertarik%20dengan%20produk%20Anda.';

  const quickQuestions = [
    t('chatbot.q1'),
    t('chatbot.q2'),
    t('chatbot.q3'),
    t('chatbot.q4')
  ];

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Load previous chat history from DB when opening for the first time
  useEffect(() => {
    if (isOpen && !historyLoadedRef.current) {
      historyLoadedRef.current = true;
      loadChatHistory();
    }
  }, [isOpen]);

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
          timestamp: new Date(msg.sent_at),
          isError: msg.is_error === 1 || msg.is_error === '1',
        }));
        setMessages(restored);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ── Clear Chat (new session) ───────────────────────────────────────
  const handleClearChat = async () => {
    // Close old session in DB
    try {
      await fetch('/api/chat_history.php?action=clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_key: sessionKeyRef.current }),
      });
    } catch (err) {
      console.error('Failed to clear session:', err);
    }

    // Generate new session key
    const newKey = generateSessionKey();
    localStorage.setItem(SESSION_STORAGE_KEY, newKey);
    sessionKeyRef.current = newKey;

    // Clear messages in UI
    setMessages([]);
    historyLoadedRef.current = true; // prevent re-loading
  };

  // ── Call OpenRouter API ────────────────────────────────────────────
  const sendToOpenRouter = async (userMessage) => {
    // Build conversation history for context
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // In production: use PHP proxy (API key stays server-side)
    // In dev: call OpenRouter directly via VITE_ env vars
    const isDev = import.meta.env.DEV;

    let response;
    if (isDev) {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      const model = import.meta.env.VITE_OPENROUTER_MODEL;
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Ateka Tehnik AI Assistant',
        },
        body: JSON.stringify({
          model: model,
          messages: requestMessages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });
    } else {
      // Production: call PHP proxy (which also saves to DB)
      response = await fetch('/api/chat.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: requestMessages,
          session_key: sessionKeyRef.current,
          page_url: window.location.href,
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Maaf, terjadi kesalahan. Silakan coba lagi.';
  };

  // ── Handle Send Message ────────────────────────────────────────────
  const handleSend = async (messageText) => {
    const text = (messageText || inputValue).trim();
    if (!text || isLoading) return;

    // Add user message
    const userMsg = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await sendToOpenRouter(text);
      const assistantMsg = { role: 'assistant', content: reply, timestamp: new Date() };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg = {
        role: 'assistant',
        content: 'Maaf, terjadi kendala teknis. Silakan coba beberapa saat lagi atau langsung hubungi agen kami via WhatsApp.',
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

  const handleQuickQuestion = (question) => {
    handleSend(question);
  };

  // ── Time Formatter ─────────────────────────────────────────────────
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[60]">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary-container text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-primary transition-all group active:scale-95"
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">smart_toy</span>
            <span className="font-bold text-sm tracking-tight hidden sm:inline">{t('chatbot.name')}</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white animate-pulse"></div>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-[60] bg-surface-container-lowest shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${isFullscreen ? "inset-0 rounded-none" : "bottom-6 right-6 w-[350px] sm:w-96 h-[550px] max-h-[85vh] rounded-lg border border-outline-variant/20"}`}>

          {/* ── Chat Header ──────────────────────────────────────── */}
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
              {/* Clear Chat Button */}
              <button
                onClick={handleClearChat}
                className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title={t('chatbot.clearChat') || 'Bersihkan Chat'}
              >
                <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title={isFullscreen ? t('chatbot.fullscreenExit') : t('chatbot.fullscreenEnter')}
              >
                <span className="material-symbols-outlined text-[20px]">{isFullscreen ? 'close_fullscreen' : 'fullscreen'}</span>
              </button>
              <button
                onClick={() => { setIsOpen(false); setIsFullscreen(false); }}
                className="hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                title={t('chatbot.closeChat')}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* ── Chat Messaging Area ──────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50 chatbot-scroll">

            {/* Welcome Message */}
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

            {/* Loading History Indicator */}
            {isLoadingHistory && (
              <div className="flex justify-center py-3">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant/60">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Memuat riwayat chat...
                </div>
              </div>
            )}

            {/* Quick Questions (only show when no messages and not loading history) */}
            {messages.length === 0 && !isLoadingHistory && (
              <div className="flex flex-col gap-2 pl-11">
                <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">{t('chatbot.popularLabel')}</p>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-left text-xs bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors px-4 py-2 rounded-full w-fit max-w-full leading-relaxed"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>

                {/* Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                )}

                <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-3 text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-secondary text-white rounded-2xl rounded-tr-none shadow-md'
                        : `bg-white text-on-surface rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-outline-variant/10 ${msg.isError ? 'border-red-300 bg-red-50' : ''}`
                      }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div
                        className="chatbot-markdown prose prose-sm max-w-none [&>p]:mb-1.5 [&>ul]:my-1 [&>ol]:my-1"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                      />
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-on-surface-variant/60 mt-1 px-1">
                    {formatTime(msg.timestamp)}
                  </span>

                  {/* Contact Agent Button — only for assistant messages */}
                  {msg.role === 'assistant' && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <a
                        href={WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-700 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all duration-200 group"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        {t('chatbot.contactAgent')}
                      </a>
                      <Link
                        to="/contact"
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-primary-container/10 text-primary-container border border-primary-container/20 hover:bg-primary-container hover:text-white transition-all duration-200 group"
                      >
                        <span className="material-symbols-outlined text-xs">engineering</span>
                        {t('chatbot.techInquiry')}
                      </Link>
                    </div>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.04)] border border-outline-variant/10 flex items-center gap-1.5">
                  <div className="chatbot-typing-dot w-2 h-2 rounded-full bg-on-surface-variant/40" style={{ animationDelay: '0ms' }}></div>
                  <div className="chatbot-typing-dot w-2 h-2 rounded-full bg-on-surface-variant/40" style={{ animationDelay: '150ms' }}></div>
                  <div className="chatbot-typing-dot w-2 h-2 rounded-full bg-on-surface-variant/40" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ───────────────────────────────────────── */}
          <div className="p-3 bg-white border-t border-outline-variant/20 shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatbot.placeholder')}
                disabled={isLoading}
                className="flex-1 bg-surface border border-outline-variant/30 text-sm rounded-full px-5 py-2.5 focus:outline-none focus:border-secondary transition-colors disabled:opacity-50"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputValue.trim()}
                className="bg-secondary text-white w-10 min-w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#7a4200] transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">{isLoading ? 'hourglass_top' : 'send'}</span>
              </button>
            </div>
            <p className="text-center text-[9px] text-on-surface-variant/40 mt-2">
              Powered by Ateka AI • {t('chatbot.disclaimer')}
            </p>
          </div>

        </div>
      )}

      {/* ── Injected Styles ────────────────────────────────────────── */}
      <style>{`
        .chatbot-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .chatbot-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .chatbot-scroll::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.12);
          border-radius: 99px;
        }
        .chatbot-typing-dot {
          animation: chatbot-bounce 1.2s infinite ease-in-out;
        }
        @keyframes chatbot-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .chatbot-markdown strong { font-weight: 700; }
        .chatbot-markdown em { font-style: italic; }
        .chatbot-markdown del { text-decoration: line-through; opacity: 0.6; }
        .chatbot-markdown a { color: #2563eb; text-decoration: underline; }
        .chatbot-markdown a:hover { color: #1d4ed8; }
        .chatbot-markdown h3, .chatbot-markdown h4, .chatbot-markdown h5, .chatbot-markdown h6 {
          margin-top: 0.5rem; margin-bottom: 0.25rem; font-weight: 600;
        }
        .chatbot-markdown ul, .chatbot-markdown ol {
          padding-left: 0.5rem;
        }
        .chatbot-markdown li {
          margin-bottom: 0.125rem;
        }
        .chatbot-markdown blockquote {
          margin: 0.375rem 0;
        }
        .chatbot-markdown hr {
          margin: 0.5rem 0;
          border-color: rgba(0,0,0,0.1);
        }
        .chatbot-markdown pre {
          white-space: pre-wrap;
          word-break: break-word;
        }
        .chatbot-markdown code {
          font-size: 0.75rem;
        }
        .chatbot-markdown p {
          margin-bottom: 0.375rem;
        }
        .chatbot-markdown p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
};

export default ChatbotWidget;
