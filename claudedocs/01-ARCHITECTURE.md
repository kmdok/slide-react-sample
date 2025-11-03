# アーキテクチャ詳細設計

## 🏗️ システムアーキテクチャ概要

### レイヤー構成

```
┌─────────────────────────────────────────────┐
│  Presentation Layer (React Components)      │
│  - DynamicSlide, LayoutComponents          │
│  - PresenterView, Navigation               │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│  Application Layer (Hooks & Stores)         │
│  - useSlideNavigation, usePresenterMode    │
│  - slideStore (Zustand)                    │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│  Domain Layer (Core Logic)                  │
│  - AI Layout Engine                        │
│  - Slide Processor                         │
│  - Content Analyzer                        │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│  Infrastructure Layer                       │
│  - Claude API Client                       │
│  - Markdown Parser (unified)               │
│  - File System Access                      │
└─────────────────────────────────────────────┘
```

## 📊 データフロー

### スライド生成フロー

```
[Markdown File] (.md)
    ↓
    ├─> [gray-matter] → Frontmatter抽出
    │                   (layout, theme, speakerNotes)
    ↓
[Slide Processor]
    ↓
    ├─> "---" で分割 → 個別スライド単位
    ↓
[Content Analyzer]
    ↓
    ├─> テキスト構造解析
    ├─> コードブロック検出
    ├─> 画像/リンク抽出
    ├─> 箇条書きカウント
    ↓
[AI Layout Engine] (Claude API)
    ↓
    ├─> レイアウト推論
    ├─> スタイリング決定
    ├─> 視覚的階層構築
    ↓
[Layout Template Selection]
    ↓
    ├─> 12種類からマッチング
    ↓
[React Component Rendering]
    ↓
    ├─> TailwindCSS スタイリング
    ├─> Motion 12 アニメーション
    ├─> Prism シンタックスハイライト
    ↓
[Display in Browser]
```

### ナビゲーションフロー

```
[User Input] (キーボード/クリック)
    ↓
[useKeyboard Hook]
    ↓
[slideStore.navigate()]
    ↓
    ├─> 現在のインデックス更新
    ├─> トランジション開始
    ├─> URL更新 (React Router)
    ↓
[DynamicSlide Re-render]
    ↓
    ├─> Motion 12 exit animation
    ├─> 新しいスライドのentry animation
    ↓
[Updated Display]
```

## 🧩 コンポーネント設計

### コンポーネント階層

```
<App>
  └─ <Router>
      ├─ <SlideShowView>
      │   ├─ <SlideContainer>
      │   │   └─ <DynamicSlide>           ← AIが選択したレイアウト
      │   │       └─ <*Layout>            ← 12種類のいずれか
      │   │           ├─ <MarkdownRenderer>
      │   │           ├─ <CodeBlock>
      │   │           └─ <ImageViewer>
      │   │
      │   ├─ <SlideNavigation>
      │   │   ├─ <ProgressBar>
      │   │   └─ <SlideCounter>
      │   │
      │   └─ <KeyboardHandler>
      │
      └─ <PresenterView>
          ├─ <MainSlide>
          ├─ <NextSlidePreview>
          ├─ <SpeakerNotes>
          └─ <Timer>
```

### 主要コンポーネント責務

#### 1. DynamicSlide
```typescript
// 責務: AIが選択したレイアウトを動的にレンダリング
interface DynamicSlideProps {
  slide: ProcessedSlide;
  isActive: boolean;
}

// 処理:
// - aiAnalysis.layout から適切なコンポーネントを選択
// - Motion 12 でトランジション制御
// - Activity API で表示/非表示最適化
```

#### 2. SlideContainer
```typescript
// 責務: スライド全体のコンテナ、状態管理
// - 現在のスライドインデックス管理
// - キーボードイベントハンドリング
// - フルスクリーン制御
```

#### 3. LayoutComponents (12種類)
```typescript
// 責務: 各レイアウトパターンの具体的な実装
// 共通インターフェース:
interface LayoutProps {
  content: string;              // Markdown文字列
  styling: StylingConfig;       // AIが決定したスタイル
  hierarchy: VisualHierarchy;   // 要素の重要度
  colorScheme?: ColorScheme;    // テーマカラー
}

// 各レイアウトが実装:
// - TailwindCSSによるスタイリング
// - レスポンシブ対応
// - アクセシビリティ配慮
```

#### 4. PresenterView
```typescript
// 責務: 発表者専用ビュー（別ウィンドウ）
// - 現在のスライド表示
// - 次のスライドプレビュー
// - 発表者ノート表示
// - タイマー表示
// - 画面同期（BroadcastChannel API）
```

## 🔧 主要モジュール詳細

### AI Layout Engine

