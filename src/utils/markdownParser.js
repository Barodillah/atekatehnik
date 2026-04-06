// utils/markdownParser.js

export const parseMarkdown = (text) => {
    if (!text) return '';

    let html = text;

    // 1. Escape characters: temporarily replace escaped symbols
    html = html.replace(/\\\*/g, '&#42;'); // escape *
    html = html.replace(/\\_/g, '&#95;'); // escape _
    html = html.replace(/\\`/g, '&#96;'); // escape `
    html = html.replace(/\\~/g, '&#126;'); // escape ~

    // 2. Code blocks (multiline)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-surface-container-low p-4 my-4 rounded-md overflow-x-auto text-sm"><code>$1</code></pre>');

    // 3. Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-surface-container-highest px-1.5 py-0.5 rounded-sm text-sm font-mono text-primary">$1</code>');

    // 4. Headings
    html = html.replace(/^###### (.*$)/gim, '<h6 class="text-lg font-bold mt-4 mb-2">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 class="text-xl font-bold mt-4 mb-2">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-2xl font-bold mt-5 mb-2">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-3xl font-bold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-4xl font-bold mt-8 mb-4 border-b border-outline-variant/30 pb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-5xl font-extrabold mt-10 mb-6">$1</h1>');

    // 5. Blockquotes (nested then single)
    html = html.replace(/^>> (.*$)/gim, '<blockquote class="border-l-4 border-primary/50 pl-4 py-1 ml-4 my-4 italic text-on-surface-variant/80 bg-surface-container/30"><blockquote>$1</blockquote></blockquote>');
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-on-surface-variant bg-surface-container-lowest">$1</blockquote>');

    // 6. Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-8 border-t border-outline-variant/50" />');
    html = html.replace(/^\*\*\*$/gim, '<hr class="my-8 border-t border-outline-variant/50" />');
    html = html.replace(/^___$/gim, '<hr class="my-8 border-t border-outline-variant/50" />');

    // 7. Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-md shadow-sm my-6" />');

    // 8. Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary font-medium hover:text-primary/80 underline decoration-primary/30 underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>');

    // 8a. Custom Image Shortcode [img:URL]
    html = html.replace(/\[img:([^\]]+)\]/gi, '<img src="$1" alt="Illustration" class="max-w-full h-auto rounded-md shadow-sm my-6 mx-auto block" />');

    // 8b. Custom WhatsApp CTA Shortcode [cta-wa]
    const waSvg = `<svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
    const waButton = `<div class="my-8 text-center block"><a onclick="typeof window !== 'undefined' && window.trackWaClick && window.trackWaClick('artikel', 'artikel-content')" href="https://wa.me/62881080634612?text=Saya%20melihat%20dari%20website%20atekatehnik.com.%0ASaya membaca artikel dan tertarik dengan produk Anda." target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2.5 bg-[#25D366] text-white px-8 py-4 rounded-sm font-bold tracking-tight hover:bg-[#1da851] hover:-translate-y-0.5 transition-all duration-300 shadow-md !no-underline">${waSvg} Hubungi Kami Sekarang</a></div>`;
    html = html.replace(/\[cta-wa\]/gi, waButton);

    // 9. Bold + Italic
    html = html.replace(/(<[^>]+>)|\*\*\*(.*?)\*\*\*/g, (m, tag, text) => tag ? tag : `<strong><em>${text}</em></strong>`);

    // 10. Bold
    html = html.replace(/(<[^>]+>)|\*\*(.*?)\*\*/g, (m, tag, text) => tag ? tag : `<strong>${text}</strong>`);
    html = html.replace(/(<[^>]+>)|__(.*?)__/g, (m, tag, text) => tag ? tag : `<strong>${text}</strong>`);

    // 11. Italic
    html = html.replace(/(<[^>]+>)|\*(.*?)\*/g, (m, tag, text) => tag ? tag : `<em>${text}</em>`);
    html = html.replace(/(<[^>]+>)|_(.*?)_/g, (m, tag, text) => tag ? tag : `<em>${text}</em>`);

    // 12. Strikethrough
    html = html.replace(/(<[^>]+>)|~~(.*?)~~/g, (m, tag, text) => tag ? tag : `<del class="text-on-surface-variant/60">${text}</del>`);

    // 13. Lists
    // Unordered
    html = html.replace(/^[-*+] (.*$)/gim, '<ul class="list-disc list-inside ml-4 my-2"><li class="mb-1">$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul class="list-disc list-inside ml-4 my-2">/g, '\n');

    // Ordered
    html = html.replace(/^\d+\. (.*$)/gim, '<ol class="list-decimal list-inside ml-4 my-2"><li class="mb-1">$1</li></ol>');
    html = html.replace(/<\/ol>\n<ol class="list-decimal list-inside ml-4 my-2">/g, '\n');

    // Clean up adjacent list wrappers
    html = html.replace(/<\/ul>\s*<ul class="list-disc list-inside ml-4 my-2">/g, '');
    html = html.replace(/<\/ol>\s*<ol class="list-decimal list-inside ml-4 my-2">/g, '');

    // 14. Paragraph formatting for normal text (handling newlines)
    // Convert double newlines to paragraph breaks, single to standard newlines
    let paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(p => {
        // Don't wrap if it's already a block tag
        if (p.trim().match(/^(<h|<ul|<ol|<li|<blockquote|<pre|<hr|<img|<div)/i)) {
            return p;
        }
        return `<p class="mb-4 text-inherit">${p.replace(/\n/g, '<br />')}</p>`;
    }).join('\n');

    return html;
};

export default parseMarkdown;
