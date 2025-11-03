# 実装ガイド

## ⚠️ 重要: パッケージマネージャー

**このプロジェクトでは `pnpm` を使用します。`npm` や `yarn` は使用しません。**

```bash
# pnpmインストール確認（未インストールの場合）
npm install -g pnpm

# pnpmバージョン確認
pnpm --version
```

---

## 🚀 実装フェーズと優先順位

### Phase 1: プロジェクト基盤（最優先）

#### 1.1 プロジェクト初期化
```bash
# Vite + React + TypeScript
pnpm create vite@latest . -- --template react-ts

# 依存関係インストール
pnpm install react@19.2.0 react-dom@19.2.0
pnpm install react-router-dom@7.0.0
pnpm install motion@12.23.24
pnpm install zustand@5.0.0
pnpm install @anthropic-ai/sdk@0.32.0
pnpm install marked@15.0.0 gray-matter@4.0.3
pnpm install prism-react-renderer@2.4.0
pnpm install clsx@2.1.1 lucide-react@0.460.0

# 開発依存関係
pnpm install -D vite@7.0.0
pnpm install -D typescript@5.7.0
pnpm install -D @vitejs/plugin-react@4.3.0
pnpm install -D tailwindcss@4.1.0 postcss@8.4.47 autoprefixer@10.4.20
pnpm install -D eslint@9.15.0 prettier@3.3.3
pnpm install -D @types/node
```

#### 1.2 TailwindCSS 4.1 設定
```bash
# 初期化
npx tailwindcss init

# src/styles/globals.css
touch src/styles/globals.css
```

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* カスタムカラー */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* フォント */
  --font-heading: 'Inter Variable', sans-serif;
  --font-code: 'Fira Code', monospace;
}
```

#### 1.3 環境変数設定
```bash
# .env.example
echo "VITE_ANTHROPIC_API_KEY=your_api_key_here" > .env.example

# .env（実際のAPIキー）
cp .env.example .env
# .envを編集してAPIキーを入力

# .gitignoreに追加
echo ".env" >> .gitignore
```

#### 1.4 Vite設定
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['motion'],
          'vendor-markdown': ['marked', 'gray-matter', 'prism-react-renderer'],
          'vendor-ai': ['@anthropic-ai/sdk']
        }
      }
    }
  }
});
```

#### 1.5 TypeScript設定
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

### Phase 2: コアロジック実装

#### 2.1 ディレクトリ構造作成
```bash
mkdir -p src/{lib,components/{slides,layouts,presenter,ui},hooks,stores,slides/content,styles}
```

#### 2.2 型定義
```typescript
// src/types/index.ts
export type SlideLayout =
  | 'hero'
  | 'section-break'
  | 'content-left'
  | 'content-center'
  | 'two-column'
  | 'code-focus'
  | 'image-text'
  | 'list-emphasize'
  | 'quote'
  | 'comparison'
  | 'timeline'
  | 'diagram';

export interface StylingConfig {
  titleSize: 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  contentAlign: 'left' | 'center' | 'right';
  spacing: 'compact' | 'normal' | 'spacious';
  emphasis: 'subtle' | 'moderate' | 'strong';
}

export interface VisualHierarchy {
  primary: string[];
  secondary: string[];
  tertiary: string[];
}

export interface SlideAnalysis {
  layout: SlideLayout;
  confidence: number;
  reasoning: string;
  styling: StylingConfig;
  visualHierarchy: VisualHierarchy;
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

export interface ProcessedSlide {
  id: string;
  rawMarkdown: string;
  frontmatter: {
    layout?: SlideLayout;
    theme?: 'light' | 'dark';
    transition?: string;
    speakerNotes?: string;
  };
  aiAnalysis: SlideAnalysis;
}

export interface ContentFeatures {
  wordCount: number;
  headingCount: number;
  headingLevels: number[];
  firstHeadingLevel: number;
  hasCodeBlock: boolean;
  codeBlockCount: number;
  codeLanguage: string | null;
  listItemCount: number;
  imageCount: number;
  hasQuote: boolean;
  hasComparison: boolean;
  hasTimeline: boolean;
  emphasisLevel: 'low' | 'medium' | 'high';
  complexityScore: number;
}
```

