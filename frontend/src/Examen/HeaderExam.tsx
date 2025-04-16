export function HeaderExam(title: string) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex flex-col justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            <p className="text-gray-600">Generado el 15 de junio, 2023</p>
          </div>
          <div className="mt-4 md:mt-0 bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg">
            <i className="fas fa-info-circle mr-2"></i>
            <span>5 preguntas • 3 horas • Dificultad: Mixta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
