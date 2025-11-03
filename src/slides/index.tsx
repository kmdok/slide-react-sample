import type { ReactElement } from 'react';
import { TitleSlide } from './TitleSlide';
import { FeaturesSlide } from './FeaturesSlide';
import { CodeExampleSlide } from './CodeExampleSlide';
import { ThankYouSlide } from './ThankYouSlide';

/**
 * スライド管理ファイル
 *
 * このファイルでスライドの順番を管理します。
 * 新しいスライドを追加する場合：
 * 1. src/slides/YourSlide.tsx を作成（内容ベースのファイル名推奨）
 * 2. ここでimportして配列に追加
 * 3. 順番を変えたい時は配列の順序を変更するだけ
 */

/**
 * スライドコンポーネントの型定義
 */
export type SlideComponent = (props: { direction: 'forward' | 'backward' }) => ReactElement;

/**
 * スライドの順番を定義する配列
 * この配列の順番がスライドショーの表示順になります
 */
export const slideComponents: SlideComponent[] = [
  TitleSlide,
  FeaturesSlide,
  CodeExampleSlide,
  ThankYouSlide,
];

/**
 * スライドを生成する関数
 */
export function createSlides(direction: 'forward' | 'backward'): ReactElement[] {
  return slideComponents.map((SlideComponent, index) => (
    <SlideComponent key={index} direction={direction} />
  ));
}
