# Claude Documentation Index

このディレクトリには、技術カンファレンス用スライドショーアプリケーションの設計・実装ドキュメントが含まれています。

## 📚 ドキュメント一覧

### [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md)
**プロジェクト概要**
- プロジェクトの目的とコアコンセプト
- 2025年11月最新の技術スタック
- 12種類のレイアウトテンプレート概要
- プロジェクト構造
- 開発フェーズ

**こんな時に参照:**
- プロジェクト全体像を把握したい
- 使用している技術スタックを確認したい
- 各ドキュメントの役割を理解したい

---

### [01-ARCHITECTURE.md](./01-ARCHITECTURE.md)
**アーキテクチャ詳細設計**
- システムアーキテクチャとレイヤー構成
- データフロー（スライド生成、ナビゲーション）
- コンポーネント設計と階層
- 主要モジュール詳細
- TailwindCSS 4.1とMotion 12設定
- 状態管理（Zustand）
- パフォーマンス最適化

**こんな時に参照:**
- システム全体の設計を理解したい
- コンポーネント間の関係を確認したい
- データがどう流れるか知りたい
- 状態管理の実装方法を確認したい

---

### [02-AI-LAYOUT-SYSTEM.md](./02-AI-LAYOUT-SYSTEM.md)
**AI レイアウトシステム詳細仕様**
- Claude APIを使ったレイアウト推論システム
- 4フェーズの判断アルゴリズム
  - Phase 1: 構造解析（ContentAnalyzer）
  - Phase 2: ヒューリスティックマッチング
  - Phase 3: AI解析（Claude API）
  - Phase 4: スタイリング決定
- キャッシング戦略
- パフォーマンス指標

**こんな時に参照:**
- AIがどうレイアウトを選択するか理解したい
- ContentAnalyzerの実装方法を確認したい
- Claude APIのプロンプト設計を見たい
- キャッシングの実装を知りたい

---

### [03-LAYOUT-TEMPLATES.md](./03-LAYOUT-TEMPLATES.md)
**レイアウトテンプレート詳細仕様**
- 12種類のレイアウト詳細
  1. Hero（タイトルスライド）
  2. Section Break（セクション区切り）
  3. Code Focus（コード中心）
  4. Two Column（2カラム）
  5. List Emphasize（箇条書き強調）
  6. Comparison（比較表示）
  7. Quote（引用スライド）
  8. Image Text（画像+テキスト）
  9. Timeline（タイムライン）
  10-12. その他のレイアウト
- 各レイアウトの用途、自動選択条件、実装例
- TailwindCSSクラス、Motion 12アニメーション

**こんな時に参照:**
- 特定のレイアウトの実装方法を知りたい
- どんな条件で各レイアウトが選ばれるか確認したい
- TailwindCSSのクラス設計を見たい
- アニメーションの実装例を参考にしたい

---

### [04-IMPLEMENTATION-GUIDE.md](./04-IMPLEMENTATION-GUIDE.md)
**実装ガイド**
- Phase別の実装手順
  - Phase 1: プロジェクト基盤（npm install、設定ファイル）
  - Phase 2: コアロジック実装
  - Phase 3: レイアウトコンポーネント
  - Phase 4: 状態管理とナビゲーション
- 型定義
- サンプルMarkdownファイル
- テストとデバッグ方法

**こんな時に参照:**
- 実装を始める時
- 環境構築の手順を確認したい
- 依存関係のバージョンを確認したい
- サンプルコードを参考にしたい

---

## 🔍 クイックリファレンス

### 実装を始める場合
1. [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) で全体像を把握
2. [04-IMPLEMENTATION-GUIDE.md](./04-IMPLEMENTATION-GUIDE.md) でPhase 1を実装

### アーキテクチャを理解したい場合
1. [01-ARCHITECTURE.md](./01-ARCHITECTURE.md) でシステム全体を理解
2. [02-AI-LAYOUT-SYSTEM.md](./02-AI-LAYOUT-SYSTEM.md) でAIシステムを深掘り

### レイアウトを追加・修正したい場合
1. [03-LAYOUT-TEMPLATES.md](./03-LAYOUT-TEMPLATES.md) で既存レイアウトを確認
2. [02-AI-LAYOUT-SYSTEM.md](./02-AI-LAYOUT-SYSTEM.md) で自動選択条件を調整

### トラブルシューティング
- AI解析が期待通り動かない → [02-AI-LAYOUT-SYSTEM.md](./02-AI-LAYOUT-SYSTEM.md)
- レイアウトの表示がおかしい → [03-LAYOUT-TEMPLATES.md](./03-LAYOUT-TEMPLATES.md)
- ビルドエラー → [04-IMPLEMENTATION-GUIDE.md](./04-IMPLEMENTATION-GUIDE.md)

---

## 🎯 プロジェクトの特徴

### ユーザー視点
- **Markdownで書くだけ**: レイアウトはAIが自動選択
- **美しいスライド**: プロフェッショナルなデザイン
- **発表者機能**: ノート、タイマー、プレビュー完備

### 技術的特徴
- **AI駆動**: Claude API（Sonnet 4）でレイアウト推論
- **最新技術**: React 19.2、Vite 7、TailwindCSS 4.1
- **高性能**: キャッシング、並行レンダリング、最適化

### 開発者体験
- **型安全**: TypeScript 5.7
- **Hot Reload**: Vite 7の高速HMR
- **包括的ドキュメント**: このディレクトリのドキュメント群

---

## 📝 ドキュメント更新履歴

- **2025-11-03**: 初版作成
  - プロジェクト概要
  - アーキテクチャ設計
  - AI レイアウトシステム仕様
  - レイアウトテンプレート詳細
  - 実装ガイド

---

## 🚀 次のアクション

今後のClaude Codeセッションでは、これらのドキュメントを参照しながら実装を進めます。

**推奨される開始手順:**
1. [04-IMPLEMENTATION-GUIDE.md](./04-IMPLEMENTATION-GUIDE.md) のPhase 1から開始
2. 各Phaseを順番に実装
3. 必要に応じて他のドキュメントを参照

---

**最終更新**: 2025-11-03
