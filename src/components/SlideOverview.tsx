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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">スライド一覧</h2>
            <button
              onClick={onClose}
              className="text-white text-4xl hover:text-gray-300 transition"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSlide(index);
                  onClose();
                }}
                className={`
                  relative cursor-pointer rounded-lg overflow-hidden
                  border-4 transition-all transform hover:scale-105
                  ${
                    index === currentIndex
                      ? 'border-blue-500 ring-4 ring-blue-300'
                      : 'border-gray-600 hover:border-gray-400'
                  }
                `}
              >
                {/* スライドのプレビュー（縮小版） */}
                <div className="aspect-video bg-white relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center p-4 scale-[0.3] origin-top-left">
                    <div className="w-[333%] h-[333%]">{slide}</div>
                  </div>
                </div>

                {/* スライド番号 */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {index + 1}
                </div>

                {/* 現在のスライドマーカー */}
                {index === currentIndex && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                    現在
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
