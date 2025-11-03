# 技術カンファレンス用スライドショーアプリケーション - プロジェクト概要

## 📋 プロジェクトの目的

技術カンファレンスでの登壇用資料を、Reactベースのスライドショー形式で作成するアプリケーション。
**ユーザーがMarkdownで自然言語で書いた内容を、AIが自動的に美しいスライドレイアウトに変換する**ことが最大の特徴。

## 🎯 コアコンセプト

### ユーザー体験
1. **入力**: ユーザーはMarkdownファイルにコンテンツだけを記述（レイアウトは考えない）
2. **解析**: Claude APIがコンテンツを解析し、最適なレイアウトを自動判断
3. **生成**: 12種類のレイアウトテンプレートから自動選択して美しいスライドを生成
4. **プレゼン**: フルスクリーン、発表者ノート、タイマー機能で本格的な発表が可能

### 技術哲学
- **AI-First Design**: 手動レイアウト調整を最小化
- **Content-Focused**: ユーザーは内容に集中、デザインはAIに任せる
- **Modern Stack**: 2025年最新のReact/Vite/TailwindCSSエコシステム

## 🛠️ 技術スタック（2025年11月最新版）

### 開発環境
- **パッケージマネージャー: pnpm** - 高速・効率的な依存関係管理
- **Node.js 20.19+** - Vite 7の要件

### フロントエンド
- **React 19.2.0** - Activity API、useActionState活用
- **TypeScript 5.7** - 型安全性
- **Vite 7.0** - 高速ビルド（Vite 6から5x faster）
- **TailwindCSS 4.1** - CSS-First設定、Container Queries対応
- **Motion 12** (旧Framer Motion) - React 19並行レンダリング最適化

### AI/コンテンツ処理
- **@anthropic-ai/sdk 0.32.0** - Claude API統合
- **marked 15.0.0** - Markdownパース
- **unified 11.0.5** - コンテンツ処理パイプライン
- **gray-matter 4.0.3** - Frontmatter解析
- **prism-react-renderer 2.4.0** - シンタックスハイライト

### 状態管理/ルーティング
- **Zustand 5.0** - 軽量状態管理
- **React Router 7.0** - React 19対応版

## 📐 アーキテクチャ概要

```
Markdown入力 (.md)
    ↓
[Frontmatter解析]
    ↓
[Claude API] ← コンテンツ解析、レイアウト推論
    ↓
[Layout Template Selection] (12種類)
    ↓
[React Components] ← Motion 12アニメーション
    ↓
美しいスライド出力
```

## 🎨 12種類のレイアウトテンプレート

| レイアウト | 用途 | 自動選択条件 |
|-----------|------|-------------|
| `hero` | タイトルスライド | 大きな見出しのみ、冒頭スライド |
| `section-break` | セクション区切り | 短い見出し、セクション移行 |
| `content-left` | 左寄せコンテンツ | 標準的な文章 |
| `content-center` | 中央寄せ | 重要なメッセージ |
| `two-column` | 2カラム | 2つの概念を並列表示 |
| `code-focus` | コード中心 | コードブロックが主要コンテンツ |
| `image-text` | 画像+説明 | 画像参照がある |
| `list-emphasize` | 箇条書き強調 | 3つ以上の箇条書き |
| `quote` | 引用スライド | 引用文（`>`）がある |
| `comparison` | 比較表示 | "vs", "対", "比較"などの表現 |
| `timeline` | タイムライン | 時系列、ステップ表示 |
| `diagram` | 図解 | 図表、チャート、Mermaid |

## 🗂️ プロジェクト構造

```
slide-react-sample/
├── claudedocs/                          # 📚 ドキュメント（このディレクトリ）
│   ├── 00-PROJECT-OVERVIEW.md          # プロジェクト概要
│   ├── 01-ARCHITECTURE.md              # アーキテクチャ詳細
│   ├── 02-AI-LAYOUT-SYSTEM.md          # AI解析システム仕様
│   ├── 03-LAYOUT-TEMPLATES.md          # レイアウトテンプレート詳細
│   └── 04-IMPLEMENTATION-GUIDE.md      # 実装ガイド
│
├── src/
│   ├── lib/                            # 🧠 コアロジック
│   │   ├── ai-layout-engine.ts         # Claude API統合、レイアウト推論
│   │   ├── slide-processor.ts          # Markdown処理パイプライン
│   │   ├── layout-templates.ts         # テンプレート型定義
│   │   └── content-analyzer.ts         # コンテンツ構造解析
│   │
│   ├── components/
│   │   ├── slides/                     # スライド表示
│   │   │   ├── SlideContainer.tsx
│   │   │   ├── DynamicSlide.tsx        # AI選択レイアウトを動的レンダリング
│   │   │   └── SlideNavigation.tsx
│   │   │
│   │   ├── layouts/                    # 🎨 12種類のレイアウト実装
│   │   │   ├── HeroLayout.tsx
│   │   │   ├── CodeFocusLayout.tsx
│   │   │   ├── TwoColumnLayout.tsx
│   │   │   └── ... (全12種類)
│   │   │
│   │   └── presenter/                  # 発表者機能
│   │       ├── PresenterView.tsx
│   │       ├── SpeakerNotes.tsx
│   │       └── Timer.tsx
│   │
│   ├── hooks/                          # React Hooks
│   │   ├── useSlideNavigation.ts       # React 19 useActionState使用
│   │   ├── useKeyboard.ts
│   │   └── usePresenterMode.ts
│   │
│   ├── stores/                         # 状態管理
│   │   └── slideStore.ts               # Zustand
│   │
│   └── slides/                         # 📝 スライドコンテンツ
│       ├── content/                    # ← ユーザーがMarkdownを配置
│       │   └── example-talk.md
│       └── config.ts                   # スライド設定
│
├── public/
│   └── slides-assets/                  # 画像・メディアファイル
│
├── package.json
├── vite.config.ts
├── tailwind.config.ts                  # TailwindCSS 4.1設定
└── .env                                # VITE_ANTHROPIC_API_KEY
```

