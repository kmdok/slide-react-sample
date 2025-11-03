import { Slide } from '@/components/Slide';
import type { ReactElement } from 'react';

type SlideProps = {
  direction: 'forward' | 'backward';
};

/**
 * タイトルスライド
 */
export function TitleSlide({ direction }: SlideProps): ReactElement {
  return (
    <Slide key="title" className="bg-gradient-to-br from-blue-500 to-purple-600 text-white" direction={direction}>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">React Slideshow</h1>
        <p className="text-2xl">シンプルなスライドショーシステム</p>
      </div>
    </Slide>
  );
}
