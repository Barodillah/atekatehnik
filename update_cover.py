import re

with open('src/pages/dashboard/rab/RabDocumentPreview.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject coverChunks logic
cover_logic = '''  const coverItems = quotationDetails.items.filter(i => i.showOnCover);

  const paperHeight = paperSize === 'A4' ? '297mm' : '330mm';
  
  // Cover Pagination Logic
  const FIRST_COVER_LIMIT = paperSize === 'A4' ? 6 : 8;
  const NEXT_COVER_LIMIT = paperSize === 'A4' ? 14 : 18;
  
  const coverChunks = [];
  let remainingCoverItems = [...coverItems];
  if (remainingCoverItems.length > 0) {
    coverChunks.push(remainingCoverItems.splice(0, FIRST_COVER_LIMIT));
  } else {
    coverChunks.push([]);
  }
  while (remainingCoverItems.length > 0) {
    coverChunks.push(remainingCoverItems.splice(0, NEXT_COVER_LIMIT));
  }'''

content = re.sub(
    r'  const coverItems = quotationDetails\.items\.filter\(i => i\.showOnCover\);\s*const paperHeight = .*?;',
    cover_logic,
    content,
    flags=re.DOTALL
)

# 2. Extract PAGE 1 content
page1_regex = r'(?<=<!-- PAGE 1: Technical & Value Profile -->\s).*?(?={/\* PAGES 2\+: DETAILS \(Chunked\) \*/})'
# wait, the comment is {/* PAGE 1: Technical & Value Profile */}
page1_regex = r'{/\* PAGE 1: Technical & Value Profile \*/}.*?(?={/\* PAGES 2\+: DETAILS \(Chunked\) \*/})'

match = re.search(page1_regex, content, flags=re.DOTALL)
if match:
    page1_block = match.group(0)
    
    # We will construct the mapped block
    new_page1 = '''{/* PAGES 1+: Technical & Value Profile (Cover Pages) */}
      {coverChunks.map((chunk, chunkIndex) => {
        const isFirstCover = chunkIndex === 0;
        const isLastCover = chunkIndex === coverChunks.length - 1;
        let startCoverIdx = 0;
        if (chunkIndex > 0) {
           startCoverIdx = FIRST_COVER_LIMIT + ((chunkIndex - 1) * NEXT_COVER_LIMIT);
        }

        return (
          <div key={cover-} className="a4-page bg-white w-[210mm] mx-auto mb-8 shadow-xl relative overflow-hidden page-break flex flex-col" style={{ minHeight: paperHeight }}>
            {isFirstCover ? HeaderKop : SimpleHeaderKop}
            <div className="px-10 pb-10 flex-1">
              {isFirstCover && (
                <>'''
    
    # Extract info surat up to Technical descriptions
    info_surat_to_technical = re.search(r'{/\* Info Surat \*/}.*?(?={/\* Technical Descriptions \*/})', page1_block, flags=re.DOTALL).group(0)
    
    new_page1 += '\\n' + info_surat_to_technical + '''
                </>
              )}

              {chunk.length > 0 && (
                <div className={mb-6 }>
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
'''
    value_props = re.search(r'{/\* Value Propositions \*/}.*?(?=</div>\s*{/\* Footer Halaman \*/})', page1_block, flags=re.DOTALL).group(0)
    new_page1 += value_props + '''
              )}
            </div>
            {/* Footer Halaman */}
            <div className="absolute bottom-5 right-10 text-[9px] text-slate-400 page-number-dynamic"></div>
          </div>
        );
      })}
'''
    content = content.replace(page1_block, new_page1)

with open('src/pages/dashboard/rab/RabDocumentPreview.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("SUCCESS")
