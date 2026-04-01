import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const DatePicker = ({ label, name, value, onChange, required = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Set the current navigation date view (default to the selected value or today)
  const initialDate = value ? new Date(value) : new Date();
  // We need to account for timezone shifts when parsing YYYY-MM-DD
  const [currentViewDate, setCurrentViewDate] = useState(
    value ? new Date(initialDate.getTime() + initialDate.getTimezoneOffset() * 60000) : new Date()
  );

  const selectedDate = value ? new Date(new Date(value).getTime() + new Date(value).getTimezoneOffset() * 60000) : null;

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();

  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const startDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => setCurrentViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentViewDate(new Date(year, month + 1, 1));

  const handleDateSelect = (day) => {
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    onChange({
      target: { name, value: formattedDate }
    });
    setIsOpen(false);
  };

  const setToday = () => {
    const today = new Date();
    setCurrentViewDate(today);
    
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    onChange({
      target: { name, value: `${yyyy}-${mm}-${dd}` }
    });
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const totalDays = daysInMonth(year, month);
    const startDay = startDayOfMonth(year, month);
    const days = [];

    // Empty slots before start of month
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    const today = new Date();

    for (let day = 1; day <= totalDays; day++) {
      const isSelected = selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all cursor-pointer
            ${isSelected ? 'bg-secondary text-white shadow-md' : 
              isToday ? 'border-2 border-primary-container text-primary-container' : 
              'hover:bg-surface-container-highest text-on-surface hover:text-primary'}
          `}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-[10px] uppercase tracking-widest font-bold text-outline mb-2 flex items-center gap-2">
          {label} {required && '*'}
          <span className="material-symbols-outlined text-[14px] text-secondary">calendar_month</span>
        </label>
      )}
      
      {/* Visual Input Field triggering Modal */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low border-b-2 border-outline-variant hover:border-secondary transition-colors py-3 px-4 flex justify-between items-center cursor-pointer select-none"
      >
        <span className={`text-sm font-semibold ${value ? 'text-primary' : 'text-outline-variant font-normal'}`}>
          {value ? value : "Select Display Date..."}
        </span>
        <span className="material-symbols-outlined text-outline-variant">edit_calendar</span>
      </div>

      {/* Portal Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-blue-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-surface-container-lowest rounded-sm shadow-2xl overflow-hidden w-[340px] animate-in zoom-in-95 duration-200 border border-secondary/20"
            onClick={e => e.stopPropagation()}
          >
            {/* Calendar Header Nav */}
            <div className="bg-primary-container text-white p-5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
              
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-white/20 rounded-sm transition-colors cursor-pointer relative z-10">
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              
              <div className="text-center relative z-10">
                <div className="font-headline font-extrabold uppercase tracking-widest text-[15px]">{monthNames[month]}</div>
                <div className="text-secondary font-bold text-xs tracking-widest">{year}</div>
              </div>
              
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-white/20 rounded-sm transition-colors cursor-pointer relative z-10">
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-5 pb-0 bg-surface">
              <div className="grid grid-cols-7 gap-1 mb-3 text-center">
                {dayNames.map(day => (
                  <div key={day} className="text-[10px] uppercase tracking-widest font-black text-outline">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center pb-5 border-b border-surface-container-highest">
                {renderCalendarDays()}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center py-4 px-2">
                <button 
                  type="button" 
                  onClick={setToday}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-secondary transition-colors"
                >
                  Set Today
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-outline hover:text-error transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Hidden native input preserves required constraint behavior & standard form serializability */}
      <input type="date" name={name} value={value} required={required} readOnly className="absolute bottom-0 left-0 w-full h-0 opacity-0 pointer-events-none" />
    </div>
  );
};

export default DatePicker;
