interface SlideNavigationProps {
  currentIndex: number;
  totalSlides: number;
  onPrevious: () => void;
  onNext: () => void;
  onToggleOverview: () => void;
}

/**
 * スライドナビゲーションコンポーネント
 */
export function SlideNavigation({
  currentIndex,
  totalSlides,
  onPrevious,
  onNext,
  onToggleOverview,
}: SlideNavigationProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur px-6 py-3 rounded-full shadow-lg">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        aria-label="前のスライド"
      >
        ←
      </button>
      <span className="text-sm font-medium">
        {currentIndex + 1} / {totalSlides}
      </span>
      <button
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
        className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition"
        aria-label="次のスライド"
      >
        →
      </button>
      <div className="w-px h-6 bg-gray-300 mx-2" />
      <button
        onClick={onToggleOverview}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
        aria-label="スライド一覧"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="text-sm">一覧</span>
      </button>
    </div>
  );
}
