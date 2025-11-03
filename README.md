# React Slideshow

Reactコンポーネントで作るシンプルなスライドショーアプリケーション

> 🤖 **Claude Code を使用中の方へ**: `/new-slide` と `/edit-slide` コマンドでスライドを簡単に作成・編集できます！ [詳細はこちら](#-claude-code-カスタムコマンド推奨)

## 特徴

- ✨ **シンプル**: Reactコンポーネントで直接スライドを作成
- 🎨 **自由なデザイン**: TailwindCSSで完全カスタマイズ可能
- 🎬 **滑らかなアニメーション**: Motion 12による美しいトランジション
- ⌨️ **キーボード操作**: 矢印キーやスペースキーで操作
- ⚡ **高速**: Vite 7による爆速開発体験

## 技術スタック

- **React 19.2.0** - 最新の並行レンダリング
- **TypeScript 5.7** - 型安全な開発
- **Vite 7.0** - 高速ビルドツール
- **TailwindCSS 4.1** - ユーティリティファーストCSS
- **Motion 12** - Reactアニメーションライブラリ
- **React Router DOM 7.9.5** - ルーティング

## セットアップ

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev

# ブラウザで http://localhost:5173 を開く
```

## 🤖 Claude Code カスタムコマンド（推奨）

**Claude Code** を使っている場合、以下のカスタムコマンドでスライドを簡単に作成・編集できます：

### `/new-slide` - 新しいスライドを作成

対話的にスライドを作成します。以下の情報を聞かれます：

1. **スライドの内容** - 何のスライドか説明してください
   - 例: "プロジェクト紹介", "データ分析結果", "チームメンバー紹介"
2. **挿入位置** - 先頭/最後/特定の位置
3. **背景スタイル** - 青グラデーション/緑グラデーション/白背景/ダークモード

コマンドが自動的に：
- ✅ 適切なファイル名を生成（例: `ProjectIntroSlide.tsx`）
- ✅ スライドファイルを作成
- ✅ `index.tsx` に追加
- ✅ ビルドチェック

### `/edit-slide` - 既存のスライドを編集

既存のスライドを修正します：

1. **修正するスライドを選択**
2. **修正内容を選択**
   - タイトルを変更
   - 背景スタイルを変更
   - コンテンツ全体を書き換え
   - コンテンツを追加

コマンドが自動的にファイルを更新します。

---

## 手動でスライドを作成する場合

### 1. スライドファイルを作成

`src/slides/YourSlide.tsx` を作成：

```tsx
import { Slide } from '@/components/Slide';
import type { ReactElement } from 'react';

type SlideProps = {
  direction: 'forward' | 'backward';
};

export function YourSlide({ direction }: SlideProps): ReactElement {
  return (
    <Slide key="your-slide" className="bg-blue-500 text-white" direction={direction}>
      <div className="text-center">
        <h1 className="text-6xl font-bold">タイトル</h1>
        <p className="text-2xl">サブタイトル</p>
      </div>
    </Slide>
  );
}
```

### 2. index.tsx に追加

`src/slides/index.tsx` を編集：

```tsx
import { YourSlide } from './YourSlide';

export const slideComponents: SlideComponent[] = [
  TitleSlide,
  YourSlide,  // ← 追加（順番を変えるだけで表示順が変わる）
  FeaturesSlide,
  // ...
];
```

## URL構造

各スライドは独自のURLを持ちます：

- `/1` - 1番目のスライド
- `/2` - 2番目のスライド
- `/3` - 3番目のスライド
- ...

ブラウザの戻る/進むボタンでスライドを移動でき、特定のスライドをブックマークして共有できます。

## キーボード操作

| キー | 動作 |
|------|------|
| `→` または `Space` | 次のスライド |
| `←` | 前のスライド |
| `1-9` | 該当番号のスライドへジャンプ |
| `o` | スライド一覧を表示 |
| `Esc` | スライド一覧を閉じる |

## プロジェクト構造

```
src/
├── components/
│   ├── Slide.tsx              # スライドコンポーネント
│   ├── SlideNavigation.tsx    # ナビゲーション
│   └── SlideOverview.tsx      # スライド一覧表示
├── hooks/
│   └── useSlideNavigation.ts  # ナビゲーションロジック
├── slides/
│   ├── index.tsx              # スライド順序管理（ここで順番を変更）
│   ├── TitleSlide.tsx         # タイトルスライド
│   ├── FeaturesSlide.tsx      # 特徴説明
│   ├── CodeExampleSlide.tsx   # コード例
│   └── ThankYouSlide.tsx      # まとめ
└── App.tsx                     # メインアプリ（ルーティング設定）

.claude/
└── commands/
    ├── new-slide.md           # スライド作成コマンド
    └── edit-slide.md          # スライド編集コマンド
```

## 開発コマンド

```bash
pnpm dev       # 開発サーバー起動
pnpm build     # 本番ビルド
pnpm preview   # ビルドプレビュー
pnpm lint      # ESLint実行
```

## ビルド

```bash
pnpm build
```

`dist/` フォルダに出力されます。静的ファイルとして任意のホスティングサービスにデプロイ可能。

## カスタマイズ

> 💡 **ヒント**: スライドの編集には `/edit-slide` コマンドの使用を推奨します。

### スライドデザイン

TailwindCSSクラスで自由にスタイリング：

```tsx
// グラデーション背景
<Slide className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">

// ダークモード
<Slide className="bg-gray-900 text-white">

// 画像背景
<Slide className="bg-cover bg-center" style={{backgroundImage: 'url(/path/to/image.jpg)'}}>
```

### ナビゲーション

`src/components/SlideNavigation.tsx` でボタンデザインや位置を変更可能。

### アニメーション

`src/components/Slide.tsx` のMotion設定を編集：

```tsx
<motion.div
  initial={{ opacity: 0, x: 100 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -100 }}
  transition={{ duration: 0.5 }}  // アニメーション速度変更
>
```

## ライセンス

MIT

## サポート

問題が発生した場合は、`CLAUDE.md`を参照してください。
