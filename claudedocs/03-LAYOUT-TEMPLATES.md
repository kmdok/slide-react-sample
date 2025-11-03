# レイアウトテンプレート詳細仕様

## 📐 12種類のレイアウトテンプレート

各レイアウトの特徴、適用条件、実装パターンを詳細に記載。

---

## 1. Hero (ヒーロー / タイトルスライド)

### 用途
- プレゼンテーションのタイトルスライド
- 大きな見出しを中央に配置
- 発表者名、日付、イベント名などのサブ情報

### 自動選択条件
- 見出しが1つのみ (`# タイトル`)
- 文字数が50文字以下
- コードブロック、画像、リストがない
- プレゼンテーションの最初のスライド

### レイアウト構造
```
┌────────────────────────────────────┐
│                                    │
│                                    │
│         ████████████████           │
│         █  Main Title  █           │
│         ████████████████           │
│                                    │
│         Subtitle / Date            │
│                                    │
│                                    │
└────────────────────────────────────┘
```

### 実装例
```typescript
// src/components/layouts/HeroLayout.tsx
export function HeroLayout({ content, styling }: LayoutProps) {
  const { title, subtitle } = parseHeroContent(content);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16">
      <motion.h1
        className={cn(
          'font-bold mb-8',
          'bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent',
          titleSizeClasses[styling.titleSize]  // 4xl or 5xl
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

### TailwindCSSクラス
```css
.slide-hero {
  @apply flex flex-col items-center justify-center h-full;
  @apply text-center px-16;
}

