import { useEffect, useState } from "react";
import { X, Calendar, Clock, Film, Award, Users, Landmark, Tag, Sparkles, Copy, Check } from "lucide-react";
import { MovieInfo, MovieInfoResponse } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface MovieDetailModalProps {
  movieCd: string | null;
  onClose: () => void;
}

export default function MovieDetailModal({ movieCd, onClose }: MovieDetailModalProps) {
  const [movie, setMovie] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Review Generator states
  const [keywords, setKeywords] = useState<string[]>(["", "", ""]);
  const [generatedReview, setGeneratedReview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!movieCd) {
      setMovie(null);
      setError(null);
      setKeywords(["", "", ""]);
      setGeneratedReview(null);
      setGenerationError(null);
      setCopied(false);
      return;
    }

    const fetchMovieDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/movie?movieCd=${movieCd}`);
        if (!response.ok) {
          throw new Error("영화 상세 정보를 가져오는데 실패했습니다.");
        }
        const data: MovieInfoResponse = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (data.movieInfoResult?.movieInfo) {
          setMovie(data.movieInfoResult.movieInfo);
        } else {
          throw new Error("영화 정보를 찾을 수 없습니다.");
        }
      } catch (err: any) {
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieCd]);

  if (!movieCd) return null;

  // Format date from YYYYMMDD to YYYY.MM.DD
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
  };

  // Keyword input handlers
  const handleKeywordChange = (index: number, val: string) => {
    const updated = [...keywords];
    updated[index] = val.substring(0, 15); // limit len
    setKeywords(updated);
  };

  // Generate AI Review
  const generateAIReview = async () => {
    if (!movie) return;

    // Filter empty keywords
    const activeKeywords = keywords.map(k => k.trim()).filter(Boolean);
    if (activeKeywords.length === 0) {
      setGenerationError("최소 1개 이상의 감상 키워드를 입력해주세요.");
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setGeneratedReview(null);
    setCopied(false);

    try {
      const genres = movie.genres.map(g => g.genreNm);
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieNm: movie.movieNm,
          genres,
          keywords: activeKeywords,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "AI 감상평 생성 과정에서 서버 에러가 발생했습니다.");
      }

      const resData = await response.json();
      setGeneratedReview(resData.review);
    } catch (err: any) {
      setGenerationError(err.message || "감상평 생성 도중 예기치 못한 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  // Copy Review to Clipboard
  const copyToClipboard = () => {
    if (!generatedReview) return;
    navigator.clipboard.writeText(generatedReview).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div 
      id="movie-detail-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id="movie-detail-dialog"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          id="modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors cursor-pointer text-gray-500 dark:text-gray-400"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          /* Loading Skeleton State */
          <div className="p-8 space-y-6 animate-pulse overflow-y-auto" id="modal-skeleton">
            <div className="space-y-3">
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-800 rounded" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-slate-850">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-slate-800 rounded" />
              <div className="h-20 bg-gray-200 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center space-y-4" id="modal-error-contents">
            <Film className="w-16 h-16 text-rose-400 mx-auto opacity-70" />
            <h3 className="font-sans font-bold text-lg text-rose-500">정보 수집 오류</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-lg bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 text-white font-medium text-sm transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        ) : movie ? (
          /* Movie Details Loaded Content */
          <>
            <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6" id="modal-loaded-contents">
              {/* Header Title Information */}
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {movie.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300"
                    >
                      <Tag className="w-3 h-3" />
                      {g.genreNm}
                    </span>
                  ))}
                  {movie.audits?.[0] && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-150/30">
                      <Award className="w-3 h-3" />
                      {movie.audits[0].watchGradeNm}
                    </span>
                  )}
                </div>

                <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white leading-tight">
                  {movie.movieNm}
                </h2>
                {movie.movieNmEn && (
                  <p className="text-sm text-slate-400 dark:text-slate-400 font-medium tracking-wide mt-1">
                    {movie.movieNmEn} {movie.prdtYear && `(${movie.prdtYear})`}
                  </p>
                )}
              </div>

              {/* Core Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/60 border border-gray-100/50 dark:border-slate-850">
                <div className="space-y-1">
                  <div className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>개봉일</span>
                  </div>
                  <p className="font-semibold text-sm">{formatDate(movie.openDt) || "미개봉"}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>상영 시간</span>
                  </div>
                  <p className="font-semibold text-sm">{movie.showTm}분</p>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" />
                    <span>영화 유형</span>
                  </div>
                  <p className="font-semibold text-sm">{movie.typeNm || "장편"}</p>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>제작 국가</span>
                  </div>
                  <p className="font-semibold text-sm">{movie.nations?.[0]?.nationNm || "정보없음"}</p>
                </div>
              </div>

              {/* Production and Directors */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-900 pb-2">
                  <Award className="w-4 h-4 text-sky-500" />
                  <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">제작진</h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-455 dark:text-slate-500 block text-xs font-semibold mb-1">감독</span>
                    {movie.directors && movie.directors.length > 0 ? (
                      <div className="space-y-1">
                        {movie.directors.map((dir, idx) => (
                          <div key={idx} className="font-medium text-slate-800 dark:text-slate-200">
                            {dir.peopleNm} <span className="text-xs text-slate-400 font-normal">{dir.peopleNmEn}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-550 text-xs">등록된 감독 정보가 없습니다.</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-slate-455 dark:text-slate-500 block text-xs font-semibold mb-1">제작/배급사</span>
                    {movie.companys && movie.companys.length > 0 ? (
                      <div className="space-y-1 text-slate-700 dark:text-slate-350 flex flex-wrap gap-x-2 gap-y-1 leading-relaxed text-xs">
                        {movie.companys.slice(0, 3).map((comp, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-900 font-medium">
                            {comp.companyNm} ({comp.companyPartNm})
                          </span>
                        ))}
                        {movie.companys.length > 3 && (
                          <span className="text-slate-400 font-medium">외 {movie.companys.length - 3}곳</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-550 text-xs">정보가 존재하지 않습니다.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Cast List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-slate-900 pb-2">
                  <Users className="w-4 h-4 text-sky-500" />
                  <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white">출연 배우</h3>
                </div>

                {movie.actors && movie.actors.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                    {movie.actors.slice(0, 6).map((actor, idx) => (
                      <div 
                        key={idx} 
                        className="p-3 rounded-lg border border-gray-100 dark:border-slate-850/50 bg-slate-50/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70 transition-colors"
                      >
                        <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">{actor.peopleNm}</div>
                        {actor.peopleNmEn && (
                          <div className="text-[10px] text-slate-400 truncate tracking-tight">{actor.peopleNmEn}</div>
                        )}
                        {actor.cast ? (
                          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-medium mt-1 truncate">
                            역: {actor.cast}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-medium mt-1">주연/조연</div>
                        )}
                      </div>
                    ))}
                    {movie.actors.length > 6 && (
                      <div className="flex items-center justify-center p-3 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 font-medium">
                        그 외 {movie.actors.length - 6}명의 출연진...
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 dark:text-slate-550 text-xs">등록된 배우 정보가 없습니다.</span>
                )}
              </div>

              {/* AI review Generator section */}
              <div id="ai-review-generator" className="p-5 md:p-6 rounded-2xl border border-sky-100 dark:border-sky-950/50 bg-sky-50/20 dark:bg-sky-950/10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500 text-slate-950 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white flex items-center gap-1">
                      AI 감상평 생성기
                    </h3>
                    <p className="text-[11px] text-slate-450 dark:text-slate-500">원하는 인상깊은 키워드 3개를 입력해 인공지능 감상평을 받아보세요.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2" id="keyword-inputs">
                  {keywords.map((kw, i) => (
                    <div key={i} className="relative">
                      <input
                        id={`keyword-input-${i}`}
                        type="text"
                        placeholder={`키워드 ${i + 1}`}
                        value={kw}
                        onChange={(e) => handleKeywordChange(i, e.target.value)}
                        className="w-full text-center px-2 py-2 text-xs font-semibold rounded-xl border border-gray-250 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 focus:outline-hidden focus:ring-1.5 focus:ring-sky-550 transition-all"
                      />
                    </div>
                  ))}
                </div>

                {generationError && (
                  <p className="text-xs text-rose-500 font-medium" id="review-gen-error">
                    ⚠ {generationError}
                  </p>
                )}

                <button
                  id="generate-review-submit-btn"
                  onClick={generateAIReview}
                  disabled={generating}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-950 dark:bg-sky-500 hover:bg-slate-850 dark:hover:bg-sky-600 hover:scale-[1.01] text-white dark:text-slate-950 transition-all duration-250 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {generating ? "AI 평론 작성 중..." : "AI 가 감상평(평론) 작성하기"}
                </button>

                {/* Animated Review Display */}
                <AnimatePresence mode="wait">
                  {generatedReview && (
                    <motion.div
                      id="review-result-container"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 rounded-xl border border-sky-100/60 dark:border-sky-900/40 bg-white/70 dark:bg-slate-900/60 relative group-hover:shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold uppercase tracking-wider">Gemini 가 지은 평론</span>
                        <button
                          id="copy-review-btn"
                          onClick={copyToClipboard}
                          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                          title="감상평 복사"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">복사됨</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>복사</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="font-sans text-xs md:text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line font-medium italic">
                        "{generatedReview}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Modal Source Footer */}
            <div 
              id="movie-detail-footer"
              className="px-6 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-900 text-right text-[10px] font-mono text-slate-400 dark:text-slate-650"
            >
              제공처: {movie.openDt ? "영화진흥위원회 오픈 API" : "KOBIS OpenAPI"}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-400" id="modal-no-data">
            영화를 찾을 수 없습니다.
          </div>
        )}
      </motion.div>
    </div>
  );
}
