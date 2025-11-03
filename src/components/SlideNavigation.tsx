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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 glass rounded-full px-6 py-3 shadow-xl">
      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/50 active:scale-95 transition-all duration-200"
        aria-label="前のスライド"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="px-3 py-1 text-sm font-semibold text-gray-700 tabular-nums">
        {currentIndex + 1} / {totalSlides}
      </div>

      <button
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/50 active:scale-95 transition-all duration-200"
        aria-label="次のスライド"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300/50 mx-1" />

      <button
        onClick={onToggleOverview}
        className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-white/50 active:scale-95 transition-all duration-200 flex items-center gap-2"
        aria-label="スライド一覧"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>一覧</span>
      </button>
    </div>
  );
}
