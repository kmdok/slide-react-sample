/**
 * レイアウトタイプの定義
 * 12種類のレイアウトテンプレート
 */
export type LayoutType =
  | 'hero'              // タイトルスライド
  | 'section-break'     // セクション区切り
  | 'content-left'      // コンテンツ左寄せ
  | 'content-center'    // コンテンツ中央
  | 'two-column'        // 2カラム
  | 'code-focus'        // コードフォーカス
  | 'image-text'        // 画像+テキスト
  | 'list-emphasize'    // リスト強調
  | 'quote'             // 引用
  | 'comparison'        // 比較
  | 'timeline'          // タイムライン
  | 'diagram';          // ダイアグラム

/**
 * Markdownから抽出されたコンテンツ構造
 */
export interface ParsedContent {
  /** フロントマター（メタデータ） */
  frontMatter: {
    title?: string;
    author?: string;
    date?: string;
    tags?: string[];
    layout?: LayoutType; // 手動レイアウト指定（オプション）
    [key: string]: unknown;
  };
  /** Markdown本文 */
  rawMarkdown: string;
  /** HTMLに変換された本文 */
  html: string;
}

/**
 * コンテンツ解析結果
 */
export interface ContentAnalysis {
  /** 見出しレベル (h1-h6) */
  headingLevel: number | null;
  /** 見出しテキスト */
  headingText: string | null;
  /** 段落数 */
  paragraphCount: number;
  /** リストアイテム数 */
  listItemCount: number;
  /** コードブロック数 */
  codeBlockCount: number;
  /** 画像数 */
  imageCount: number;
  /** 引用ブロック数 */
  quoteCount: number;
  /** テーブル数 */
  tableCount: number;
  /** 総文字数 */
  totalCharacters: number;
  /** 総単語数 */
  totalWords: number;
}

/**
 * AIレイアウト選択リクエスト
 */
export interface AILayoutRequest {
  /** コンテンツ解析結果 */
  analysis: ContentAnalysis;
  /** Markdown本文（抜粋） */
  contentPreview: string;
  /** 前のスライドのレイアウト */
  previousLayout?: LayoutType;
  /** スライド番号 */
  slideIndex: number;
}

/**
 * AIレイアウト選択レスポンス
 */
export interface AILayoutResponse {
  /** 選択されたレイアウト */
  layout: LayoutType;
  /** 選択理由 */
  reasoning: string;
  /** 信頼度 (0-1) */
  confidence: number;
}

/**
 * スライドデータ
 */
export interface Slide {
  /** スライドID */
  id: string;
  /** 元のMarkdownファイルパス */
  filePath: string;
  /** パースされたコンテンツ */
  content: ParsedContent;
  /** コンテンツ解析結果 */
  analysis: ContentAnalysis;
  /** 選択されたレイアウト */
  layout: LayoutType;
  /** AI選択理由 */
  layoutReasoning?: string;
  /** スライド番号（0始まり） */
  index: number;
}

/**
 * スライドショーの状態
 */
export interface SlideshowState {
  /** 全スライド */
  slides: Slide[];
  /** 現在のスライドインデックス */
  currentIndex: number;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー */
  error: string | null;
}

/**
 * スライドショーのアクション
 */
export interface SlideshowActions {
  /** スライドを読み込む */
  loadSlides: (files: File[]) => Promise<void>;
  /** 次のスライドへ */
  nextSlide: () => void;
  /** 前のスライドへ */
  previousSlide: () => void;
  /** 特定のスライドへ移動 */
  goToSlide: (index: number) => void;
  /** スライドをリセット */
  reset: () => void;
}

/**
 * レイアウトコンポーネントのProps
 */
export interface LayoutProps {
  /** スライドデータ */
  slide: Slide;
  /** アニメーション完了コールバック */
  onAnimationComplete?: () => void;
}
