import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { ContentAnalyzer } from '@/lib/analyzer';
import { AILayoutEngine } from '@/lib/ai-layout';
import type {
  Slide,
  SlideshowState,
  SlideshowActions,
  LayoutType,
} from '@/types';

/**
 * スライドショーストア
 * Zustand を使用した状態管理
 */
export const useSlideStore = create<SlideshowState & SlideshowActions>((set, get) => ({
  // 初期状態
  slides: [],
  currentIndex: 0,
  isLoading: false,
  error: null,

  /**
   * Markdownファイルからスライドを読み込む
   */
  loadSlides: async (files: File[]) => {
    set({ isLoading: true, error: null });

    try {
      // ファイル名でソート（01-intro.md, 02-overview.md など）
      const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));

      // AIレイアウトエンジンを初期化
      let layoutEngine: AILayoutEngine | null = null;
      try {
        layoutEngine = new AILayoutEngine();
      } catch (error) {
        console.warn(
          '[SlideStore] AI Layout Engine initialization failed. Using heuristic fallback.',
          error
        );
      }

      // 各ファイルを処理
      const slides: Slide[] = [];
      let previousLayout: LayoutType | undefined;

      for (let i = 0; i < sortedFiles.length; i++) {
        const file = sortedFiles[i];
        const markdown = await file.text();

        // 1. Markdownをパース
        const content = ContentAnalyzer.parseMarkdown(markdown);

        // 2. コンテンツを解析
        const analysis = ContentAnalyzer.analyzeContent(content);

        // 3. レイアウトを選択
        let layout: LayoutType;
        let layoutReasoning: string | undefined;

        // フロントマターに手動レイアウト指定があればそれを使用
        if (content.frontMatter.layout) {
          layout = content.frontMatter.layout as LayoutType;
          layoutReasoning = 'Manually specified in frontmatter';
        } else if (layoutEngine) {
          // AI推論でレイアウトを選択
          const aiResponse = await layoutEngine.selectLayout({
            analysis,
            contentPreview: content.rawMarkdown,
            previousLayout,
            slideIndex: i,
          });
          layout = aiResponse.layout;
          layoutReasoning = aiResponse.reasoning;
        } else {
          // AIが使えない場合は基本的なヒューリスティック
          layout = inferBasicLayout(analysis, i);
          layoutReasoning = 'Basic heuristic fallback (AI unavailable)';
        }

        // 4. スライドを作成
        const slide: Slide = {
          id: nanoid(),
          filePath: file.name,
          content,
          analysis,
          layout,
          layoutReasoning,
          index: i,
        };

        slides.push(slide);
        previousLayout = layout;
      }

      set({
        slides,
        currentIndex: 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SlideStore] Failed to load slides:', error);
      set({
        isLoading: false,
        error: `Failed to load slides: ${errorMessage}`,
      });
    }
  },

  /**
   * 次のスライドへ移動
   */
  nextSlide: () => {
    const { slides, currentIndex } = get();
    if (currentIndex < slides.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  /**
   * 前のスライドへ移動
   */
  previousSlide: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  /**
   * 特定のスライドへ移動
   */
  goToSlide: (index: number) => {
    const { slides } = get();
    if (index >= 0 && index < slides.length) {
      set({ currentIndex: index });
    }
  },

  /**
   * スライドをリセット
   */
  reset: () => {
    set({
      slides: [],
      currentIndex: 0,
      isLoading: false,
      error: null,
    });
  },
}));

/**
 * 基本的なヒューリスティックレイアウト推論（AIフォールバック用）
 */
function inferBasicLayout(
  analysis: ReturnType<typeof ContentAnalyzer.analyzeContent>,
  slideIndex: number
): LayoutType {
  // 最初のスライドはhero
  if (slideIndex === 0 && analysis.headingLevel === 1) {
    return 'hero';
  }

  // H1のみ → section-break
  if (
    analysis.headingLevel === 1 &&
    analysis.paragraphCount === 0 &&
    analysis.totalWords < 50
  ) {
    return 'section-break';
  }

  // コードブロック → code-focus
  if (analysis.codeBlockCount >= 1) {
    return 'code-focus';
  }

  // 画像 → image-text
  if (analysis.imageCount >= 1) {
    return 'image-text';
  }

  // リスト → list-emphasize
  if (analysis.listItemCount >= 3) {
    return 'list-emphasize';
  }

  // 引用 → quote
  if (analysis.quoteCount >= 2) {
    return 'quote';
  }

  // テーブル → comparison
  if (analysis.tableCount >= 1) {
    return 'comparison';
  }

  // デフォルト
  return 'content-center';
}
