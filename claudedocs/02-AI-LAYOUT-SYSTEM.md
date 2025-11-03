# AI レイアウトシステム詳細仕様

## 🧠 システム概要

Claude API（Sonnet 4）を使用して、Markdownコンテンツを解析し、12種類のレイアウトテンプレートから最適なものを自動選択するシステム。

## 🎯 設計目標

1. **高精度**: 90%以上の確率で適切なレイアウトを選択
2. **高速**: 平均2秒以内にレイアウト決定
3. **一貫性**: 同じコンテンツに対して常に同じレイアウトを選択
4. **コスト効率**: キャッシング活用で不要なAPI呼び出しを削減

## 📋 レイアウト選択アルゴリズム

### 判断フロー

```
Markdownコンテンツ入力
    ↓
[Phase 1: 構造解析]
    ├─ 見出し数・レベル
    ├─ 本文文字数
    ├─ コードブロック有無
    ├─ 画像有無
    ├─ 箇条書き数
    └─ 引用文有無
    ↓
[Phase 2: パターンマッチング]
    ├─ ヒューリスティックルール適用
    │   - コードブロック → code-focus (confidence: 0.9)
    │   - 見出しのみ → hero (confidence: 0.85)
    │   - 箇条書き5+ → list-emphasize (confidence: 0.8)
    ↓
[Phase 3: AI解析（必要時のみ）]
    ├─ confidence < 0.7 の場合
    ├─ Claude APIで文脈理解
    └─ 最終レイアウト決定
    ↓
[Phase 4: スタイリング決定]
    ├─ タイトルサイズ
    ├─ コンテンツ配置
    ├─ スペーシング
    └─ 強調度
    ↓
レイアウト決定完了
```

## 🔍 Phase 1: 構造解析

### ContentAnalyzer実装

