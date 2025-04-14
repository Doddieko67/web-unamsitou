import { ExamBasedOnHistory } from "../components/ExamBasedOnHistory";
import { ExamRecents } from "../components/Main/ExamRecents";
export function Examenes() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ExamRecents></ExamRecents>
      <ExamBasedOnHistory></ExamBasedOnHistory>
    </main>
  );
}
