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
    description: "Básico",
    icon: "fas fa-smile",
    colorClasses: { bg: "bg-green-100", text: "text-green-600" },
  },
  {
    value: "medium",
    label: "Medio",
    description: "Moderado",
    icon: "fas fa-meh",
    colorClasses: { bg: "bg-yellow-100", text: "text-yellow-600" },
  },
  {
    value: "hard",
    label: "Difícil",
    description: "Complejo",
    icon: "fas fa-frown",
    colorClasses: { bg: "bg-red-100", text: "text-red-600" },
  },
  {
    value: "mixed",
    label: "Mixto",
    description: "Variado",
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
  const getThemeColors = (value: Difficulty) => {
    switch (value) {
      case 'easy':
        return {
          bg: 'var(--theme-success-light)',
          text: 'var(--theme-success-dark)',
          border: 'var(--theme-success)'
        };
      case 'medium':
        return {
          bg: 'var(--theme-warning-light)',
          text: 'var(--theme-warning-dark)',
          border: 'var(--theme-warning)'
        };
      case 'hard':
        return {
          bg: 'var(--theme-error-light)',
          text: 'var(--theme-error-dark)',
          border: 'var(--theme-error)'
        };
      case 'mixed':
        return {
          bg: 'var(--theme-info-light)',
          text: 'var(--theme-info-dark)',
          border: 'var(--theme-info)'
        };
      default:
        return {
          bg: 'var(--theme-bg-secondary)',
          text: 'var(--theme-text-secondary)',
          border: 'var(--theme-border-primary)'
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {difficultyOptions.map((option) => {
          const isSelected = selectedDifficulty === option.value;
          const colors = getThemeColors(option.value);
          
          return (
            <button
              key={option.value}
              className={`p-3 lg:p-4 rounded-xl border-2 text-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: isSelected ? colors.border : 'var(--theme-bg-primary)',
                borderColor: colors.border,
                color: isSelected ? 'white' : 'var(--theme-text-primary)',
                '--tw-ring-color': colors.border
              } as any}
              onClick={() => onDifficultySelect(option.value)}
            >
              <div
                className="w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.bg
                }}
              >
                <i
                  className={`${option.icon} text-sm lg:text-xl`}
                  style={{
                    color: isSelected ? 'white' : colors.text
                  }}
                ></i>
              </div>
              <h4 
                className="font-semibold text-sm lg:text-base mb-1"
                style={{
                  color: isSelected ? 'white' : 'var(--theme-text-primary)'
                }}
              >
                {option.label}
              </h4>
              <p 
                className="text-xs lg:text-sm opacity-80"
                style={{
                  color: isSelected ? 'white' : 'var(--theme-text-secondary)'
                }}
              >
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
