// Asume que el tipo Difficulty está definido o importado
type Difficulty = "easy" | "medium" | "hard" | "mixed";

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
  icon: string;
  colorClasses: { bg: string; text: string };
}

const difficultyOptions: DifficultyOption[] = [
  {
    value: "easy",
    label: "Fácil",
    description: "Conceptos básicos",
    icon: "fas fa-smile",
    colorClasses: { bg: "bg-green-100", text: "text-green-600" },
  },
  {
    value: "medium",
    label: "Medio",
    description: "Reto moderado",
    icon: "fas fa-meh",
    colorClasses: { bg: "bg-yellow-100", text: "text-yellow-600" },
  },
  {
    value: "hard",
    label: "Difícil",
    description: "Preguntas complejas",
    icon: "fas fa-frown",
    colorClasses: { bg: "bg-red-100", text: "text-red-600" },
  },
  {
    value: "mixed",
    label: "Mixto",
    description: "Variedad de niveles",
    icon: "fas fa-random",
    colorClasses: { bg: "bg-indigo-100", text: "text-indigo-600" },
  },
];

interface DifficultExamProps {
  selectedDifficulty: Difficulty | null;
  onDifficultySelect: (difficulty: Difficulty) => void;
}

export function DifficultExam({
  selectedDifficulty,
  onDifficultySelect,
}: DifficultExamProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        3. Nivel de dificultad
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {difficultyOptions.map((option) => {
          const isSelected = selectedDifficulty === option.value;
          return (
            <div
              key={option.value}
              className={`difficulty-option border-2 rounded-lg p-4 text-center cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => onDifficultySelect(option.value)}
            >
              <div
                className={`w-12 h-12 rounded-full ${option.colorClasses.bg} flex items-center justify-center mx-auto mb-3`}
              >
                <i
                  className={`${option.icon} ${option.colorClasses.text} text-xl`}
                ></i>
              </div>
              <h4 className="font-semibold text-gray-800">{option.label}</h4>
              <p className="text-sm text-gray-500">{option.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
