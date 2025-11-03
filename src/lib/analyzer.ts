import { marked } from 'marked';
import matter from 'gray-matter';
import type { ParsedContent, ContentAnalysis } from '@/types';

/**
 * Markdownコンテンツの解析クラス
 * Phase 1: 構造解析 - Markdownをパースして要素をカウント
 */
export class ContentAnalyzer {
  /**
   * Markdownファイルをパース
   * @param markdown - Markdown文字列
   * @returns パース結果
   */
  static parseMarkdown(markdown: string): ParsedContent {
    // gray-matterでフロントマターを抽出
    const { data: frontMatter, content: rawMarkdown } = matter(markdown);

    // markedでHTMLに変換
    const html = marked.parse(rawMarkdown, {
      async: false,
      breaks: true, // 改行を<br>に変換
      gfm: true, // GitHub Flavored Markdown
    }) as string;

    return {
      frontMatter,
      rawMarkdown,
      html,
    };
  }

  /**
   * コンテンツを解析して構造情報を抽出
   * @param content - パースされたコンテンツ
   * @returns コンテンツ解析結果
   */
  static analyzeContent(content: ParsedContent): ContentAnalysis {
    const { rawMarkdown } = content;

    // 各要素をカウント
    const analysis: ContentAnalysis = {
      headingLevel: this.extractHeadingLevel(rawMarkdown),
      headingText: this.extractHeadingText(rawMarkdown),
      paragraphCount: this.countParagraphs(rawMarkdown),
      listItemCount: this.countListItems(rawMarkdown),
      codeBlockCount: this.countCodeBlocks(rawMarkdown),
      imageCount: this.countImages(rawMarkdown),
      quoteCount: this.countQuotes(rawMarkdown),
      tableCount: this.countTables(rawMarkdown),
      totalCharacters: rawMarkdown.length,
      totalWords: this.countWords(rawMarkdown),
    };

    return analysis;
  }

  /**
   * 最初の見出しレベルを抽出
   * @param markdown - Markdown文字列
   * @returns 見出しレベル (1-6) または null
   */
  private static extractHeadingLevel(markdown: string): number | null {
    const match = markdown.match(/^(#{1,6})\s+/m);
    return match ? match[1].length : null;
  }

  /**
   * 最初の見出しテキストを抽出
   * @param markdown - Markdown文字列
   * @returns 見出しテキスト または null
   */
  private static extractHeadingText(markdown: string): string | null {
    const match = markdown.match(/^#{1,6}\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  /**
   * 段落数をカウント
   * @param markdown - Markdown文字列
   * @returns 段落数
   */
  private static countParagraphs(markdown: string): number {
    // 空行で区切られたテキストブロックを段落としてカウント
    const blocks = markdown
      .split(/\n\n+/)
      .filter((block) => {
        const trimmed = block.trim();
        // 見出し、コードブロック、リスト、引用、テーブルを除外
        return (
          trimmed.length > 0 &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('```') &&
          !trimmed.startsWith('-') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('>') &&
          !trimmed.startsWith('|')
        );
      });
    return blocks.length;
  }

  /**
   * リストアイテム数をカウント
   * @param markdown - Markdown文字列
   * @returns リストアイテム数
   */
  private static countListItems(markdown: string): number {
    const matches = markdown.match(/^[\s]*[-*+]\s+/gm);
    return matches ? matches.length : 0;
  }

  /**
   * コードブロック数をカウント
   * @param markdown - Markdown文字列
   * @returns コードブロック数
   */
  private static countCodeBlocks(markdown: string): number {
    const matches = markdown.match(/```[\s\S]*?```/g);
    return matches ? matches.length : 0;
  }

  /**
   * 画像数をカウント
   * @param markdown - Markdown文字列
   * @returns 画像数
   */
  private static countImages(markdown: string): number {
    const matches = markdown.match(/!\[.*?\]\(.*?\)/g);
    return matches ? matches.length : 0;
  }

  /**
   * 引用ブロック数をカウント
   * @param markdown - Markdown文字列
   * @returns 引用ブロック数
   */
  private static countQuotes(markdown: string): number {
    const matches = markdown.match(/^>\s+/gm);
    return matches ? matches.length : 0;
  }

  /**
   * テーブル数をカウント
   * @param markdown - Markdown文字列
   * @returns テーブル数
   */
  private static countTables(markdown: string): number {
    // テーブルのヘッダー区切り行をカウント (例: |---|---|)
    const matches = markdown.match(/^\|[\s]*[-:]+[\s]*\|/gm);
    return matches ? matches.length : 0;
  }

  /**
   * 単語数をカウント（日本語の場合は文字数）
   * @param markdown - Markdown文字列
   * @returns 単語数
   */
  private static countWords(markdown: string): number {
    // Markdownの記号を除去
    const text = markdown
      .replace(/```[\s\S]*?```/g, '') // コードブロック除去
      .replace(/`[^`]+`/g, '') // インラインコード除去
      .replace(/!\[.*?\]\(.*?\)/g, '') // 画像除去
      .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // リンク除去（テキストのみ残す）
      .replace(/[#*_~`>|\-]/g, '') // Markdown記号除去
      .trim();

    // 日本語文字が含まれているかチェック
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf]/.test(text);

    if (hasJapanese) {
      // 日本語の場合は文字数（空白除去）
      return text.replace(/\s+/g, '').length;
    } else {
      // 英語の場合は単語数
      const words = text.split(/\s+/).filter((word) => word.length > 0);
      return words.length;
    }
  }
}
