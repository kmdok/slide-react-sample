import { Slide } from '@/components/Slide';
import type { ReactElement } from 'react';

type SlideProps = {
  direction: 'forward' | 'backward';
};

/**
 * コード例スライド
 */
export function CodeExampleSlide({ direction }: SlideProps): ReactElement {
  return (
    <Slide key="code-example" className="bg-gray-900 text-white" direction={direction}>
      <div>
        <h2 className="text-3xl font-bold mb-6">簡単な使い方</h2>
        <pre className="bg-gray-800 p-6 rounded-lg overflow-x-auto">
          <code className="text-green-400">{`<Slide className="bg-blue-500">
  <h1>タイトル</h1>
  <p>コンテンツ</p>
</Slide>`}</code>
        </pre>
        <p className="mt-6 text-gray-300">
          Slideコンポーネントの中に自由にコンテンツを配置できます
        </p>
      </div>
    </Slide>
  );
}
