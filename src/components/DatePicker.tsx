import { ChangeEvent } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerProps {
  selectedDate: string; // Format: YYYY-MM-DD
  onChange: (date: string) => void;
}

export default function DatePicker({ selectedDate, onChange }: DatePickerProps) {
  // Calculate boundary: strictly prior to today
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const yesterdayStr = getYesterdayString();

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    
    // Safety check: ensure only dates before today can be selected
    if (val > yesterdayStr) {
      alert("오늘 및 미래 날짜의 박스오피스는 조회할 수 없습니다. 어제 이전 날짜만 선택 가능합니다.");
      onChange(yesterdayStr);
    } else {
      onChange(val);
    }
  };

  // Helper to step date backward or forward by 1 day
  const stepDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const date = String(current.getDate()).padStart(2, '0');
    const newDateStr = `${year}-${month}-${date}`;

    if (newDateStr > yesterdayStr) {
      alert("오늘 이후의 박스오피스는 아직 집계되지 않았습니다.");
      return;
    }
    onChange(newDateStr);
  };

  // Human readable date formats for labels
  const getFormattedLabel = () => {
    try {
      const parts = selectedDate.split("-");
      if (parts.length === 3) {
        return `${parts[0]}년 ${parts[1]}월 ${parts[2]}일`;
      }
    } catch {}
    return selectedDate;
  };

  // Preset Date handlers
  const selectPreset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${date}`);
  };

  return (
    <div 
      id="datepicker-wrapper"
      className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/80 rounded-2xl shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label 
          htmlFor="kobis-date-picker" 
          className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
        >
          <Calendar className="w-4 h-4 text-sky-500" />
          박스오피스 조회 날짜 선택
        </label>
        
        {/* Quick Presets */}
        <div id="quick-presets" className="flex items-center gap-1.5">
          <button
            id="preset-yesterday"
            onClick={() => selectPreset(1)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
              selectedDate === yesterdayStr
                ? "bg-slate-950 border-slate-950 text-white dark:bg-sky-500 dark:border-sky-500 dark:text-slate-950"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            어제
          </button>
          <button
            id="preset-7days"
            onClick={() => selectPreset(7)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            7일 전
          </button>
          <button
            id="preset-30days"
            onClick={() => selectPreset(30)}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            30일 전
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Step backward button */}
        <button
          id="step-backward-btn"
          onClick={() => stepDate(-1)}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="이전 날짜"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Calendar core date picker selector */}
        <div className="relative flex-1">
          <input
            id="kobis-date-picker"
            type="date"
            value={selectedDate}
            max={yesterdayStr}
            onChange={handleDateChange}
            className="w-full pl-4 pr-10 py-2.5 font-sans font-semibold text-sm rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
          />
        </div>

        {/* Step forward button */}
        <button
          id="step-forward-btn"
          onClick={() => stepDate(1)}
          disabled={selectedDate >= yesterdayStr}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="다음 날짜"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p id="selected-date-indicator" className="text-center font-sans font-bold text-sm text-slate-700 dark:text-slate-200">
        조회일: <span className="text-sky-600 dark:text-sky-450">{getFormattedLabel()}</span>
      </p>
    </div>
  );
}