```typescript
export interface ContentFeatures {
  // テキスト特徴
  wordCount: number;
  headingCount: number;
  headingLevels: number[];        // [1, 2, 2, 3] など
  firstHeadingLevel: number;

  // 構造要素
  hasCodeBlock: boolean;
  codeBlockCount: number;
  codeLanguage: string | null;
  codeLineCount: number;

  listItemCount: number;
  orderedListCount: number;
  unorderedListCount: number;

  // メディア
  imageCount: number;
  imageUrls: string[];
  hasVideo: boolean;

  // 特殊パターン
  hasQuote: boolean;
  quoteLength: number;
  hasTable: boolean;
  tableColumnCount: number;

  // キーワード検出
  hasComparison: boolean;          // "vs", "対", "比較"
  hasTimeline: boolean;            // "ステップ", "段階", 年号
  hasDiagram: boolean;             // "図", "チャート"
  hasDefinition: boolean;          // "とは", "定義"

  // センチメント
  emphasisLevel: 'low' | 'medium' | 'high';
  complexityScore: number;         // 0-100
}

export class ContentAnalyzer {
  analyze(markdown: string): ContentFeatures {
    const features: ContentFeatures = {
      // 各特徴を解析
      wordCount: this.countWords(markdown),
      headingCount: this.countHeadings(markdown),
      headingLevels: this.extractHeadingLevels(markdown),
      firstHeadingLevel: this.getFirstHeadingLevel(markdown),

      hasCodeBlock: /```[\s\S]*?```/.test(markdown),
      codeBlockCount: (markdown.match(/```/g) || []).length / 2,
      codeLanguage: this.extractCodeLanguage(markdown),
      codeLineCount: this.countCodeLines(markdown),

      listItemCount: (markdown.match(/^[\s]*[-*+]\s/gm) || []).length,
      orderedListCount: (markdown.match(/^[\s]*\d+\.\s/gm) || []).length,
      unorderedListCount: (markdown.match(/^[\s]*[-*+]\s/gm) || []).length,

      imageCount: (markdown.match(/!\[.*?\]\(.*?\)/g) || []).length,
      imageUrls: this.extractImageUrls(markdown),
      hasVideo: /!\[.*?\]\(.*?\.(mp4|webm|mov)\)/.test(markdown),

      hasQuote: /^>\s/m.test(markdown),
      quoteLength: this.getQuoteLength(markdown),
      hasTable: /\|.*\|/.test(markdown),
      tableColumnCount: this.getTableColumnCount(markdown),

      hasComparison: this.detectComparison(markdown),
      hasTimeline: this.detectTimeline(markdown),
      hasDiagram: this.detectDiagram(markdown),
      hasDefinition: this.detectDefinition(markdown),

      emphasisLevel: this.calculateEmphasisLevel(markdown),
      complexityScore: this.calculateComplexity(markdown)
    };

    return features;
  }

  private detectComparison(markdown: string): boolean {
    const patterns = [
      /\bvs\.?\b/i,
      /\bversus\b/i,
      /対して/,
      /比較/,
      /違い/,
      /差異/,
      /メリット.*デメリット/,
      /良い点.*悪い点/,
      /\|\s*\w+\s*\|\s*\w+\s*\|/  // テーブル
    ];
    return patterns.some(p => p.test(markdown));
  }

  private detectTimeline(markdown: string): boolean {
    const patterns = [
      /ステップ\s*\d+/,
      /段階/,
      /フェーズ/,
      /\d{4}年/,              // 年号
      /第[一二三四五]\w+/,
      /^\s*\d+\.\s+.*\n\s*\d+\.\s+/m  // 番号付きリスト連続
    ];
    return patterns.some(p => p.test(markdown));
  }

  private calculateComplexity(markdown: string): number {
    let score = 0;

    // 文字数による複雑度
    const wordCount = this.countWords(markdown);
    score += Math.min(wordCount / 10, 30);

    // コードブロックの複雑度
    if (this.hasCodeBlock(markdown)) {
      const lines = this.countCodeLines(markdown);
      score += Math.min(lines / 2, 20);
    }

    // 構造の複雑度
    const headings = this.countHeadings(markdown);
    score += Math.min(headings * 5, 20);

    // リストの複雑度
    const lists = this.countListItems(markdown);
    score += Math.min(lists * 2, 15);

    // 画像・メディアの複雑度
    const images = this.countImages(markdown);
    score += Math.min(images * 5, 15);

    return Math.min(Math.round(score), 100);
  }
}
```

## 🎲 Phase 2: ヒューリスティックルール

### ルールベース判定

```typescript
export class HeuristicMatcher {
  match(features: ContentFeatures): LayoutMatch | null {
    const rules: LayoutRule[] = [
      // 優先度高: コードフォーカス
      {
        condition: (f) =>
          f.hasCodeBlock &&
          f.codeLineCount > 10 &&
          f.wordCount < 100,
        layout: 'code-focus',
        confidence: 0.9,
        reasoning: 'コードブロックが主要コンテンツ'
      },

      // 優先度高: ヒーロー（タイトルスライド）
      {
        condition: (f) =>
          f.headingCount === 1 &&
          f.firstHeadingLevel === 1 &&
          f.wordCount < 50 &&
          !f.hasCodeBlock &&
          !f.hasQuote,
        layout: 'hero',
        confidence: 0.85,
        reasoning: '大きな見出しのみ、簡潔なタイトル'
      },

      // セクション区切り
      {
        condition: (f) =>
          f.headingCount === 1 &&
          f.wordCount < 30 &&
          f.emphasisLevel === 'high',
        layout: 'section-break',
        confidence: 0.8,
        reasoning: '短い見出し、セクション移行'
      },

      // リスト強調
      {
        condition: (f) =>
          f.listItemCount >= 5 &&
          f.wordCount < 300 &&
          !f.hasCodeBlock,
        layout: 'list-emphasize',
        confidence: 0.8,
        reasoning: '多数の箇条書き項目'
      },

      // 引用スライド
      {
        condition: (f) =>
          f.hasQuote &&
          f.quoteLength > 50 &&
          f.wordCount < 200,
        layout: 'quote',
        confidence: 0.85,
        reasoning: '引用文が主要コンテンツ'
      },

      // 画像+テキスト
      {
        condition: (f) =>
          f.imageCount === 1 &&
          f.wordCount > 50 &&
          f.wordCount < 200,
        layout: 'image-text',
        confidence: 0.75,
        reasoning: '画像と説明文の組み合わせ'
      },

      // 比較スライド
      {
        condition: (f) =>
          f.hasComparison &&
          (f.hasTable || f.listItemCount >= 4),
        layout: 'comparison',
        confidence: 0.8,
        reasoning: '比較表現とテーブル/リスト'
      },

      // タイムライン
      {
        condition: (f) =>
          f.hasTimeline &&
          f.orderedListCount >= 3,
        layout: 'timeline',
        confidence: 0.75,
        reasoning: '時系列表現と番号付きリスト'
      },

      // 2カラム
      {
        condition: (f) =>
          f.headingCount >= 2 &&
          f.headingCount <= 3 &&
          f.wordCount > 100 &&
          f.wordCount < 400,
        layout: 'two-column',
        confidence: 0.7,
        reasoning: '複数見出しと適度な文章量'
      }
    ];

    // ルールを順番に評価
    for (const rule of rules) {
      if (rule.condition(features)) {
        return {
          layout: rule.layout,
          confidence: rule.confidence,
          reasoning: rule.reasoning,
          method: 'heuristic'
        };
      }
    }

    return null;  // ルールマッチなし
  }
}
```

## 🤖 Phase 3: AI解析（Claude API）

### プロンプト設計

```typescript
export class AILayoutEngine {
  buildPrompt(
    markdown: string,
    features: ContentFeatures,
    context?: AnalysisContext
  ): string {
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
- 画像: ${features.imageCount}個
- 複雑度スコア: ${features.complexityScore}/100

${context?.previousSlide ? `# 前のスライド\n${context.previousSlide.substring(0, 200)}...` : ''}
${context?.presentationTheme ? `# プレゼンテーションテーマ\n${context.presentationTheme}` : ''}

# 利用可能なレイアウト
1. **hero**: タイトルスライド。大きな見出し中心、簡潔なサブタイトル
2. **section-break**: セクション区切り。短い見出し、セクション移行
3. **content-left**: 左寄せコンテンツ。標準的な文章スライド
4. **content-center**: 中央寄せ。重要なメッセージ強調
5. **two-column**: 2カラム。2つの概念を並列表示
6. **code-focus**: コード中心。シンタックスハイライト強調
7. **image-text**: 画像+説明。ビジュアル重視
8. **list-emphasize**: 箇条書き強調。複数項目の列挙
9. **quote**: 引用スライド。引用文を大きく表示
10. **comparison**: 比較表示。"vs"形式、対照表示
11. **timeline**: タイムライン。時系列、ステップ表示
12. **diagram**: 図解。チャート、図表中心

# 判断基準
- コンテンツの主要要素は何か？
- 視覚的にどう配置すべきか？
- 聴衆の注意をどこに向けるべきか？
- プレゼンテーションの流れにどう寄与するか？

# 出力形式（JSON）
必ずこの形式で出力してください：

\`\`\`json
{
  "layout": "上記12種類のいずれか",
  "confidence": 0.0-1.0,
  "reasoning": "このレイアウトを選んだ理由（簡潔に）",
  "styling": {
    "titleSize": "xl | 2xl | 3xl | 4xl | 5xl",
    "contentAlign": "left | center | right",
    "spacing": "compact | normal | spacious",
    "emphasis": "subtle | moderate | strong"
  },
  "visualHierarchy": {
    "primary": ["最も重要な要素（見出し、キーメッセージなど）"],
    "secondary": ["補足情報（サブ見出し、説明など）"],
    "tertiary": ["付加的な情報（詳細、注釈など）"]
  },
  "colorScheme": "primary | secondary | accent | neutral"
}
\`\`\`

重要: 必ずJSON形式で出力してください。説明文は不要です。
`;
  }

