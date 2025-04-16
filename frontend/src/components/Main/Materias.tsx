import { useState } from "react"; // Añadir useState aquí

// Asume que la interfaz Subject está definida
interface Subject {
  name: string;
  icon: string;
  description: string;
  colorClasses: { bg: string; text: string; iconBg: string };
}

// Interfaz para las props, añadiendo una función para manejar la adición
interface MateriasProps {
  availableSubjects: Subject[]; // Ahora recibe las materias disponibles
  selectedSubjects: string[];
  onSubjectToggle: (subjectName: string) => void;
  onAddCustomSubject: (newSubject: Subject) => void; // Nueva prop
}

export function Materias({
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
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        1. Selecciona las materias
      </h3>

      {/* Mostrar chips de materias seleccionadas (sin cambios) */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
        {selectedSubjects.length === 0 && (
          <span className="text-sm text-gray-500 italic">
            Ninguna materia seleccionada
          </span>
        )}
        {selectedSubjects.map((subjectName) => {
          // Lógica para encontrar datos y colores (igual que antes)
          // Intenta encontrar en availableSubjects primero
          const subjectData = availableSubjects.find(
            (s) => s.name === subjectName,
          );
          // Si no está ahí, podrías tener una lista separada de custom subjects o asumir colores por defecto
          const colorClasses = subjectData?.colorClasses || {
            bg: "bg-gray-100",
            text: "text-gray-800",
          };
          return (
            <span
              key={subjectName}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}
            >
              {subjectName}
              <button
                type="button"
                className="ml-1.5 flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:bg-gray-200 focus:text-gray-700"
                onClick={() => onSubjectToggle(subjectName)}
                aria-label={`Quitar ${subjectName}`}
              >
                <svg
                  className="h-2 w-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 8 8"
                >
                  <path
                    strokeLinecap="round"
                    strokeWidth="1.5"
                    d="M1 1l6 6m0-6L1 7"
                  />
                </svg>
              </button>
            </span>
          );
        })}
      </div>

      {/* Tarjetas para seleccionar materias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableSubjects.map((subject) => {
          // Itera sobre las materias disponibles recibidas
          const isSelected = selectedSubjects.includes(subject.name);
          return (
            <div
              key={subject.name}
              className={`subject-chip bg-white border rounded-lg p-4 shadow-sm cursor-pointer transition-all duration-150 ${
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-200"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-md"
              }`}
              onClick={() => onSubjectToggle(subject.name)}
            >
              {/* Contenido de la tarjeta (igual que antes) */}
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full ${subject.colorClasses.iconBg} flex items-center justify-center mr-3 flex-shrink-0`}
                >
                  <i
                    className={`${subject.icon} ${subject.colorClasses.text}`}
                  ></i>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{subject.name}</h4>
                  <p className="text-sm text-gray-500">{subject.description}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Botón Añadir Materia - Ahora abre el formulario */}
        {!showAddForm && (
          <div
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-300 hover:bg-gray-100 flex items-center justify-center"
            onClick={handleAddClick} // Llama a handleAddClick
          >
            <div className="text-center">
              <i className="fas fa-plus-circle text-gray-400 text-2xl mb-1"></i>
              <p className="text-sm font-medium text-gray-500">
                Añadir materia
              </p>
            </div>
          </div>
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
}
