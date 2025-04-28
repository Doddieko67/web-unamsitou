import { useState } from "react";
import { Estadisticas } from "../components/Estadisticas";

export function Perfil() {
  const [activeTab, setActiveTab] = useState("estadisticas-tab"); // 'new-exam-tab' es el ID inicial

  // 2. Función para manejar el clic en una pestaña
  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  // (Opcional pero recomendado) Definir las pestañas como datos
  const tabs = [
    {
      id: "estadisticas-tab",
      label: "Estadísticas",
      icon: "fas fa-chart-line",
      content: <Estadisticas />,
    },
  ];

  const commonTabClasses = "tab-btn py-4 px-6 font-medium";
  // Clases específicas para la pestaña activa
  const activeTabClasses = "text-indigo-600 border-b-2 border-indigo-600"; // Ejemplo de clases activas
  // Clases específicas para pestañas inactivas
  const inactiveTabClasses = "text-gray-500 hover:text-gray-700";

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`${commonTabClasses} ${activeTab === tab.id ? activeTabClasses : inactiveTabClasses}`}
            data-tab={tab.id}
          >
            <i className={tab.icon} mr-2></i> {tab.label}
          </button>
        ))}
      </div>
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
    </main>
  );
}