```typescript
// src/lib/ai-layout-engine.ts

/**
 * Claude APIを使用してコンテンツを解析し、最適なレイアウトを推論
 */
export class AILayoutEngine {
  private client: Anthropic;
  private cache: Map<string, SlideAnalysis>;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
    this.cache = new Map();
  }

  /**
   * コンテンツを解析してレイアウトを決定
   */
  async analyzeContent(
    markdown: string,
    context?: AnalysisContext
  ): Promise<SlideAnalysis> {
    // キャッシュチェック
    const cacheKey = this.generateCacheKey(markdown, context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Claude APIで解析
    const analysis = await this.callClaudeAPI(markdown, context);

    // キャッシュに保存
    this.cache.set(cacheKey, analysis);

    return analysis;
  }

  /**
   * Claude APIを呼び出し
   */
  private async callClaudeAPI(
    markdown: string,
    context?: AnalysisContext
  ): Promise<SlideAnalysis> {
    const prompt = this.buildPrompt(markdown, context);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    return this.parseResponse(response);
  }
}
```

### Slide Processor

```typescript
// src/lib/slide-processor.ts

/**
 * Markdownファイルを処理してスライドデータに変換
 */
export class SlideProcessor {
  private layoutEngine: AILayoutEngine;
  private markdownParser: unified.Processor;

  /**
   * ファイルを読み込んでスライド配列に変換
   */
  async processFile(filePath: string): Promise<ProcessedSlide[]> {
    // 1. ファイル読み込み
    const content = await this.readFile(filePath);

    // 2. スライド分割（"---" 区切り）
    const rawSlides = this.splitSlides(content);

    // 3. 各スライドを並列処理
    const slides = await Promise.all(
      rawSlides.map((raw, index) =>
        this.processSlide(raw, index, rawSlides)
      )
    );

    return slides;
  }

  /**
   * 個別スライドの処理
   */
  private async processSlide(
    raw: string,
    index: number,
    allSlides: string[]
  ): Promise<ProcessedSlide> {
    // Frontmatter解析
    const { data: frontmatter, content } = matter(raw);

    // AI解析（layout指定がない場合）
    let aiAnalysis: SlideAnalysis;
    if (!frontmatter.layout || frontmatter.layout === 'auto') {
      aiAnalysis = await this.layoutEngine.analyzeContent(content, {
        previousSlide: index > 0 ? allSlides[index - 1] : undefined,
        nextSlide: allSlides[index + 1]
      });
    } else {
      aiAnalysis = this.createManualAnalysis(frontmatter.layout);
    }

    // Markdown AST生成
    const ast = await this.markdownParser.parse(content);

    return {
      id: `slide-${index}`,
      rawMarkdown: content,
      frontmatter,
      aiAnalysis,
      ast
    };
  }
}
```

### Content Analyzer

```typescript
// src/lib/content-analyzer.ts

/**
 * Markdownコンテンツの構造を解析
 */
export class ContentAnalyzer {
  /**
   * コンテンツの特徴を抽出
   */
  analyze(markdown: string): ContentFeatures {
    return {
      // テキスト特徴
      wordCount: this.countWords(markdown),
      headingCount: this.countHeadings(markdown),
      headingLevels: this.extractHeadingLevels(markdown),

      // 構造要素
      hasCodeBlock: this.detectCodeBlocks(markdown),
      codeLanguage: this.extractCodeLanguage(markdown),
      listItemCount: this.countListItems(markdown),

      // メディア
      imageCount: this.countImages(markdown),
      imageUrls: this.extractImageUrls(markdown),

      // 特殊パターン
      hasQuote: this.detectQuotes(markdown),
      hasTable: this.detectTables(markdown),
      hasComparison: this.detectComparison(markdown),
      hasTimeline: this.detectTimeline(markdown),

      // センチメント
      emphasis: this.calculateEmphasis(markdown),
      complexity: this.calculateComplexity(markdown)
    };
  }

  /**
   * コードブロック検出
   */
  private detectCodeBlocks(markdown: string): boolean {
    return /```[\s\S]*?```/.test(markdown);
  }

  /**
   * 比較表現検出（"vs", "対", "比較"など）
   */
  private detectComparison(markdown: string): boolean {
    const patterns = [
      /vs\.?/i,
      /versus/i,
      /対して/,
      /比較/,
      /違い/,
      /差異/,
      /\|\s*\w+\s*\|\s*\w+\s*\|/  // テーブル形式
    ];
    return patterns.some(pattern => pattern.test(markdown));
  }
}
```

## 🎨 スタイリングシステム

### TailwindCSS 4.1 設定

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* カラーパレット */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  --color-secondary-500: #8b5cf6;
  --color-accent-500: #f59e0b;

  /* タイポグラフィ */
  --font-heading: 'Inter Variable', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-code: 'Fira Code', monospace;

  /* スペーシング（スライド専用） */
  --spacing-slide-xs: 1rem;
  --spacing-slide-sm: 2rem;
  --spacing-slide-md: 4rem;
  --spacing-slide-lg: 6rem;
  --spacing-slide-xl: 8rem;

  /* コンテナ */
  --container-slide: 1280px;
  --container-slide-sm: 960px;

  /* アニメーション */
  --transition-slide: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* レイアウト別ベーススタイル */
