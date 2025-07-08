interface QuestionConfProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
}

export function QuestionConf({
  questionCount,
  onQuestionCountChange,
}: QuestionConfProps) {
  // Opciones predefinidas comunes
  const presetOptions = [5, 10, 15, 20, 25, 30];
  
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

  const handleCustomChange = (value: number) => {
    if (!isNaN(value) && value >= 5 && value <= 128) {
      onQuestionCountChange(value);
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
                isSelected ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: isSelected ? 'var(--theme-success)' : 'var(--theme-success-light)',
                borderColor: 'var(--theme-success)',
                color: isSelected ? 'white' : 'var(--theme-success-dark)',
                '--tw-ring-color': 'var(--theme-success)'
              } as any}
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
          backgroundColor: !presetOptions.includes(questionCount) ? 'var(--theme-info)' : 'var(--theme-info-light)',
          borderColor: 'var(--theme-info)',
          color: !presetOptions.includes(questionCount) ? 'white' : 'var(--theme-info-dark)'
        }}
      >
        <div className="text-center space-y-3">
          <div className="text-sm font-medium opacity-90">
            Cantidad personalizada
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleDecrement}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: !presetOptions.includes(questionCount) ? 'rgba(255,255,255,0.2)' : 'var(--theme-info)',
                color: !presetOptions.includes(questionCount) ? 'white' : 'white'
              }}
              disabled={questionCount <= 5}
            >
              <i className="fas fa-minus"></i>
            </button>
            
            <div 
              className="px-6 py-3 rounded-xl border-2 min-w-[100px] flex items-center justify-center"
              style={{
                backgroundColor: !presetOptions.includes(questionCount) ? 'rgba(255,255,255,0.2)' : 'white',
                borderColor: !presetOptions.includes(questionCount) ? 'rgba(255,255,255,0.3)' : 'var(--theme-info)',
                color: !presetOptions.includes(questionCount) ? 'white' : 'var(--theme-info-dark)'
              }}
            >
              <input
                type="number"
                min="5"
                max="128"
                value={questionCount}
                onChange={(e) => handleCustomChange(Number(e.target.value))}
                className="text-center text-2xl font-bold bg-transparent border-none outline-none w-full"
                style={{
                  color: !presetOptions.includes(questionCount) ? 'white' : 'var(--theme-info-dark)'
                }}
              />
            </div>
            
            <button
              onClick={handleIncrement}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: !presetOptions.includes(questionCount) ? 'rgba(255,255,255,0.2)' : 'var(--theme-info)',
                color: !presetOptions.includes(questionCount) ? 'white' : 'white'
              }}
              disabled={questionCount >= 128}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
          
          <div className="text-xs opacity-80">
            Rango: 5 - 128 preguntas
          </div>
        </div>
      </div>
    </div>
  );
}
