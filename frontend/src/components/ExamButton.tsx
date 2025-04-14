import { UserAuth } from "../context/AuthContext";

export function ExamButton() {
  const { createExam } = UserAuth();
  return (
    <div className="flex justify-end">
      <button className="gradient-bg text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-300 flex items-center">
        <i className="fas fa-magic mr-2"></i> Generar Examen
      </button>
    </div>
  );
}
