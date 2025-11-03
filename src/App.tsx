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
      // 一覧表示中は操作を受け付けない
      if (showOverview) {
        if (e.key === 'Escape') {
          setShowOverview(false);
        }
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        previousSlide();
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < totalSlides) {
          goToSlide(index);
        }
      } else if (e.key === 'o' || e.key === 'O') {
        // 'o'キーで一覧表示トグル
        setShowOverview(true);
      } else if (e.key === 'Escape') {
        setShowOverview(false);
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
