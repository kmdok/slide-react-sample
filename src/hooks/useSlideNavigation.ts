import { useState, useCallback } from 'react';

/**
 * スライドナビゲーション用カスタムフック
 */
export function useSlideNavigation(totalSlides: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < totalSlides - 1) {
        setDirection('forward');
        return prev + 1;
      }
      return prev;
    });
  }, [totalSlides]);

  const previousSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        setDirection('backward');
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSlides) {
        setDirection(index > currentIndex ? 'forward' : 'backward');
        setCurrentIndex(index);
      }
    },
    [totalSlides, currentIndex]
  );

  return {
    currentIndex,
    direction,
    nextSlide,
    previousSlide,
    goToSlide,
  };
}
