import Anthropic from '@anthropic-ai/sdk';
import type {
  LayoutType,
  ContentAnalysis,
  AILayoutRequest,
  AILayoutResponse,
} from '@/types';

/**
 * AIレイアウトエンジン
 * Phase 2: ヒューリスティックマッチング
 * Phase 3: AI推論（Claude API）
 * Phase 4: スタイリング適用
 */
export class AILayoutEngine {
  private client: Anthropic;
  private readonly debugMode: boolean;

  constructor(apiKey?: string) {
    // 環境変数からAPIキーを取得
    const key = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!key || key === 'your_api_key_here') {
      throw new Error(
        'ANTHROPIC_API_KEY is not set. Please set VITE_ANTHROPIC_API_KEY in .env file.'
      );
    }

    this.client = new Anthropic({
      apiKey: key,
      dangerouslyAllowBrowser: true, // ブラウザ環境で使用（プロダクションではバックエンド推奨）
    });

    this.debugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
  }

  /**
   * レイアウトを選択（4フェーズアルゴリズム）
   * @param request - レイアウト選択リクエスト
   * @returns レイアウト選択結果
   */
  async selectLayout(request: AILayoutRequest): Promise<AILayoutResponse> {
    // Phase 2: ヒューリスティックマッチング
    const heuristicResult = this.applyHeuristics(request);

    // 信頼度が高い場合はAI推論をスキップ
    if (heuristicResult.confidence >= 0.9) {
      if (this.debugMode) {
        console.log('[AILayoutEngine] High confidence heuristic match:', heuristicResult);
      }
      return heuristicResult;
    }

    // Phase 3: AI推論
    try {
      const aiResult = await this.inferWithClaude(request, heuristicResult);
      if (this.debugMode) {
        console.log('[AILayoutEngine] AI inference result:', aiResult);
      }
      return aiResult;
    } catch (error) {
      console.error('[AILayoutEngine] AI inference failed, falling back to heuristic:', error);
      // AIが失敗した場合はヒューリスティック結果を返す
      return heuristicResult;
    }
  }

  /**
   * Phase 2: ヒューリスティックマッチング
   * @param request - レイアウト選択リクエスト
   * @returns 初期レイアウト選択結果
   */
  private applyHeuristics(request: AILayoutRequest): AILayoutResponse {
    const { analysis, slideIndex } = request;

    // ルール1: 最初のスライドはhero
    if (slideIndex === 0 && analysis.headingLevel === 1) {
      return {
        layout: 'hero',
        reasoning: 'First slide with H1 heading → Hero layout',
        confidence: 0.95,
      };
    }

    // ルール2: H1のみでコンテンツが少ない → section-break
    if (
      analysis.headingLevel === 1 &&
      analysis.paragraphCount === 0 &&
      analysis.listItemCount === 0 &&
      analysis.totalWords < 50
    ) {
      return {
        layout: 'section-break',
        reasoning: 'H1 with minimal content → Section break',
        confidence: 0.9,
      };
    }

    // ルール3: コードブロックが支配的 → code-focus
    if (analysis.codeBlockCount >= 1 && analysis.paragraphCount <= 2) {
      return {
        layout: 'code-focus',
        reasoning: 'Code block dominant → Code focus',
        confidence: 0.85,
      };
    }

    // ルール4: 画像+テキスト → image-text
    if (analysis.imageCount >= 1 && analysis.paragraphCount >= 1) {
      return {
        layout: 'image-text',
        reasoning: 'Image and text present → Image-text layout',
        confidence: 0.8,
      };
    }

    // ルール5: リストが支配的 → list-emphasize
    if (analysis.listItemCount >= 3 && analysis.paragraphCount <= 1) {
      return {
        layout: 'list-emphasize',
        reasoning: 'Multiple list items → List emphasize',
        confidence: 0.85,
      };
    }

    // ルール6: 引用ブロックが多い → quote
    if (analysis.quoteCount >= 2) {
      return {
        layout: 'quote',
        reasoning: 'Multiple quotes → Quote layout',
        confidence: 0.8,
      };
    }

    // ルール7: テーブルが存在 → comparison
    if (analysis.tableCount >= 1) {
      return {
        layout: 'comparison',
        reasoning: 'Table present → Comparison layout',
        confidence: 0.8,
      };
    }

    // ルール8: 段落とリストのバランス → two-column
    if (
      analysis.paragraphCount >= 2 &&
      analysis.listItemCount >= 2 &&
      analysis.totalWords >= 100
    ) {
      return {
        layout: 'two-column',
        reasoning: 'Balanced content → Two-column layout',
        confidence: 0.7,
      };
    }

    // デフォルト: content-center（信頼度低）
    return {
      layout: 'content-center',
      reasoning: 'No specific pattern matched → Default center layout',
      confidence: 0.5,
    };
  }

  /**
   * Phase 3: Claude APIによるAI推論
   * @param request - レイアウト選択リクエスト
   * @param heuristicResult - ヒューリスティック結果
   * @returns AI推論結果
   */
  private async inferWithClaude(
    request: AILayoutRequest,
    heuristicResult: AILayoutResponse
  ): Promise<AILayoutResponse> {
    const { analysis, contentPreview, previousLayout, slideIndex } = request;

    // プロンプト構築
    const prompt = this.buildPrompt(
      analysis,
      contentPreview,
      previousLayout,
      slideIndex,
      heuristicResult
    );

    // Claude API呼び出し
    const message = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      temperature: 0.3, // 一貫性を重視
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // レスポンスをパース
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    return this.parseAIResponse(responseText, heuristicResult);
  }

  /**
   * Claude APIプロンプト構築
   */
  private buildPrompt(
    analysis: ContentAnalysis,
    contentPreview: string,
    previousLayout: LayoutType | undefined,
    slideIndex: number,
    heuristicResult: AILayoutResponse
  ): string {
    return `You are an expert presentation designer. Analyze the following slide content and select the most appropriate layout.

**Available Layouts:**
- hero: Title slide with large heading and subtitle
- section-break: Section divider with minimal content
- content-left: Content aligned to the left
- content-center: Content centered (default)
- two-column: Two-column layout for balanced content
- code-focus: Code-heavy slide with syntax highlighting
- image-text: Image with accompanying text
- list-emphasize: Bullet points or numbered lists
- quote: Prominent quotation or testimonial
- comparison: Side-by-side comparison or table
- timeline: Sequential events or process steps
- diagram: Visual diagram or flowchart

**Content Analysis:**
- Slide number: ${slideIndex + 1}
- Heading level: ${analysis.headingLevel ? `H${analysis.headingLevel}` : 'None'}
- Heading text: ${analysis.headingText || 'None'}
- Paragraphs: ${analysis.paragraphCount}
- List items: ${analysis.listItemCount}
- Code blocks: ${analysis.codeBlockCount}
- Images: ${analysis.imageCount}
- Quotes: ${analysis.quoteCount}
- Tables: ${analysis.tableCount}
- Total words: ${analysis.totalWords}

**Previous Layout:** ${previousLayout || 'None (first slide)'}

**Heuristic Suggestion:** ${heuristicResult.layout} (confidence: ${heuristicResult.confidence})

**Content Preview:**
\`\`\`
${contentPreview.slice(0, 500)}
\`\`\`

**Instructions:**
1. Consider the content structure and type
2. Consider flow and consistency with previous layout
3. Select ONE layout that best fits the content
4. Provide reasoning in ONE sentence

**Response Format (JSON only):**
{
  "layout": "layout-name",
  "reasoning": "Your one-sentence reasoning",
  "confidence": 0.95
}`;
  }

  /**
   * AI応答をパース
   */
  private parseAIResponse(
    responseText: string,
    fallback: AILayoutResponse
  ): AILayoutResponse {
    try {
      // JSONブロックを抽出
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // レイアウト名のバリデーション
      const validLayouts: LayoutType[] = [
        'hero',
        'section-break',
        'content-left',
        'content-center',
        'two-column',
        'code-focus',
        'image-text',
        'list-emphasize',
        'quote',
        'comparison',
        'timeline',
        'diagram',
      ];

      if (!validLayouts.includes(parsed.layout)) {
        throw new Error(`Invalid layout: ${parsed.layout}`);
      }

      return {
        layout: parsed.layout,
        reasoning: parsed.reasoning || 'AI selected layout',
        confidence: Math.min(Math.max(parsed.confidence || 0.8, 0), 1),
      };
    } catch (error) {
      console.error('[AILayoutEngine] Failed to parse AI response:', error);
      return fallback;
    }
  }
}