#### 2.3 ContentAnalyzer実装
```typescript
// src/lib/content-analyzer.ts
export class ContentAnalyzer {
  analyze(markdown: string): ContentFeatures {
    return {
      wordCount: this.countWords(markdown),
      headingCount: this.countHeadings(markdown),
      headingLevels: this.extractHeadingLevels(markdown),
      firstHeadingLevel: this.getFirstHeadingLevel(markdown),
      hasCodeBlock: /```[\s\S]*?```/.test(markdown),
      codeBlockCount: (markdown.match(/```/g) || []).length / 2,
      codeLanguage: this.extractCodeLanguage(markdown),
      listItemCount: (markdown.match(/^[\s]*[-*+]\s/gm) || []).length,
      imageCount: (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length,
      hasQuote: /^>\s/m.test(markdown),
      hasComparison: this.detectComparison(markdown),
      hasTimeline: this.detectTimeline(markdown),
      emphasisLevel: this.calculateEmphasisLevel(markdown),
      complexityScore: this.calculateComplexity(markdown)
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  private countHeadings(text: string): number {
    return (text.match(/^#+\s/gm) || []).length;
  }

  private extractHeadingLevels(text: string): number[] {
    const matches = text.match(/^(#+)\s/gm) || [];
    return matches.map(m => m.trim().split('').filter(c => c === '#').length);
  }

  private getFirstHeadingLevel(text: string): number {
    const match = text.match(/^(#+)\s/m);
    return match ? match[1].length : 0;
  }

  private extractCodeLanguage(text: string): string | null {
    const match = text.match(/```(\w+)/);
    return match ? match[1] : null;
  }

  private detectComparison(text: string): boolean {
    return /\b(vs\.?|versus|対して|比較|違い)\b/i.test(text);
  }

  private detectTimeline(text: string): boolean {
    return /(ステップ|段階|フェーズ|\d{4}年)/.test(text);
  }

  private calculateEmphasisLevel(text: string): 'low' | 'medium' | 'high' {
    const emphasisMarkers = (text.match(/[!?。！？]/g) || []).length;
    const boldCount = (text.match(/\*\*.*?\*\*/g) || []).length;
    const score = emphasisMarkers + boldCount * 2;

    if (score > 10) return 'high';
    if (score > 5) return 'medium';
    return 'low';
  }

  private calculateComplexity(text: string): number {
    let score = 0;
    score += Math.min(this.countWords(text) / 10, 30);
    score += this.countHeadings(text) * 5;
    score += this.listItemCount * 2;
    return Math.min(Math.round(score), 100);
  }
}
```

#### 2.4 AILayoutEngine実装
```typescript
// src/lib/ai-layout-engine.ts
import Anthropic from '@anthropic-ai/sdk';

export class AILayoutEngine {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyzeContent(
    markdown: string,
    features: ContentFeatures
  ): Promise<SlideAnalysis> {
    const prompt = this.buildPrompt(markdown, features);

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return this.parseResponse(response);
  }

  private buildPrompt(markdown: string, features: ContentFeatures): string {
    return `
あなたは技術カンファレンスのスライドデザイン専門家です。
以下のMarkdownコンテンツを解析し、最適なスライドレイアウトを提案してください。

# コンテンツ
${markdown}

# 構造解析結果
- 文字数: ${features.wordCount}
- 見出し数: ${features.headingCount}
- コードブロック: ${features.hasCodeBlock ? 'あり' : 'なし'}
- 箇条書き: ${features.listItemCount}個

# 出力形式（JSON）
\`\`\`json
{
  "layout": "hero | section-break | content-left | content-center | two-column | code-focus | image-text | list-emphasize | quote | comparison | timeline | diagram",
  "confidence": 0.0-1.0,
  "reasoning": "選択理由",
  "styling": {
    "titleSize": "xl | 2xl | 3xl | 4xl | 5xl",
    "contentAlign": "left | center | right",
    "spacing": "compact | normal | spacious",
    "emphasis": "subtle | moderate | strong"
  },
  "visualHierarchy": {
    "primary": ["重要な要素"],
    "secondary": ["補足情報"],
    "tertiary": ["詳細"]
  },
  "colorScheme": "primary | secondary | accent | neutral"
}
\`\`\`
`;
  }

  private parseResponse(response: Anthropic.Message): SlideAnalysis {
    const text = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
      || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    return JSON.parse(jsonMatch[1] || jsonMatch[0]);
  }
}
```

---

### Phase 3: レイアウトコンポーネント

#### 3.1 DynamicSlide
```typescript
// src/components/slides/DynamicSlide.tsx
import { ProcessedSlide } from '@/types';
import { layoutComponents } from '@/components/layouts';
import { motion } from 'motion/react';

interface DynamicSlideProps {
  slide: ProcessedSlide;
  isActive: boolean;
}

export function DynamicSlide({ slide, isActive }: DynamicSlideProps) {
  const LayoutComponent = layoutComponents[slide.aiAnalysis.layout];

  return (
    <motion.div
      className="slide-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <LayoutComponent
        content={slide.rawMarkdown}
        styling={slide.aiAnalysis.styling}
        hierarchy={slide.aiAnalysis.visualHierarchy}
      />
    </motion.div>
  );
}
```

#### 3.2 HeroLayout実装例
```typescript
// src/components/layouts/HeroLayout.tsx
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  content: string;
  styling: StylingConfig;
  hierarchy: VisualHierarchy;
}

export function HeroLayout({ content, styling, hierarchy }: LayoutProps) {
  const lines = content.split('\n').filter(l => l.trim());
  const title = lines[0]?.replace(/^#\s*/, '') || '';
  const subtitle = lines[1] || '';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16">
      <motion.h1
        className={cn(
          'font-bold mb-8',
          'bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent',
          `text-${styling.titleSize}`
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {title}
      </motion.h1>

      {subtitle && (
        <motion.p
          className="text-2xl text-gray-600 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
```

---

### Phase 4: 状態管理とナビゲーション

#### 4.1 Zustand Store
```typescript
// src/stores/slideStore.ts
import { create } from 'zustand';
import { ProcessedSlide } from '@/types';

interface SlideState {
  slides: ProcessedSlide[];
  currentIndex: number;
  totalSlides: number;

  loadSlides: (slides: ProcessedSlide[]) => void;
  navigate: (direction: 'next' | 'prev' | number) => void;
}

export const useSlideStore = create<SlideState>((set) => ({
  slides: [],
  currentIndex: 0,
  totalSlides: 0,

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
  })
}));
```

#### 4.2 キーボードナビゲーション
```typescript
// src/hooks/useKeyboard.ts
import { useEffect } from 'react';
import { useSlideStore } from '@/stores/slideStore';

export function useKeyboard() {
  const navigate = useSlideStore((state) => state.navigate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          navigate('next');
          break;

        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          navigate('prev');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
```

---

## 📝 サンプルMarkdownファイル

```markdown
<!-- src/slides/content/example-talk.md -->
---
layout: auto
theme: dark
transition: slide
---

# React 19で作るモダンスライドシステム

技術カンファレンス 2025

---

## 🎯 今日話すこと

- AI駆動のスライド生成
- React 19の新機能活用
- TailwindCSS 4.1の実践
- デモンストレーション

---

## コード例

\`\`\`typescript
const slide = await analyzeContent(markdown);
console.log(slide.layout);  // "code-focus"
\`\`\`

---

## まとめ

AIとモダンフレームワークで、<br>
**美しいスライドを自動生成**

---
```

---

## 🧪 テストとデバッグ

### 開発サーバー起動
```bash
pnpm dev
```

### ビルド確認
```bash
pnpm build
pnpm preview
```

### デバッグモード
```typescript
// .env
VITE_DEBUG_MODE=true
VITE_SHOW_LAYOUT_INFO=true
```

---

## 📚 次のステップ

1. **Phase 1実装**: プロジェクト初期化とTailwindCSS設定
2. **Phase 2実装**: ContentAnalyzerとAILayoutEngine
3. **Phase 3実装**: 12種類のレイアウトコンポーネント
4. **Phase 4実装**: 状態管理とナビゲーション
5. **発表者モード**: PresenterView実装
6. **最適化**: パフォーマンスチューニング

---

**最終更新**: 2025-11-03
