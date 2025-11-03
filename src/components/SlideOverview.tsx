import { motion, AnimatePresence } from 'motion/react';
import type { ReactElement } from 'react';

interface SlideOverviewProps {
  slides: ReactElement[];
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  onClose: () => void;
}

/**
 * スライド一覧表示コンポーネント
 */
export function SlideOverview({
  slides,
  currentIndex,
  onSelectSlide,
  onClose,
}: SlideOverviewProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div className="container mx-auto px-6 py-12">
          {/* ヘッダー */}
          <div className="flex justify-between items-center mb-10">
            <div className="glass rounded-2xl px-6 py-3">
              <h2 className="text-2xl font-bold text-gray-800">スライド一覧</h2>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 glass rounded-full flex items-center justify-center text-gray-700 hover:bg-white/50 active:scale-95 transition-all duration-200"
              aria-label="閉じる"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* スライドグリッド */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlide(index);
                  onClose();
                }}
                className={`
                  relative cursor-pointer rounded-2xl overflow-hidden glass-card
                  ${
                    index === currentIndex
                      ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent'
                      : ''
                  }
                `}
              >
                {/* スライドのプレビュー（縮小版） */}
                <div className="aspect-video bg-white/80 relative overflow-hidden rounded-xl m-2">
                  <div className="absolute inset-0 flex items-center justify-center p-4 scale-[0.3] origin-top-left">
                    <div className="w-[333%] h-[333%]">{slide}</div>
                  </div>
                </div>

                {/* スライド情報 */}
                <div className="px-3 pb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    スライド {index + 1}
                  </span>
                  {index === currentIndex && (
                    <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs font-bold">
                      現在
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
