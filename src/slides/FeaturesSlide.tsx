import { Slide } from '@/components/Slide';
import type { ReactElement } from 'react';

type SlideProps = {
  direction: 'forward' | 'backward';
};

/**
 * 特徴説明スライド
 */
export function FeaturesSlide({ direction }: SlideProps): ReactElement {
  return (
    <Slide key="features" className="bg-white" direction={direction}>
      <div>
        <h2 className="text-4xl font-bold mb-8 text-gray-800">主な特徴</h2>
        <ul className="space-y-4 text-xl text-gray-700">
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>Reactコンポーネントで直接スライドを作成</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>Motion 12による滑らかなアニメーション</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>TailwindCSSで自由にスタイリング</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3">✓</span>
            <span>キーボード操作対応</span>
          </li>
        </ul>
      </div>
    </Slide>
  );
}