  async analyze(
    markdown: string,
    features: ContentFeatures,
    context?: AnalysisContext
  ): Promise<SlideAnalysis> {
    const prompt = this.buildPrompt(markdown, features, context);

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,  // 低めの温度で一貫性重視
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      return this.parseResponse(response);
    } catch (error) {
      console.error('Claude API error:', error);
      // フォールバック: デフォルトレイアウト
      return this.getDefaultLayout(features);
    }
  }

  private parseResponse(response: Anthropic.Message): SlideAnalysis {
    const text = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // JSONを抽出
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/)
      || text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // バリデーション
    this.validateAnalysis(json);

    return json as SlideAnalysis;
  }

  private validateAnalysis(analysis: any): void {
    const validLayouts = [
      'hero', 'section-break', 'content-left', 'content-center',
      'two-column', 'code-focus', 'image-text', 'list-emphasize',
      'quote', 'comparison', 'timeline', 'diagram'
    ];

    if (!validLayouts.includes(analysis.layout)) {
      throw new Error(`Invalid layout: ${analysis.layout}`);
    }

    if (typeof analysis.confidence !== 'number' ||
        analysis.confidence < 0 || analysis.confidence > 1) {
      throw new Error('Invalid confidence value');
    }

    // その他のバリデーション...
  }
}
```

## 🎨 Phase 4: スタイリング決定

### スタイリング推論ロジック

```typescript
export interface StylingConfig {
  titleSize: 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  contentAlign: 'left' | 'center' | 'right';
  spacing: 'compact' | 'normal' | 'spacious';
  emphasis: 'subtle' | 'moderate' | 'strong';
}