.slide-hero h1 {
  @apply text-6xl md:text-7xl lg:text-8xl font-bold;
  @apply bg-gradient-to-r from-primary-500 to-secondary-500;
  @apply bg-clip-text text-transparent;
}
```

---

## 2. Section Break (セクション区切り)

### 用途
- プレゼンテーションのセクション移行
- 大きなテーマの切り替わり
- 視覚的な区切り

### 自動選択条件
- 見出しが1つ、文字数30文字以下
- シンプルなメッセージ
- 強調レベルが高い

### レイアウト構造
```
┌────────────────────────────────────┐
│                                    │
│                                    │
│                                    │
│          ████████████              │
│          █  Section █              │
│          ████████████              │
│                                    │
│                                    │
│                                    │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function SectionBreakLayout({ content, styling }: LayoutProps) {
  const text = extractText(content);

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800">
      <motion.h2
        className={cn(
          'font-bold text-center px-16',
          titleSizeClasses[styling.titleSize]  // 4xl
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
      >
        {text}
      </motion.h2>
    </div>
  );
}
```

---

## 3. Code Focus (コードフォーカス)

### 用途
- コードブロックを大きく表示
- シンタックスハイライト
- 技術的な説明

### 自動選択条件
- コードブロックあり
- コード行数が10行以上
- 文字数が100文字以下（コード以外）

### レイアウト構造
```
┌────────────────────────────────────┐
│  Title (optional)                  │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ 1  const example = () => {   │ │
│  │ 2    return "code";          │ │
│  │ 3  };                        │ │
│  │ ...                          │ │
│  └──────────────────────────────┘ │
│                                    │
│  Description (optional)            │
└────────────────────────────────────┘
```

### 実装例
```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeFocusLayout({ content, styling }: LayoutProps) {
  const { title, codeBlock, description } = parseCodeContent(content);

  return (
    <div className="flex flex-col h-full p-12">
      {title && (
        <h2 className={cn('mb-6 font-bold', titleSizeClasses[styling.titleSize])}>
          {title}
        </h2>
      )}

      <div className="flex-1 overflow-auto rounded-xl shadow-2xl">
        <SyntaxHighlighter
          language={codeBlock.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '2rem',
            fontSize: '1.25rem',
            lineHeight: '1.8',
            borderRadius: '0.75rem'
          }}
          showLineNumbers
          wrapLines
        >
          {codeBlock.code}
        </SyntaxHighlighter>
      </div>

      {description && (
        <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  );
}
```

---

## 4. Two Column (2カラム)

### 用途
- 2つの概念を並列表示
- 左右で対比
- Before/After、Old/New など

### 自動選択条件
- 見出しが2〜3個
- 文字数が100〜400文字
- 比較表現はないが、複数の概念がある

### レイアウト構造
```
┌────────────────────────────────────┐
│  Main Title                        │
│                                    │
│  ┌───────────┐  ┌───────────┐    │
│  │ Column 1  │  │ Column 2  │    │
│  │           │  │           │    │
│  │ Content   │  │ Content   │    │
│  │ ...       │  │ ...       │    │
│  └───────────┘  └───────────┘    │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function TwoColumnLayout({ content, styling, hierarchy }: LayoutProps) {
  const { title, leftColumn, rightColumn } = parseTwoColumnContent(content);

  return (
    <div className="flex flex-col h-full p-12">
      {title && (
        <h2 className={cn('mb-8 font-bold', titleSizeClasses[styling.titleSize])}>
          {title}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-12 flex-1">
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MarkdownRenderer content={leftColumn} />
        </motion.div>

        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MarkdownRenderer content={rightColumn} />
        </motion.div>
      </div>
    </div>
  );
}
```

---

## 5. List Emphasize (箇条書き強調)

### 用途
- 複数の項目を列挙
- キーポイントの強調
- チェックリスト

### 自動選択条件
- 箇条書きが5個以上
- 文字数が300文字以下
- コードブロックなし

### レイアウト構造
```
┌────────────────────────────────────┐
│  Title                             │
│                                    │
│  ✓ List item 1                    │
│                                    │
│  ✓ List item 2                    │
│                                    │
│  ✓ List item 3                    │
│                                    │
│  ✓ List item 4                    │
│                                    │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function ListEmphasizeLayout({ content, styling }: LayoutProps) {
  const { title, items } = parseListContent(content);

  return (
    <div className="flex flex-col h-full p-12">
      {title && (
        <h2 className={cn('mb-12 font-bold', titleSizeClasses[styling.titleSize])}>
          {title}
        </h2>
      )}

      <ul className="space-y-8 flex-1">
        {items.map((item, index) => (
          <motion.li
            key={index}
            className="flex items-start text-2xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <span className="text-primary-500 mr-4 text-3xl">✓</span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 6. Comparison (比較表示)

### 用途
- A vs B の比較
- メリット・デメリット
- 対照表示

### 自動選択条件
- "vs", "対", "比較" などの表現
- テーブルまたは2つのリスト
- 対比構造がある

### レイアウト構造
```
┌────────────────────────────────────┐
│  Title: A vs B                     │
│                                    │
│  ┌─────────┐ VS ┌─────────┐      │
│  │    A    │    │    B    │      │
│  │         │    │         │      │
│  │ ✓ Pro 1 │    │ ✓ Pro 1 │      │
│  │ ✗ Con 1 │    │ ✗ Con 1 │      │
│  └─────────┘    └─────────┘      │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function ComparisonLayout({ content, styling }: LayoutProps) {
  const { title, leftSide, rightSide, vsLabel } = parseComparisonContent(content);

  return (
    <div className="flex flex-col h-full p-12">
      {title && (
        <h2 className={cn('mb-12 font-bold text-center', titleSizeClasses[styling.titleSize])}>
          {title}
        </h2>
      )}

      <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center flex-1">
        <motion.div
          className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-3xl font-bold mb-6">{leftSide.title}</h3>
          <MarkdownRenderer content={leftSide.content} />
        </motion.div>

        <div className="text-6xl font-bold text-gray-400">
          {vsLabel || 'VS'}
        </div>

        <motion.div
          className="bg-secondary-50 dark:bg-secondary-900/20 rounded-2xl p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-3xl font-bold mb-6">{rightSide.title}</h3>
          <MarkdownRenderer content={rightSide.content} />
        </motion.div>
      </div>
    </div>
  );
}
```

---

## 7. Quote (引用スライド)

### 用途
- 重要な引用文
- 名言、格言
- 印象的なメッセージ

### 自動選択条件
- 引用文 (`>`) がある
- 引用文が50文字以上
- 文字数が200文字以下

### レイアウト構造
```
┌────────────────────────────────────┐
│                                    │
│        "                           │
│     Quote text here                │
│     goes in the center             │
│        "                           │
│                                    │
│        — Author Name               │
│                                    │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function QuoteLayout({ content, styling }: LayoutProps) {
  const { quote, author } = parseQuoteContent(content);

  return (
    <div className="flex flex-col items-center justify-center h-full px-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <svg className="w-16 h-16 text-primary-300 mb-8" fill="currentColor" viewBox="0 0 32 32">
          <path d="M10 8v8h-6v-6h4v-2h-6v10h8v-8h-2v-2h2zm12 0v8h-6v-6h4v-2h-6v10h8v-8h-2v-2h2z"/>
        </svg>

        <blockquote className={cn(
          'text-3xl md:text-4xl font-serif italic leading-relaxed',
          'text-gray-800 dark:text-gray-200 mb-8'
        )}>
          {quote}
        </blockquote>

        {author && (
          <cite className="text-xl text-gray-600 dark:text-gray-400 not-italic">
            — {author}
          </cite>
        )}
      </motion.div>
    </div>
  );
}
```

---

## 8. Image Text (画像+テキスト)

### 用途
- ビジュアル説明
- 画像と説明文の組み合わせ
- デモ画面のキャプチャ

### 自動選択条件
- 画像が1つある
- 文字数が50〜200文字
- 画像を中心に配置

### レイアウト構造
```
┌────────────────────────────────────┐
│  Title                             │
│                                    │
│  ┌──────────────────────────────┐ │
│  │                              │ │
│  │        [Image]               │ │
│  │                              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Description text here             │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function ImageTextLayout({ content, styling }: LayoutProps) {
  const { title, imageUrl, imageAlt, description } = parseImageTextContent(content);

  return (
    <div className="flex flex-col h-full p-12">
      {title && (
        <h2 className={cn('mb-8 font-bold', titleSizeClasses[styling.titleSize])}>
          {title}
        </h2>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.img
          src={imageUrl}
          alt={imageAlt}
          className="max-h-96 rounded-xl shadow-2xl mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {description && (
          <motion.p
            className="text-xl text-center max-w-3xl text-gray-700 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
}
```

---

## 9. Timeline (タイムライン)

### 用途
- 時系列の説明
- ステップ・段階の表示
- プロセスの可視化

### 自動選択条件
- "ステップ", "段階", 年号などの表現
- 番号付きリストが3つ以上
- 時系列構造

### レイアウト構造
```
┌────────────────────────────────────┐
│  Title                             │
│                                    │
│  1 ──→ 2 ──→ 3 ──→ 4              │
│  │     │     │     │              │
│  Step  Step  Step  Step           │
│  1     2     3     4              │
└────────────────────────────────────┘
```

### 実装例
```typescript
export function TimelineLayout({ content, styling }: LayoutProps) {
  const { title, steps } = parseTimelineContent(content);

  return (
    <div className="flex flex-col h-full p-12">
      {title && (
        <h2 className={cn('mb-12 font-bold', titleSizeClasses[styling.titleSize])}>
          {title}
        </h2>
      )}

      <div className="flex items-center justify-between flex-1">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary-500 text-white flex items-center justify-center text-3xl font-bold mb-4">
                {index + 1}
              </div>
              <p className="text-lg text-center max-w-xs">{step}</p>
            </motion.div>

            {index < steps.length - 1 && (
              <motion.div
                className="flex-1 h-1 bg-primary-300 mx-4"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.2 + 0.3, duration: 0.4 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
```

---

## 10-12. その他のレイアウト

### Content Left / Center
標準的なテキストスライド（左寄せ / 中央寄せ）

### Diagram
図解・チャート中心のスライド（Mermaid統合など）

---

## 共通コンポーネント

### MarkdownRenderer
```typescript
// src/components/common/MarkdownRenderer.tsx
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function MarkdownRenderer({ content }: { content: string }) {
  const html = marked(content);
  const clean = DOMPurify.sanitize(html);

  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
```

### TailwindCSS設定（共通スタイル）
```css
/* src/styles/layouts.css */
@layer components {
  .slide-container {
    @apply w-screen h-screen overflow-hidden;
    @apply bg-white dark:bg-gray-900;
    @apply text-gray-900 dark:text-gray-100;
  }

  .slide-title {
    @apply font-bold leading-tight;
  }

  .slide-content {
    @apply text-lg md:text-xl leading-relaxed;
  }
}
```

---

**最終更新**: 2025-11-03
