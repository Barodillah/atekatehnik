import React from 'react';

const SaveButton = ({ onClick }) => (
  <button onClick={onClick} className="no-print bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-3 py-1 rounded">Simpan</button>
);

/**
 * Info surat + judul + visual utama. Rendered only on the first cover page.
 * `edit` is null in the hidden measure layer (display mode only).
 */
export const CoverIntro = ({ q, edit }) => {
  const editing = (field) => !!edit?.editStates[field];
  const blurCancel = (field) => (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) edit.cancelEdit(field);
  };
  const setValue = (field) => (e) => {
    const value = e.target.value;
    edit.setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Info Surat */}
      <div className="flex justify-between text-xs mb-8 border border-slate-200 p-3 rounded bg-slate-50">
        <div className="space-y-1">
          <div className="flex"><span className="w-20 font-bold">No. Surat</span>: {q.quotation_number}</div>
          <div className="flex"><span className="w-20 font-bold">Perihal</span>: Penawaran Harga Mesin</div>
          <div className="flex"><span className="w-20 font-bold">Produk</span>: {q.title}</div>
        </div>
        <div className="space-y-1">
          <div className="flex"><span className="w-24 font-bold">Tanggal</span>: {q.quotation_date_fmt}</div>
          <div className="flex"><span className="w-24 font-bold">Masa Berlaku</span>: {q.valid_until_fmt}</div>
          <div className="flex"><span className="w-24 font-bold">Kepada Yth.</span>: <b className="text-blue-900 ml-1">{q.customer.customer_name === 'Kepada Yth.' ? '-' : q.customer.customer_name}</b></div>
        </div>
      </div>

      <div className="text-center mb-6">
        {editing('title') ? (
          <div className="flex flex-col items-center gap-2" onBlur={blurCancel('title')}>
            <input
              type="text"
              className="w-full max-w-md text-lg font-black text-blue-950 uppercase border-2 border-blue-400 p-1 text-center outline-none rounded"
              value={edit.editValues.title}
              onChange={setValue('title')}
              autoFocus
            />
            <div className="flex justify-center gap-2">
              <SaveButton onClick={() => edit.saveEdit('title', 'title')} />
            </div>
          </div>
        ) : (
          <h2
            onDoubleClick={() => edit?.startEdit('title', q.title)}
            className="text-lg font-black text-blue-950 uppercase border-b-2 border-slate-200 inline-block pb-1 transition-colors hover:bg-slate-50 cursor-pointer rounded px-2"
            title="Klik 2x untuk edit teks"
          >
            {q.title}
          </h2>
        )}
      </div>

      {/* Visualisasi Utama (Split Layout) */}
      <div className="flex gap-6 mb-8 items-stretch">
        {/* Left: Image */}
        <div className="w-1/3 shrink-0">
          <div className="w-full h-full min-h-[200px] bg-white border-2 border-slate-200 p-2 shadow-sm flex items-center justify-center">
            {q.coverImage ? (
              <img src={q.coverImage} alt="Cover" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-slate-300">
                <span className="material-symbols-outlined text-6xl">precision_manufacturing</span>
                <p className="text-[10px] mt-2 uppercase tracking-widest font-bold">Image Placeholder</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Description & Advantages */}
        <div className="w-2/3 flex flex-col justify-center text-slate-700">
          {editing('coverTitle') ? (
            <div className="mb-2" onBlur={blurCancel('coverTitle')}>
              <input
                type="text"
                className="w-full text-xl font-bold text-blue-950 border-2 border-blue-400 p-1 outline-none rounded mb-1"
                value={edit.editValues.coverTitle}
                onChange={setValue('coverTitle')}
                autoFocus
              />
              <div className="flex gap-2">
                <SaveButton onClick={() => edit.saveEdit('coverTitle', 'coverTitle')} />
              </div>
            </div>
          ) : (
            <h3
              onDoubleClick={() => edit?.startEdit('coverTitle', q.coverTitle)}
              className="text-xl font-bold text-blue-950 mb-2 border-b border-slate-200 pb-1 inline-block transition-colors hover:bg-slate-50 cursor-pointer rounded px-1"
              title="Klik 2x untuk edit teks"
            >
              {q.coverTitle}
            </h3>
          )}

          {editing('coverDescription') ? (
            <div className="mb-4" onBlur={blurCancel('coverDescription')}>
              <textarea
                className="w-full text-sm p-2 border-2 border-blue-400 rounded outline-none min-h-[100px] leading-relaxed resize-y font-sans mb-1"
                value={edit.editValues.coverDescription}
                onChange={setValue('coverDescription')}
                autoFocus
              />
              <div className="flex gap-2">
                <SaveButton onClick={() => edit.saveEdit('coverDescription', 'coverDescription')} />
              </div>
            </div>
          ) : (
            <p
              onDoubleClick={() => edit?.startEdit('coverDescription', q.coverDescription)}
              className="text-sm whitespace-pre-line mb-4 transition-colors hover:bg-slate-50 cursor-pointer rounded p-1"
              title="Klik 2x untuk edit teks"
            >
              {q.coverDescription}
            </p>
          )}

          {editing('coverAdvantages') ? (
            <div className="bg-blue-50/50 border border-blue-200 p-2 rounded-sm" onBlur={blurCancel('coverAdvantages')}>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-blue-950 text-xs">Kelebihan Utama:</h4>
                <button
                  onClick={() => edit.setEditValues((prev) => ({ ...prev, coverAdvantagesArray: [...prev.coverAdvantagesArray, ''] }))}
                  className="text-[10px] font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[12px]">add</span> Tambah
                </button>
              </div>
              <div className="space-y-1 mb-2">
                {edit.editValues.coverAdvantagesArray.map((adv, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-300 text-xs shrink-0">check_circle</span>
                    <input
                      type="text"
                      placeholder="Masukkan poin kelebihan..."
                      className="flex-1 border border-blue-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500 py-1 px-2 outline-none"
                      value={adv}
                      onChange={(e) => {
                        const newArr = [...edit.editValues.coverAdvantagesArray];
                        newArr[index] = e.target.value;
                        edit.setEditValues((prev) => ({ ...prev, coverAdvantagesArray: newArr }));
                      }}
                      autoFocus={index === edit.editValues.coverAdvantagesArray.length - 1}
                    />
                    <button
                      onClick={() => {
                        const newArr = [...edit.editValues.coverAdvantagesArray];
                        newArr.splice(index, 1);
                        edit.setEditValues((prev) => ({ ...prev, coverAdvantagesArray: newArr }));
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex items-center justify-center shrink-0"
                      title="Hapus"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                ))}
                {edit.editValues.coverAdvantagesArray.length === 0 && (
                  <div className="text-center text-[10px] text-slate-400 py-2 border border-dashed border-slate-300 rounded">
                    Belum ada poin. Klik "Tambah".
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <SaveButton onClick={() => edit.saveEdit('coverAdvantages', 'coverAdvantages')} />
              </div>
            </div>
          ) : (
            <div
              onDoubleClick={() => edit?.startEdit('coverAdvantages', q.coverAdvantages)}
              className="bg-blue-50/50 border border-blue-200 p-2 rounded-sm transition-colors hover:bg-blue-100/50 cursor-pointer"
              title="Klik 2x untuk edit teks"
            >
              <h4 className="font-bold text-blue-950 mb-1 text-xs">Kelebihan Utama:</h4>
              {q.coverAdvantages && q.coverAdvantages.length > 0 && q.coverAdvantages.some((adv) => adv.trim() !== '') ? (
                <ul className="list-disc pl-4 text-xs text-blue-900/80 leading-tight space-y-0.5">
                  {q.coverAdvantages.map((adv, idx) => (
                    adv.trim() && <li key={idx}>{adv.trim()}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[10px] text-blue-800/50 italic">Klik 2x untuk menambah list kelebihan...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/** Container for a run of cover rows on one page (title is repeated on continuation pages). */
export const CoverSection = ({ isContinuation, measureId, children }) => (
  <div className="flow-root" data-measure={measureId}>
    <div className="pb-6">
      <h3 className="bg-blue-950 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-3 rounded-sm">
        Komponen Utama Sistem{isContinuation ? ' (Lanjutan)' : ''}
      </h3>
      <div>{children}</div>
    </div>
  </div>
);

/** One grid row (max 2 cards) of cover components. */
export const CoverItemRow = ({ items, startNumber }) => (
  <div className="grid grid-cols-2 gap-4">
    {items.map((item, j) => (
      <div key={item.id ?? `${startNumber}-${j}`} className="flex gap-3 border border-slate-100 p-2 rounded bg-slate-50">
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
          <h4 className="font-bold text-xs text-blue-900 mb-0.5">{item.name}</h4>
          <p className="text-[10px] text-slate-600 leading-tight">{item.desc}</p>
          {item.specifications && (
            <p className="text-[9px] text-slate-500 mt-1 italic leading-tight">{item.specifications}</p>
          )}
        </div>
      </div>
    ))}
  </div>
);

/** "Keunggulan Investasi" block. `editable` is false in the measure layer. */
export const InvestAdvantages = ({ text, editable, isEditing, setIsEditing, setText, onSave }) => {
  const editingNow = editable && isEditing;
  return (
    <div
      onDoubleClick={() => editable && setIsEditing(true)}
      className={`transition-colors rounded-sm ${editingNow ? '' : 'hover:bg-slate-50 cursor-pointer'}`}
      title={editingNow ? '' : 'Klik 2x untuk edit teks'}
    >
      <h3 className="bg-orange-500 text-white font-bold text-xs uppercase px-3 py-1.5 inline-block mb-2 rounded-sm">Keunggulan Investasi</h3>

      {editingNow ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full text-[11px] text-slate-700 p-2 border border-blue-400 rounded outline-none min-h-[100px] leading-relaxed resize-y font-sans"
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            onBlur={onSave}
          />
          <div className="flex justify-end">
            <button onClick={onSave} className="no-print text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
              Simpan
            </button>
          </div>
        </div>
      ) : (
        <ul className="list-disc pl-5 text-[11px] text-slate-700 space-y-1">
          {text.split('\n').filter((line) => line.trim() !== '').map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>
      )}
      <div className="mt-8 pt-4 border-t border-slate-200 text-right text-[10px] text-slate-500 italic">
        *dilanjutkan dengan Rincian Anggaran Biaya (RAB)
      </div>
    </div>
  );
};