export class StylingEngine {
  determineStyle(
    layout: SlideLayout,
    features: ContentFeatures
  ): StylingConfig {
    // レイアウトごとのデフォルトスタイル
    const defaults: Record<SlideLayout, StylingConfig> = {
      hero: {
        titleSize: '5xl',
        contentAlign: 'center',
        spacing: 'spacious',
        emphasis: 'strong'
      },
      'section-break': {
        titleSize: '4xl',
        contentAlign: 'center',
        spacing: 'spacious',
        emphasis: 'strong'
      },
      'code-focus': {
        titleSize: '2xl',
        contentAlign: 'left',
        spacing: 'normal',
        emphasis: 'moderate'
      },
      'list-emphasize': {
        titleSize: '3xl',
        contentAlign: 'left',
        spacing: 'normal',
        emphasis: 'moderate'
      },
      // ... 他のレイアウト
    };

    const baseStyle = defaults[layout];

    // コンテンツ特徴に応じた調整
    return this.adjustStyle(baseStyle, features);
  }

  private adjustStyle(
    base: StylingConfig,
    features: ContentFeatures
  ): StylingConfig {
    const adjusted = { ...base };

    // 文字数が多い場合はタイトルサイズを小さく
    if (features.wordCount > 300) {
      adjusted.titleSize = this.decreaseTitleSize(base.titleSize);
      adjusted.spacing = 'compact';
    }

    // 複雑度が高い場合はスペーシングを調整
    if (features.complexityScore > 70) {
      adjusted.spacing = 'compact';
    }

    // 強調が必要な場合
    if (features.emphasisLevel === 'high') {
      adjusted.emphasis = 'strong';
    }

    return adjusted;
  }
}
```

## 💾 キャッシング戦略

### キャッシュ実装

```typescript
export class LayoutCache {
  private cache: Map<string, CachedAnalysis>;
  private readonly TTL = 1000 * 60 * 60 * 24;  // 24時間

  constructor() {
    this.cache = new Map();
    this.loadFromStorage();
  }

  generateKey(markdown: string, context?: AnalysisContext): string {
    const contextStr = context
      ? JSON.stringify(context)
      : '';
    const input = markdown + contextStr;

    // SHA-256ハッシュ生成（簡易版）
    return this.hash(input);
  }