## 🚀 開発フェーズ

### Phase 1: 基盤構築 ✅ 設計完了
- [x] 技術スタック選定（最新版）
- [x] AI駆動レイアウトシステム設計
- [x] プロジェクト構造設計
- [ ] プロジェクト初期化（次のステップ）

### Phase 2: コア機能実装
- [ ] Markdown処理パイプライン
- [ ] Claude API統合
- [ ] 12種類のレイアウトコンポーネント
- [ ] スライドナビゲーション

### Phase 3: プレゼンテーション機能
- [ ] フルスクリーンモード
- [ ] 発表者ビュー
- [ ] タイマー機能
- [ ] キーボードショートカット

### Phase 4: 最適化・UX改善
- [ ] レイアウト解析キャッシング
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ対応
- [ ] PWA対応（オフライン動作）

## 💡 主要機能

### ✅ 実装予定機能

**コアスライド機能**
- Markdownからの自動スライド生成
- AIによる最適レイアウト選択
- 12種類のプロフェッショナルテンプレート
- スムーズなトランジションアニメーション
- シンタックスハイライト（コードブロック）

**プレゼンテーション機能**
- キーボードナビゲーション（矢印キー、Space）
- プログレスバー、スライド番号表示
- フルスクリーンモード
- 発表者ノート表示
- 次スライドプレビュー
- プレゼンテーションタイマー

**開発者体験**
- Hot Module Replacement
- TypeScript型安全性
- リアルタイムプレビュー
- レイアウトデバッグモード

### 🔮 将来的な拡張

- エクスポート機能（PDF、HTML静的サイト）
- リアルタイムMarkdown編集UI
- カスタムテーマシステム
- スライドテンプレートギャラリー
- マルチプレゼンテーション管理

## 📖 ドキュメント構成

### このディレクトリ（claudedocs/）の役割

今後のClaude Codeセッションで参照できるように、重要な設計・仕様を整理：

1. **00-PROJECT-OVERVIEW.md** (このファイル)
   - プロジェクト全体像、目的、技術スタック

2. **01-ARCHITECTURE.md**
   - 詳細なアーキテクチャ設計
   - データフロー、コンポーネント設計

3. **02-AI-LAYOUT-SYSTEM.md**
   - AI解析エンジンの仕様
   - Claude APIプロンプト設計
   - レイアウト選択アルゴリズム

4. **03-LAYOUT-TEMPLATES.md**
   - 12種類の各レイアウト詳細仕様
   - UIパターン、TailwindCSSクラス

5. **04-IMPLEMENTATION-GUIDE.md**
   - 実装の進め方
   - コーディング規約
   - トラブルシューティング

## 🔑 重要な設計判断

### なぜAI駆動なのか？
- 技術者はコンテンツに集中すべき（レイアウトは二の次）
- プレゼンごとに一貫性のあるデザインを自動保証
- 最新のLLM（Claude）の文脈理解能力を活用

### なぜReact 19なのか？
- Activity API → スライド表示/非表示の最適化
- 並行レンダリング → 大量スライドでもスムーズ
- useActionState → ナビゲーション状態管理の簡略化

### なぜTailwindCSS 4なのか？
- CSS-First設定 → JavaScript不要で高速
- Container Queries → レスポンシブスライド対応
- 100x faster builds → 開発体験向上

## 🎓 学習リソース

- [React 19 公式ドキュメント](https://react.dev/)
- [Vite 7 ガイド](https://vite.dev/)
- [TailwindCSS 4 ドキュメント](https://tailwindcss.com/)
- [Motion (Framer Motion) ドキュメント](https://motion.dev/)
- [Anthropic Claude API](https://docs.anthropic.com/)

---

**最終更新**: 2025-11-03
**プロジェクトステータス**: 設計完了、実装準備中
