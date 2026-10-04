const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'laragon', 'www', 'atekatehnik', 'src', 'pages', 'dashboard', 'rab', 'RabDocumentPreview.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = `{/* PAGE 1: Technical & Value Profile */}`;
const endMarker = `{/* PAGES 2+: DETAILS (Chunked) */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const page1Block = content.substring(startIndex, endIndex);
    
    // Extract info surat to items grid start
    const introMatch = page1Block.match(/<div className="px-10 pb-10">([\s\S]*?){\/\* Technical Descriptions \*\/}/);
    const introSection = introMatch ? introMatch[1] : '';

    const valuePropsMatch = page1Block.match(/({\/\* Value Propositions \*\/}[\s\S]*?)(?=<\/div>\s*{\/\* Footer Halaman \*\/})/);
    const valueProps = valuePropsMatch ? valuePropsMatch[1] : '';

    const newPage1 = `{/* PAGES 1+: Technical & Value Profile (Cover Pages) */}
      {coverChunks.map((chunk, chunkIndex) => {
        const isFirstCover = chunkIndex === 0;
        const isLastCover = chunkIndex === coverChunks.length - 1;
        let startCoverIdx = 0;
        if (chunkIndex > 0) {
           startCoverIdx = FIRST_COVER_LIMIT + ((chunkIndex - 1) * NEXT_COVER_LIMIT);
        }

        return (
          <div key={\`cover-\${chunkIndex}\`} className="a4-page bg-white w-[210mm] mx-auto mb-8 shadow-xl relative overflow-hidden page-break flex flex-col" style={{ minHeight: paperHeight }}>
            {isFirstCover ? HeaderKop : SimpleHeaderKop}
            
            <div className="px-10 pb-10 flex-1">
              {isFirstCover && (
                <>
${introSection}
                </>
              )}

              {chunk.length > 0 && (
                <div className={\`mb-6 \${!isFirstCover ? 'mt-6' : ''}\`}>
                  {isFirstCover ? (
                    <h3 className="bg-blue-950 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-3 rounded-sm">Komponen Utama Sistem</h3>
                  ) : (
                    <h3 className="bg-blue-950 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-3 rounded-sm">Komponen Utama Sistem (Lanjutan)</h3>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    {chunk.map((item, localIdx) => {
                      const absoluteIdx = startCoverIdx + localIdx + 1;
                      return (
                        <div key={item.id} className="flex gap-3 border border-slate-100 p-2 rounded bg-slate-50 break-inside-avoid">
                          <div className="w-16 h-16 bg-slate-200 rounded shrink-0 overflow-hidden">
                            {item.image_url ? (
                              <img src={item.image_url} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                <span className="material-symbols-outlined text-2xl">settings</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-blue-900 mb-0.5">{absoluteIdx}. {item.name}</h4>
                            <p className="text-[10px] text-slate-600 leading-tight">{item.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isLastCover && (
                <>
${valueProps}
                </>
              )}
            </div>

            {/* Footer Halaman */}
            <div className="absolute bottom-5 right-10 text-[9px] text-slate-400 page-number-dynamic"></div>
          </div>
        );
      })}

      `;
      
    content = content.substring(0, startIndex) + newPage1 + content.substring(endIndex);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('SUCCESS');
} else {
    console.log('FAILED to find markers');
}
