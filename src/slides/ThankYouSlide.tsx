import { Slide } from '@/components/Slide';
import type { ReactElement } from 'react';

type SlideProps = {
  direction: 'forward' | 'backward';
};

/**
 * まとめスライド
 */
export function ThankYouSlide({ direction }: SlideProps): ReactElement {
  return (
    <Slide key="thank-you" className="bg-gradient-to-br from-green-500 to-teal-600 text-white" direction={direction}>
      <div className="text-center">
        <h2 className="text-5xl font-bold mb-6">ありがとうございました</h2>
        <p className="text-2xl mb-8">質問はありますか？</p>
        <div className="text-lg opacity-80">
          <p>スライドを追加するには：</p>
          <p className="font-mono mt-2">src/slides/ に新しいファイルを作成</p>
          <p className="font-mono mt-1">src/slides/index.ts で配列に追加</p>
        </div>
      </div>
    </Slide>
  );
}