  get(key: string): SlideAnalysis | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // TTLチェック
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.analysis;
  }

  set(key: string, analysis: SlideAnalysis): void {
    this.cache.set(key, {
      analysis,
      timestamp: Date.now()
    });

    // localStorageに永続化
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('layout-cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load cache:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem('layout-cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache:', error);
    }
  }
}
```

## 📊 統合フロー

### SlideProcessor統合

```typescript
export class SlideProcessor {
  private analyzer: ContentAnalyzer;
  private heuristicMatcher: HeuristicMatcher;
  private aiEngine: AILayoutEngine;
  private stylingEngine: StylingEngine;
  private cache: LayoutCache;

  async processSlide(
    markdown: string,
    context?: AnalysisContext
  ): Promise<SlideAnalysis> {
    // 1. キャッシュチェック
    const cacheKey = this.cache.generateKey(markdown, context);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('Cache hit for slide');
      return cached;
    }

    // 2. 構造解析
    const features = this.analyzer.analyze(markdown);

    // 3. ヒューリスティックマッチング
    const heuristicMatch = this.heuristicMatcher.match(features);

    let analysis: SlideAnalysis;

    if (heuristicMatch && heuristicMatch.confidence >= 0.75) {
      // ヒューリスティックで十分な確信度
      console.log('Using heuristic match:', heuristicMatch.layout);
      analysis = {
        layout: heuristicMatch.layout,
        confidence: heuristicMatch.confidence,
        reasoning: heuristicMatch.reasoning,
        styling: this.stylingEngine.determineStyle(
          heuristicMatch.layout,
          features
        ),
        visualHierarchy: this.buildHierarchy(markdown, features),
        colorScheme: 'primary'
      };
    } else {
      // 4. AI解析が必要
      console.log('Using AI analysis');
      analysis = await this.aiEngine.analyze(markdown, features, context);
    }

    // 5. キャッシュに保存
    this.cache.set(cacheKey, analysis);

    return analysis;
  }

  private buildHierarchy(
    markdown: string,
    features: ContentFeatures
  ): VisualHierarchy {
    // Markdownから要素を抽出して階層構築
    const lines = markdown.split('\n');
    const hierarchy: VisualHierarchy = {
      primary: [],
      secondary: [],
      tertiary: []
    };

    lines.forEach(line => {
      if (line.startsWith('# ')) {
        hierarchy.primary.push(line.replace(/^#\s*/, ''));
      } else if (line.startsWith('## ')) {
        hierarchy.secondary.push(line.replace(/^##\s*/, ''));
      } else if (line.trim().length > 0 && !line.startsWith('#')) {
        hierarchy.tertiary.push(line);
      }
    });

    return hierarchy;
  }
}
```

## 📈 パフォーマンス指標

### 目標値

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| レイアウト決定時間 | < 2秒 | performance.now() |
| キャッシュヒット率 | > 80% | cache hits / total requests |
| AI解析精度 | > 90% | ユーザーフィードバック |
| メモリ使用量 | < 50MB | performance.memory |

### モニタリング

```typescript
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    aiCalls: 0,
    averageTime: 0,
    errors: 0
  };

  recordAnalysis(
    method: 'cache' | 'heuristic' | 'ai',
    duration: number
  ): void {
    this.metrics.totalRequests++;

    if (method === 'cache') {
      this.metrics.cacheHits++;
    } else if (method === 'ai') {
      this.metrics.aiCalls++;
    }

    // 移動平均
    this.metrics.averageTime =
      (this.metrics.averageTime * (this.metrics.totalRequests - 1) + duration) /
      this.metrics.totalRequests;
  }

  getReport(): PerformanceReport {
    return {
      cacheHitRate: this.metrics.cacheHits / this.metrics.totalRequests,
      averageTime: this.metrics.averageTime,
      aiCallRate: this.metrics.aiCalls / this.metrics.totalRequests,
      totalRequests: this.metrics.totalRequests,
      errorRate: this.metrics.errors / this.metrics.totalRequests
    };
  }
}
```

---

**最終更新**: 2025-11-03
