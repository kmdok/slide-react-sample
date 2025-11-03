# New Slide Command

このコマンドは新しいスライドを作成するためのものです。

## 手順

1. **AskUserQuestion ツールを使って以下の情報を収集してください**:

   **質問1: スライドの内容**
   - header: "内容"
   - question: "どんな内容のスライドを作成しますか？（例: プロジェクトの紹介、データ分析結果、チーム紹介）"
   - ユーザーに自由入力させる

   **質問2: 挿入位置**
   - header: "挿入位置"
   - question: "スライドを何番目に表示しますか？"
   - options:
     - "先頭に追加" (description: "最初のスライドとして表示")
     - "最後に追加" (description: "最後のスライドとして表示")
     - "特定の位置に挿入" (description: "既存のスライドの間に挿入")

   **質問3: 背景スタイル**
   - header: "背景"
   - question: "スライドの背景スタイルを選択してください"
   - options:
     - "青グラデーション" (description: "bg-gradient-to-br from-blue-500 to-purple-600 text-white")
     - "緑グラデーション" (description: "bg-gradient-to-br from-green-500 to-teal-600 text-white")
     - "白背景" (description: "bg-white text-gray-800")
     - "ダークモード" (description: "bg-gray-900 text-white")
     - "カスタム" (description: "TailwindCSSクラスを直接指定")

2. **収集した情報から、適切なファイル名とタイトルを生成してください**:

   - **スライドの内容**から以下を自動生成：
     - **ファイル名**: 内容を表す英語のPascalCase（例: "プロジェクト紹介" → `ProjectIntroSlide`）
     - **スライドタイトル**: 日本語のタイトル（例: "プロジェクト紹介"）
     - **key名**: ファイル名を小文字化したもの（例: `project-intro`）

   - 自動生成したファイル名とタイトルをユーザーに確認してください

3. **スライドファイルを作成してください**:

   - ファイル名: `src/slides/{スライド名}.tsx`
   - ファイル内容:
     ```typescript
     import { Slide } from '@/components/Slide';
     import type { ReactElement } from 'react';

     type SlideProps = {
       direction: 'forward' | 'backward';
     };

     /**
      * {スライドの説明}
      */
     export function {スライド名}({ direction }: SlideProps): ReactElement {
       return (
         <Slide key="{スライド名を小文字化したもの}" className="{選択された背景スタイル}" direction={direction}>
           <div>
             <h1 className="text-4xl font-bold mb-4">{スライドタイトル}</h1>
             {/* ユーザーが後で編集できるプレースホルダー */}
             <p className="text-xl">ここにコンテンツを追加してください</p>
           </div>
         </Slide>
       );
     }
     ```

4. **`src/slides/index.tsx` を更新してください**:

   - 新しいスライドをインポート
   - slideComponents 配列の指定された位置に追加

   例:
   ```typescript
   import { NewSlide } from './NewSlide';

   export const slideComponents: SlideComponent[] = [
     TitleSlide,
     NewSlide,  // ← 追加
     FeaturesSlide,
     // ...
   ];
   ```

5. **TypeScript チェックとビルドを実行してください**:
   ```bash
   pnpm exec tsc --noEmit && pnpm run build
   ```

6. **完了メッセージを表示してください**:
   - 作成したスライドのファイルパス
   - スライドの表示位置（何番目）
   - アクセス用URL（例: http://localhost:5173/2）
   - 次のステップ（コンテンツを編集する方法）

## 注意事項

- **ファイル名の自動生成**:
  - ユーザーが入力した内容から適切な英語名を考えてください
  - PascalCaseで命名してください（例: `ProjectIntroSlide`, `DataAnalysisSlide`）
  - ファイル名の最後に必ず "Slide" を付けてください
  - 日本語の内容を英語に翻訳する際は、簡潔でわかりやすい名前にしてください

- **タイトルの自動生成**:
  - ユーザーが入力した内容をそのまま、または整形してタイトルにしてください
  - 必要に応じて表現を改善してください（例: "プロジェクトについて" → "プロジェクト紹介"）

- **追加の質問**:
  - 背景スタイルが"カスタム"の場合は、追加でTailwindCSSクラスを聞いてください
  - 挿入位置が"特定の位置"の場合は、何番目かを追加で聞いてください

- **確認**:
  - 自動生成したファイル名とタイトルは、必ずユーザーに確認してから進めてください
  - 修正が必要な場合は、ユーザーの指示に従って変更してください
