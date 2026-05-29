import { useEffect, useState } from "react";
import { Film, AlertCircle, RefreshCw, Calendar, TrendingUp } from "lucide-react";
import { DailyBoxOfficeItem, BoxOfficeResponse } from "./types";
import ThemeToggle from "./components/ThemeToggle";
import DatePicker from "./components/DatePicker";
import MovieCard from "./components/MovieCard";
import MovieDetailModal from "./components/MovieDetailModal";

export default function App() {
  // Yesterday's date as default target
  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getYesterdayString());
  const [boxOfficeList, setBoxOfficeList] = useState<DailyBoxOfficeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);

  // Fetch Box office whenever the date changes
  const fetchBoxOffice = async (dateStr: string) => {
    // Convert YYYY-MM-DD to YYYYMMDD
    const apiDateParam = dateStr.replace(/-/g, "");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/boxoffice?date=${apiDateParam}`);
      if (!response.ok) {
        throw new Error("KOBIS 박스오피스 데이터를 조회하는 데 실패했습니다.");
      }
      const data: BoxOfficeResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (data.boxOfficeResult?.dailyBoxOfficeList) {
        setBoxOfficeList(data.boxOfficeResult.dailyBoxOfficeList);
      } else {
        setBoxOfficeList([]);
        setError("해당 날짜의 박스오피스 데이터가 존재하지 않습니다.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "서버 통신 실패가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxOffice(selectedDate);
  }, [selectedDate]);

  return (
    <div id="app-root-container" className="min-h-screen bg-neutral-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Dynamic Header */}
      <header 
        id="app-header"
        className="sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-950 dark:bg-sky-500 text-white dark:text-slate-950 shadow-xs flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sans font-extrabold text-lg md:text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                시네마 박스오피스
              </h1>
              <p className="text-[10px] font-mono text-slate-450 dark:text-slate-500 leading-tight">COMMITTED TO FILM RESEARCH</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="app-main-workspace">
        {/* Date Controller Panel & Description banner */}
        <div className="grid lg:grid-cols-3 gap-6 items-start" id="app-control-grid">
          {/* Visual greeting / manual banner */}
          <div 
            id="greeting-box"
            className="lg:col-span-2 p-6 md:p-8 rounded-2xl bg-slate-900 text-white dark:bg-slate-900/40 dark:border dark:border-slate-800 flex flex-col justify-between h-full min-h-[180px] hover:shadow-lg transition-all duration-300"
          >
            <div>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-sky-500 text-slate-950 rounded-md tracking-wider uppercase mb-3 inline-block">
                KOBIS OpenAPI Integrated
              </span>
              <h2 className="font-sans font-extrabold text-xl md:text-2xl tracking-tight leading-snug mb-2">
                대한민국 일일 박스오피스 순위 조회
              </h2>
              <p className="text-gray-300 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-xl">
                영화진흥위원회(KOBIS)의 OpenAPI 데이터를 실시간으로 연동하여 하루 동안 집계된 영화 순위와 상세 영화 세부 제원(상영정보, 캐스팅, 심의등급, 제작사)을 보기 쉽도록 한눈에 보여줍니다.
              </p>
            </div>
            {/* Minimal metadata credits */}
            <div className="flex items-center gap-4 mt-4 text-[11px] font-mono text-gray-400 dark:text-slate-500 border-t border-slate-800/50 pt-3">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-sky-500" />
                정확한 관객 점유율 분석
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                오늘 이전 날짜 전체
              </span>
            </div>
          </div>

          {/* Date Selector Component card */}
          <div id="controller-picker-card" className="h-full">
            <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
          </div>
        </div>

        {/* Dynamic List Render Board */}
        <div className="space-y-6" id="app-movie-board">
          {loading ? (
            /* Loading State Grids */
            <div className="space-y-4" id="board-loading-cards">
              <div className="flex items-center justify-between">
                <div className="h-6 w-48 bg-gray-200 dark:bg-slate-850 animate-pulse rounded" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-850 animate-pulse rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, idx) => (
                  <div key={idx} className="border border-gray-100 dark:border-slate-900 rounded-2xl p-5 bg-white dark:bg-slate-900 h-[220px] animate-pulse space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-slate-800" />
                      <div className="w-20 h-4 bg-gray-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" />
                    <div className="space-y-2 pt-2">
                      <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-800 rounded" />
                      <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            /* Error Display Overlay */
            <div 
              id="board-error"
              className="p-12 text-center max-w-lg mx-auto border border-rose-100 dark:border-rose-950/40 rounded-3xl bg-rose-50/20 dark:bg-rose-950/10 backdrop-blur-xs space-y-4"
            >
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h3 className="font-sans font-bold text-lg text-rose-600 dark:text-rose-400">데이터를 불러오지 못했습니다</h3>
              <p className="text-sm text-slate-550 dark:text-slate-400">{error}</p>
              <button
                id="retry-fetch-btn"
                onClick={() => fetchBoxOffice(selectedDate)}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-sky-500 shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                다시 시도하기
              </button>
            </div>
          ) : boxOfficeList.length > 0 ? (
            /* Ready/Success Screen Cards Grid */
            <div className="space-y-4" id="board-success-cards">
              <div className="flex items-center justify-between border-b border-gray-200/50 dark:border-slate-800/50 pb-3" id="movie-grid-meta">
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  총 <span className="text-sky-600 dark:text-sky-400">{boxOfficeList.length}개</span>의 상위 영화 순위
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">가장 고밀도 공식 데이터 적용됨</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="movie-cards-grid">
                {boxOfficeList.map((item, index) => (
                  <MovieCard
                    key={item.movieCd}
                    item={item}
                    index={index}
                    onClick={(movieCd) => setSelectedMovieCd(movieCd)}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Empty Screen State */
            <div 
              id="board-empty"
              className="p-16 text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl text-slate-450 dark:text-slate-550 space-y-3"
            >
              <Film className="w-12 h-12 mx-auto stroke-1.5 opacity-60" />
              <p className="font-semibold text-sm">해당 날짜에 집계된 영화 순위 정보가 없습니다.</p>
              <p className="text-xs">다른 날짜를 선택하여 실시간 순위를 검색해보세요.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer copyright block */}
      <footer id="app-footer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-gray-200/40 dark:border-slate-900 mt-12 text-center text-xs text-slate-400 dark:text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} Daily Box Office Tracker. All rights reserved.</span>
        <span className="font-mono">INTEGRATED WITH KOREA FILM COUNCIL</span>
      </footer>

      {/* Movie Details overlay drawer/modal */}
      <MovieDetailModal
        movieCd={selectedMovieCd}
        onClose={() => setSelectedMovieCd(null)}
      />
    </div>
  );
}
