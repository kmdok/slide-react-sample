import { useEffect, useMemo, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { SlideNavigation } from '@/components/SlideNavigation';
import { SlideOverview } from '@/components/SlideOverview';
import { createSlides, slideComponents } from '@/slides';

/**
 * App - メインアプリケーションコンポーネント
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/1" replace />} />
        <Route path="/:slideNumber" element={<SlideshowPage />} />
        <Route path="*" element={<Navigate to="/1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * スライドショーページ
 */
function SlideshowPage() {
  const { slideNumber } = useParams<{ slideNumber: string }>();
  const navigate = useNavigate();
  const [showOverview, setShowOverview] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // URLパラメータからスライド番号を取得（1始まり → 0始まりのindexに変換）
  const currentIndex = useMemo(() => {
    const num = parseInt(slideNumber || '1', 10);
    if (isNaN(num) || num < 1 || num > slideComponents.length) {
      return 0;
    }
    return num - 1;
  }, [slideNumber]);

  // スライドを方向に応じて生成
  const slides = useMemo(() => createSlides(direction), [direction]);
  const totalSlides = slideComponents.length;

  // スライド遷移関数（URLを更新）
  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides) return;

    const newDirection = index > currentIndex ? 'forward' : 'backward';
    setDirection(newDirection);
    navigate(`/${index + 1}`);
  }, [currentIndex, totalSlides, navigate]);

  const nextSlide = useCallback(() => {
    if (currentIndex < totalSlides - 1) {
      setDirection('forward');
      navigate(`/${currentIndex + 2}`);
    }
  }, [currentIndex, totalSlides, navigate]);

  const previousSlide = useCallback(() => {
    if (currentIndex > 0) {
      setDirection('backward');
      navigate(`/${currentIndex}`);
    }
  }, [currentIndex, navigate]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 一覧表示中の操作
      if (showOverview) {
        if (e.key === 'Escape' || e.key === 'ArrowDown') {
          e.preventDefault();
          setShowOverview(false);
        }
        return;
      }

      // 通常のスライド表示中の操作
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setShowOverview(true);
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < totalSlides) {
          goToSlide(index);
        }
      } else if (e.key === 'o' || e.key === 'O') {
        // 'o'キーでも一覧表示可能（後方互換性のため残す）
        setShowOverview(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showOverview, currentIndex, totalSlides, nextSlide, previousSlide, goToSlide]);

  return (
    <>
      {/* 通常表示（画面用） */}
      <div className="relative w-full h-screen overflow-hidden print:hidden">
        <AnimatePresence mode="wait">
          {slides[currentIndex]}
        </AnimatePresence>

        {/* 左クリックエリア（前のスライド） */}
        {currentIndex > 0 && (
          <button
            onClick={previousSlide}
            className="absolute left-0 top-0 h-full w-24 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300 group z-10"
            aria-label="前のスライド"
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        )}

        {/* 右クリックエリア（次のスライド） */}
        {currentIndex < totalSlides - 1 && (
          <button
            onClick={nextSlide}
            className="absolute right-0 top-0 h-full w-24 cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300 group z-10"
            aria-label="次のスライド"
          >
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 glass rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>
        )}

        <SlideNavigation
          currentIndex={currentIndex}
          totalSlides={totalSlides}
          onPrevious={previousSlide}
          onNext={nextSlide}
          onToggleOverview={() => setShowOverview(!showOverview)}
        />

        {showOverview && (
          <SlideOverview
            slides={slides}
            currentIndex={currentIndex}
            onSelectSlide={goToSlide}
            onClose={() => setShowOverview(false)}
          />
        )}
      </div>

      {/* 印刷用表示（全スライド縦並び） */}
      <div className="hidden print:block slideshow-container">
        {slides.map((slide, index) => (
          <div key={index} className="print-slide">
            {slide}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
