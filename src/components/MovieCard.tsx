import React from "react";
import { DailyBoxOfficeItem } from "../types";
import { TrendingUp, Film, Users, Sparkles, Calendar } from "lucide-react";
import { motion } from "motion/react";

interface MovieCardProps {
  key?: string | number;
  item: DailyBoxOfficeItem;
  onClick: (movieCd: string) => void;
  index: number;
}

export default function MovieCard({ item, onClick, index }: MovieCardProps) {
  const formattedAudi = Number(item.audiCnt).toLocaleString("ko-KR");
  const formattedAudiAcc = Number(item.audiAcc).toLocaleString("ko-KR");
  
  // Calculate style for rank increase/decrease
  const rankDiff = parseInt(item.rankInten, 10);
  const isNew = item.rankOldAndNew === "NEW";

  return (
    <motion.div
      id={`movie-card-container-${item.movieCd}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      onClick={() => onClick(item.movieCd)}
      className="group relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-slate-800/80 bg-gray-100 dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 hover:border-sky-500/30 dark:hover:border-sky-500/30 cursor-pointer flex flex-col justify-between"
    >
      {/* Decorative rank background number */}
      <div 
        id={`movie-card-bg-rank-${item.movieCd}`}
        className="absolute -top-6 -right-4 text-8xl font-black text-gray-100/40 dark:text-slate-800/20 select-none group-hover:scale-105 transition-transform duration-300 pointer-events-none"
      >
        {item.rank}
      </div>

      <div className="p-5 flex-1" id={`movie-card-body-${item.movieCd}`}>
        <div className="flex items-start justify-between gap-4 mb-3">
          {/* Rank Badge Header */}
          <div className="flex items-center gap-2">
            <span 
              id={`movie-card-rank-badge-${item.movieCd}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-950 dark:bg-sky-500 text-white font-mono font-bold text-sm tracking-tight"
            >
              {item.rank}
            </span>
            
            {/* Rank Trend Indicator */}
            <div id={`movie-rank-trend-${item.movieCd}`} className="flex items-center text-xs font-semibold">
              {isNew ? (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 flex items-center gap-0.5 animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  NEW
                </span>
              ) : rankDiff > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  ▲ {rankDiff}
                </span>
              ) : rankDiff < 0 ? (
                <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                  ▼ {Math.abs(rankDiff)}
                </span>
              ) : (
                <span className="text-gray-400 dark:text-slate-500">
                  -
                </span>
              )}
            </div>
          </div>
          
          <span 
            id={`movie-card-share-${item.movieCd}`}
            className="text-xs font-mono font-semibold px-2 py-1 rounded-sm bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300"
          >
            점유율 {item.salesShare}%
          </span>
        </div>

        {/* Movie Title */}
        <h3 
          id={`movie-card-title-${item.movieCd}`}
          className="font-sans font-bold text-lg md:text-xl text-slate-800 dark:text-slate-100 line-clamp-2 mb-4 group-hover:text-sky-500 dark:group-hover:text-sky-450 transition-colors"
        >
          {item.movieNm}
        </h3>

        {/* Details Grid */}
        <div className="space-y-2.5" id={`movie-card-details-${item.movieCd}`}>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <span>개봉일자: {item.openDt}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-605 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 flex-shrink-0" />
            <span>오늘 관객수: <strong className="text-slate-700 dark:text-slate-200">{formattedAudi}명</strong></span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-605 dark:text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-slate-450 dark:text-slate-500 flex-shrink-0" />
            <span>누적 관객수: <span className="text-slate-600 dark:text-slate-350">{formattedAudiAcc}명</span></span>
          </div>
        </div>
      </div>

      {/* Card Action footer */}
      <div 
        id={`movie-card-footer-${item.movieCd}`}
        className="border-t border-gray-50 dark:border-slate-800/50 p-4 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-between group-hover:bg-slate-50 dark:group-hover:bg-slate-800/20 group-hover:text-sky-500 transition-all duration-300"
      >
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-sky-500 transition-colors">영화 상세 정보 보기</span>
        <Film className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </motion.div>
  );
}
