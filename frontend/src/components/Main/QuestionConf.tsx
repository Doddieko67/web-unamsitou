import { useState, useEffect } from "react";

interface QuestionConfProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
}

export function QuestionConf({
  questionCount,
  onQuestionCountChange,
}: QuestionConfProps) {
  // Estado local para el input temporal
  const [inputValue, setInputValue] = useState<string>(
    questionCount.toString(),
  );

  // Opciones predefinidas comunes
  const presetOptions = [5, 30, 60, 100, 120, 128];

  // Sincronizar inputValue cuando questionCount cambie desde afuera
  useEffect(() => {
    setInputValue(questionCount.toString());
  }, [questionCount]);

  const handlePresetClick = (count: number) => {
    onQuestionCountChange(count);
  };

  const handleIncrement = () => {
    if (questionCount < 128) {
      onQuestionCountChange(questionCount + 1);
    }
  };

  const handleDecrement = () => {
    if (questionCount > 5) {
      onQuestionCountChange(questionCount - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Permitir solo números y campo vacío
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    // Validar y aplicar límites cuando el usuario termina de escribir
    const numValue = parseInt(inputValue, 10);

    if (isNaN(numValue) || inputValue === "") {
      // Si no es válido, revertir al valor actual
      setInputValue(questionCount.toString());
    } else {
      // Aplicar límites y actualizar
      let finalValue = numValue;
      if (numValue < 5) finalValue = 5;
      if (numValue > 128) finalValue = 128;

      onQuestionCountChange(finalValue);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Aplicar cambios al presionar Enter
    if (e.key === "Enter") {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Options Grid */}
      <div className="grid grid-cols-3 gap-3">
        {presetOptions.map((count) => {
          const isSelected = questionCount === count;
          return (
            <button
              key={count}
              onClick={() => handlePresetClick(count)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                isSelected ? "ring-2 ring-offset-2" : ""
              }`}
              style={
                {
                  backgroundColor: isSelected
                    ? "var(--theme-success)"
                    : "var(--theme-success-light)",
                  borderColor: "var(--theme-success)",
                  color: isSelected ? "white" : "var(--theme-success-dark)",
                  cursor: "pointer",
                  "--tw-ring-color": "var(--theme-success)",
                } as any
              }
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{count}</div>
                <div className="text-xs opacity-80">preguntas</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Input Section */}
      <div
        className="p-4 rounded-2xl border-2 transition-all duration-300"
        style={{
          backgroundColor: "var(--theme-info-light)",
          borderColor: "var(--theme-info)",
          color: "var(--theme-info-dark)",
        }}
      >
        <div className="text-center space-y-3">
          <div className="text-sm font-medium opacity-90">
            Cantidad personalizada
          </div>

          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleDecrement}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundColor: "var(--theme-info)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              disabled={questionCount <= 5}
            >
              <i className="fas fa-minus"></i>
            </button>

            <div
              className="px-6 py-3 rounded-xl border-2 min-w-[100px] flex items-center justify-center transition-all duration-300"
              style={{
                backgroundColor: "var(--theme-bg-primary)",
                borderColor: "var(--theme-info)",
                color: "var(--theme-info-dark)",
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                className="text-center text-2xl font-bold bg-transparent border-none outline-none w-full transition-all duration-300 focus:scale-105 number-input-no-arrows"
                style={{
                  color: "var(--theme-info-dark)",
                }}
                placeholder="--"
              />
            </div>

            <button
              onClick={handleIncrement}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundColor: "var(--theme-info)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              disabled={questionCount >= 128}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <div className="text-xs opacity-80">Rango: 5 - 128 preguntas</div>
        </div>
      </div>
    </div>
  );
}
