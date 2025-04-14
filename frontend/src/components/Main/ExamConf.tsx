import { ExamButton } from "../ExamButton";
import { DifficultExam } from "./DifficultExam";
import { Materias } from "./Materias";
import { QuestionConf } from "./QuestionConf";

export function ExamConf() {
  return (
    <div
      id="new-exam-section"
      className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Configura tu examen personalizado
      </h2>
      <Materias></Materias>
      <QuestionConf></QuestionConf>
      <DifficultExam></DifficultExam>
      <ExamButton></ExamButton>
    </div>
  );
}
