import { useState } from "react";
import { ExamConf } from "./ExamConf";
import { ExamQuestions } from "../ExamQuestions";
import { ExamBasedOnHistory } from "../ExamBasedOnHistory";

export function OpcionExam() {
  // 1. Estado para guardar el ID de la pestaña activa
  //    Inicializamos con el ID de la pestaña que quieres activa por defecto.
  const [activeTab, setActiveTab] = useState("new-exam-tab"); // 'new-exam-tab' es el ID inicial

  // 2. Función para manejar el clic en una pestaña
  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  // (Opcional pero recomendado) Definir las pestañas como datos
  const tabs = [
    {
      id: "new-exam-tab",
      label: "Nuevo Examen",
      icon: "fas fa-plus-circle",
      content: <ExamConf />,
    },
    {
      id: "upload-exam-tab",
      label: "Subir Examen",
      icon: "fas fa-file-upload",
      content: <ExamQuestions />,
    },
    {
      id: "history-exam-tab",
      label: "Basado en Historial",
      icon: "fas fa-history",
      content: <ExamBasedOnHistory />,
    },
  ];

  // Clases base comunes para todas las pestañas
  const commonTabClasses =
    "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm";
  // Clases específicas para la pestaña activa
  const activeTabClasses = "border-indigo-500 text-indigo-600"; // Ejemplo de clases activas
  // Clases específicas para pestañas inactivas
  const inactiveTabClasses =
    "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <div>
      {" "}
      {/* Contenedor principal */}
      <div className="mb-4 sm:mb-8 border-b border-gray-200">
        {" "}
        {/* Ajustado mb para ejemplo */}
        <nav
          className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={tab.id}
              // 3. Asignar el manejador de clics
              onClick={() => handleTabClick(tab.id)}
              // 4. Aplicar clases condicionalmente
              className={`${commonTabClasses} ${
                activeTab === tab.id ? activeTabClasses : inactiveTabClasses
              }`}
              // 5. Añadir atributos ARIA para accesibilidad
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`} // Necesitarás un panel con este ID
            >
              {tab.icon && <i className={`${tab.icon} mr-2`}></i>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {/* 6. Mostrar el contenido de la pestaña activa */}
      <div className="mt-4">
        {tabs.map((tab) => (
          <div
            key={`${tab.id}-panel`}
            id={`${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={tab.id}
            // Mostrar solo si la pestaña está activa
            hidden={activeTab !== tab.id}
          >
            {/* Renderiza el componente de contenido asociado */}
            {activeTab === tab.id && tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
