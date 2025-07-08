import { useState, memo } from "react";

// Asume que la interfaz Subject está definida
interface Subject {
  name: string;
  icon: string;
  description: string;
  colorClasses: { bg: string; text: string; iconBg: string };
  colorTheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
}

// Interfaz para las props, añadiendo una función para manejar la adición
interface MateriasProps {
  availableSubjects: Subject[]; // Ahora recibe las materias disponibles
  selectedSubjects: string[];
  onSubjectToggle: (subjectName: string) => void;
  onAddCustomSubject: (newSubject: Subject) => void; // Nueva prop
}

export const Materias = memo(function Materias({
  availableSubjects, // Recibe las materias
  selectedSubjects,
  onSubjectToggle,
  onAddCustomSubject, // Recibe la función para añadir
}: MateriasProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDesc, setNewSubjectDesc] = useState("");
  // Podrías añadir selección de icono/color aquí también

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewSubjectName("");
    setNewSubjectDesc("");
  };

  const handleConfirmAdd = () => {
    if (!newSubjectName.trim()) {
      alert("Por favor, introduce un nombre para la materia.");
      return;
    }
    // Validación simple para evitar duplicados (insensible a mayúsculas/minúsculas)
    if (
      availableSubjects.some(
        (s) => s.name.toLowerCase() === newSubjectName.trim().toLowerCase(),
      )
    ) {
      alert(`La materia "${newSubjectName.trim()}" ya existe.`);
      return;
    }

    // Crear un nuevo objeto Subject (simplificado - icono y color por defecto)
    const newSubject: Subject = {
      name: newSubjectName.trim(),
      description:
        newSubjectDesc.trim() ||
        `Materia personalizada: ${newSubjectName.trim()}`, // Descripción por defecto si está vacía
      icon: "fas fa-shapes", // Icono por defecto
      colorClasses: {
        // Colores por defecto
        bg: "bg-gray-100",
        text: "text-gray-800",
        iconBg: "bg-gray-200",
      },
    };

    onAddCustomSubject(newSubject); // Llama a la función del padre
    handleCancelAdd(); // Cierra el formulario
  };

  return (
    <div className="space-y-6">
      {/* Selected Subjects Display */}
      {selectedSubjects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              Materias seleccionadas ({selectedSubjects.length})
            </span>
            <button
              onClick={() => selectedSubjects.forEach(onSubjectToggle)}
              className="text-xs px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-error-light)',
                color: 'var(--theme-error-dark)'
              }}
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSubjects.map((subjectName) => {
              const subjectData = availableSubjects.find(s => s.name === subjectName);
              const getThemeColor = (colorTheme: string = 'blue') => {
                const colors = {
                  blue: { bg: 'var(--theme-info-light)', text: 'var(--theme-info-dark)', border: 'var(--theme-info)' },
                  green: { bg: 'var(--theme-success-light)', text: 'var(--theme-success-dark)', border: 'var(--theme-success)' },
                  purple: { bg: '#f3e8ff', text: '#6b21a8', border: '#a855f7' },
                };
                return colors[colorTheme as keyof typeof colors] || colors.blue;
              };
              const colors = getThemeColor(subjectData?.colorTheme);
              
              return (
                <div
                  key={subjectName}
                  className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border transition-all duration-200"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text
                  }}
                >
                  <i className={`${subjectData?.icon || 'fas fa-book'} text-xs`} />
                  <span className="text-sm font-medium">{subjectName}</span>
                  <button
                    onClick={() => onSubjectToggle(subjectName)}
                    className="w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ backgroundColor: colors.border }}
                    aria-label={`Quitar ${subjectName}`}
                  >
                    <i className="fas fa-times text-xs text-white"></i>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject Selection Grid - Similar to Difficulty Style */}
      <div className="grid grid-cols-2 gap-4">
        {availableSubjects.map((subject) => {
          const isSelected = selectedSubjects.includes(subject.name);
          const getThemeColor = (colorTheme: string = 'blue') => {
            const colors = {
              blue: { bg: 'var(--theme-info-light)', text: 'var(--theme-info-dark)', border: 'var(--theme-info)' },
              green: { bg: 'var(--theme-success-light)', text: 'var(--theme-success-dark)', border: 'var(--theme-success)' },
              purple: { bg: '#f3e8ff', text: '#6b21a8', border: '#a855f7' },
              orange: { bg: 'var(--theme-warning-light)', text: 'var(--theme-warning-dark)', border: 'var(--theme-warning)' },
              red: { bg: 'var(--theme-error-light)', text: 'var(--theme-error-dark)', border: 'var(--theme-error)' },
              indigo: { bg: '#e0e7ff', text: '#3730a3', border: '#6366f1' }
            };
            return colors[colorTheme as keyof typeof colors] || colors.blue;
          };
          const colors = getThemeColor(subject.colorTheme);
          
          return (
            <button
              key={subject.name}
              onClick={() => onSubjectToggle(subject.name)}
              className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105 ${
                isSelected ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                backgroundColor: isSelected ? colors.border : colors.bg,
                borderColor: colors.border,
                color: isSelected ? 'white' : colors.text,
                '--tw-ring-color': colors.border
              } as any}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white',
                    color: isSelected ? 'white' : colors.text
                  }}
                >
                  <i className={`${subject.icon} text-lg`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1">
                    {subject.name}
                  </h4>
                  <p className="text-xs opacity-80 leading-tight">
                    {subject.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <i className="fas fa-check text-xs text-white"></i>
                  </div>
                )}
              </div>
            </button>
          );
        })}
        
        {/* Add Custom Subject Button */}
        {!showAddForm && (
          <button
            onClick={handleAddClick}
            className="p-4 rounded-2xl border-2 border-dashed transition-all duration-300 text-left group hover:scale-105"
            style={{
              borderColor: 'var(--theme-border-secondary)',
              backgroundColor: 'var(--theme-bg-secondary)',
              color: 'var(--theme-text-secondary)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{ backgroundColor: 'var(--primary)' }}
              >
<i className="fas fa-plus-circle text-lg text-white"></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">
                  Personalizada
                </h4>
                <p className="text-xs opacity-80 leading-tight">
                  Añadir materia
                </p>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Formulario/Modal para Añadir Materia (se muestra condicionalmente) */}
      {showAddForm && (
        <div className="mt-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
          <h4 className="text-md font-semibold text-indigo-800 mb-3">
            Añadir Nueva Materia
          </h4>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="new-subject-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre de la Materia:
              </label>
              <input
                type="text"
                id="new-subject-name"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ej: Física Cuántica"
              />
            </div>
            <div>
              <label
                htmlFor="new-subject-desc"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Descripción (Opcional):
              </label>
              <input
                type="text"
                id="new-subject-desc"
                value={newSubjectDesc}
                onChange={(e) => setNewSubjectDesc(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Ej: Principios básicos y experimentos"
              />
            </div>
            {/* Podrías añadir aquí selección de icono/color */}
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancelAdd}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmAdd}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Añadir Materia
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