.slide-container {
  @apply w-screen h-screen overflow-hidden;
  @apply bg-white dark:bg-gray-900;
  @apply text-gray-900 dark:text-gray-100;
}

.slide-hero {
  @apply flex flex-col items-center justify-center;
  @apply text-center;
}

.slide-code-focus {
  @apply flex flex-col p-12;
}

.slide-two-column {
  @apply grid grid-cols-2 gap-8 p-12;
}

/* Container Queries活用 */
@container slide (min-width: 1024px) {
  .slide-content {
    font-size: 1.25rem;
  }
}

@container slide (min-width: 1280px) {
  .slide-content {
    font-size: 1.5rem;
  }
}
```

### Motion 12 アニメーション設定

```typescript
// src/lib/transitions.ts

export const slideTransitions = {
  // スライド遷移（左から右）
  slide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  },

  // フェード
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },

  // ズーム
  zoom: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};

// React 19 Activity API統合
export const slideActivityConfig = {
  visible: {
    opacity: 1,
    display: 'block'
  },
  hidden: {
    opacity: 0,
    display: 'none',
    transitionEnd: {
      display: 'none'
    }
  }
};
```

## 🔌 外部API統合

### Claude API統合

```typescript
// src/lib/claude-client.ts

export class ClaudeClient {
  private client: Anthropic;
  private rateLimiter: RateLimiter;

  constructor(config: ClaudeConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey
    });
    this.rateLimiter = new RateLimiter({
      maxRequests: 50,
      perMilliseconds: 60000  // 1分間に50リクエスト
    });
  }

  async analyze(prompt: string): Promise<string> {
    await this.rateLimiter.wait();

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,  // 一貫性重視
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return this.extractText(response);
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error('AI analysis failed');
    }
  }
}
```

## 🗄️ 状態管理

### Zustand Store設計

```typescript
// src/stores/slideStore.ts

interface SlideState {
  // スライドデータ
  slides: ProcessedSlide[];
  currentIndex: number;
  totalSlides: number;

  // プレゼンテーション状態
  isPresenting: boolean;
  isFullscreen: boolean;
  showNotes: boolean;

  // タイマー
  startTime: number | null;
  elapsedTime: number;

  // アクション
  loadSlides: (slides: ProcessedSlide[]) => void;
  navigate: (direction: 'next' | 'prev' | number) => void;
  togglePresenting: () => void;
  toggleFullscreen: () => void;
  toggleNotes: () => void;
  startTimer: () => void;
  stopTimer: () => void;
}

export const useSlideStore = create<SlideState>((set, get) => ({
  slides: [],
  currentIndex: 0,
  totalSlides: 0,
  isPresenting: false,
  isFullscreen: false,
  showNotes: false,
  startTime: null,
  elapsedTime: 0,

  loadSlides: (slides) => set({
    slides,
    totalSlides: slides.length,
    currentIndex: 0
  }),

  navigate: (direction) => set((state) => {
    let newIndex = state.currentIndex;

    if (typeof direction === 'number') {
      newIndex = direction;
    } else if (direction === 'next') {
      newIndex = Math.min(state.currentIndex + 1, state.totalSlides - 1);
    } else if (direction === 'prev') {
      newIndex = Math.max(state.currentIndex - 1, 0);
    }

    return { currentIndex: newIndex };
  }),

  togglePresenting: () => set((state) => ({
    isPresenting: !state.isPresenting
  })),

  toggleFullscreen: () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      set({ isFullscreen: false });
    }
  }
}));
```

## 🔐 セキュリティ考慮事項

### API Key管理
```bash
# .env
VITE_ANTHROPIC_API_KEY=sk-ant-xxxxx

# .env.example（Gitにコミット）
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### XSS対策
- Markdownレンダリング時に `dangerouslySetInnerHTML` を使用しない
- DOMPurify等のサニタイズライブラリ使用（必要に応じて）
- ユーザー入力はすべてエスケープ

### レート制限
- Claude API: 1分間に50リクエスト
- キャッシング機構で重複リクエスト防止
- エラーハンドリングとフォールバック

## 📈 パフォーマンス最適化

### ビルド最適化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['motion'],
          'vendor-markdown': ['marked', 'unified', 'remark-parse'],
          'vendor-ai': ['@anthropic-ai/sdk']
        }
      }
    }
  }
});
```

### ランタイム最適化
- スライドの遅延ロード（React.lazy）
- 画像の最適化（WebP、lazy loading）
- AI解析結果のキャッシング
- React 19 並行レンダリング活用

---

**最終更新**: 2025-11-03
