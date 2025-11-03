# CLAUDE.md

このファイルはClaude Code (claude.ai/code) がこのリポジトリのコードを扱う際のガイダンスです。

## プロジェクト概要

**React Slideshow**: Reactコンポーネントで作成するシンプルなスライドショーアプリケーション

**コンセプト**:
- ユーザーが「こんなスライドを作って」と依頼
- Reactコンポーネントとして直接スライドを作成
- 静的なコンポーネントを表示するだけのシンプルな設計

**技術スタック (2025)**:
- React 19.2.0
- TypeScript 5.7
- Vite 7.0
- TailwindCSS 4.1
- Motion 12 (アニメーション)
- React Router DOM 7.9.5

## 開発コマンド

```bash
pnpm dev              # 開発サーバー起動
pnpm build            # 本番ビルド
pnpm preview          # ビルドプレビュー
pnpm lint             # ESLint実行
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能コンポーネント
│   ├── Slide.tsx        # 単一スライドコンポーネント
│   └── SlideNavigation.tsx  # ナビゲーション
│
├── hooks/              # カスタムフック
│   └── useSlideNavigation.ts  # スライドナビゲーションロジック
│
├── slides/             # スライド定義
│   └── ExampleSlides.tsx  # スライド配列（ここに追加）
│
├── styles/             # スタイル
│   └── globals.css     # TailwindCSS設定
│
└── App.tsx             # メインアプリ
```

## 新しいスライドの作り方

### 1. `src/slides/ExampleSlides.tsx` を編集

```tsx
export const exampleSlides = [
  // 既存のスライド...

  // 新しいスライドを追加
  <Slide key="5" className="bg-blue-500 text-white">
    <div>
      <h1 className="text-4xl font-bold mb-4">新しいスライド</h1>
      <p className="text-xl">コンテンツをここに書く</p>
    </div>
  </Slide>,
];
```

### 2. Slideコンポーネントの使い方

```tsx
<Slide key="unique-key" className="カスタムスタイル">
  {/* 自由にコンテンツを配置 */}
</Slide>
```

**Props**:
- `key`: 一意のキー（必須）
- `className`: TailwindCSSクラス（背景色、テキストカラー等）
- `children`: スライドの中身（JSX）

### 3. TailwindCSSでスタイリング

```tsx
// グラデーション背景
<Slide className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">

// シンプルな背景
<Slide className="bg-gray-900 text-white">

// 白背景
<Slide className="bg-white text-gray-800">
```

## 主要機能

### キーボード操作

- `→` または `Space`: 次のスライド
- `←`: 前のスライド
- `1-9`: 該当番号のスライドへジャンプ

### アニメーション

Motion 12により、スライド切り替え時に自動的にアニメーションが適用されます：
- スライドイン/アウト
- フェード効果
- 0.3秒のトランジション

### ナビゲーション

画面下部に常時表示：
- 前へ/次へボタン
- 現在のスライド番号 / 総スライド数

## コード規約

### ファイル配置

- **スライド定義**: `src/slides/ExampleSlides.tsx` に全て記述
- **再利用コンポーネント**: `src/components/` に配置
- **ロジック**: `src/hooks/` にカスタムフックとして抽出

### TypeScript

- 型定義は必須
- `any`型は使用禁止
- Pathエイリアス `@/` を使用（例: `import { Slide } from '@/components/Slide'`）

### スタイリング

- TailwindCSS 4.1のユーティリティクラスを使用
- インラインスタイルは避ける
- 共通スタイルは`globals.css`に定義

## TailwindCSS 4.1 注意点

**CSS-First設定**: `tailwind.config.js`は不要。`src/styles/globals.css`で設定：

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  /* カスタムテーマ変数 */
}
```

## Motion 12 注意点

**React 19対応**: Motion 12はReact 19の並行レンダリングに最適化されています。

**基本パターン**:

```tsx
import { motion, AnimatePresence } from 'motion/react';

<AnimatePresence mode="wait">
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    コンテンツ
  </motion.div>
</AnimatePresence>
```

## よくある作業

### スライドの追加

1. `src/slides/ExampleSlides.tsx`を開く
2. `exampleSlides`配列に新しい`<Slide>`を追加
3. 保存（HMRで即座に反映）

### スタイルの変更

- Slideコンポーネントの`className`を編集
- TailwindCSSクラスで自由にデザイン

### ナビゲーションのカスタマイズ

- `src/components/SlideNavigation.tsx`を編集
- ボタンデザイン、位置、表示内容を変更可能

## ビルドとデプロイ

```bash
# TypeScriptチェック
pnpm exec tsc

# 本番ビルド
pnpm build

# 結果は dist/ に出力される
```

## パフォーマンス

- バンドルサイズ: ~100KB (gzipped)
- ビルド時間: ~2秒（Vite 7高速ビルド）
- 初回ロード: <1秒

## 制限事項

- スライドは静的なReactコンポーネント
- Markdown対応なし（不要）
- AI処理なし（不要）
- 動的読み込みなし（不要）

## トラブルシューティング

### ビルドエラー

```bash
pnpm exec tsc  # TypeScript型チェック
pnpm lint      # ESLint実行
```

### HMRが効かない

```bash
# 開発サーバー再起動
pnpm dev
```

### スタイルが反映されない

- TailwindCSSクラス名のタイポを確認
- `globals.css`が正しくインポートされているか確認

---

**最終更新**: 2025-11-03
**プロジェクトステータス**: シンプル実装完了
