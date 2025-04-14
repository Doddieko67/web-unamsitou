export function HeaderExam() {
  return (
    <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div class="p-6">
        <div class="flex flex-col justify-between items-start md:items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-1">
              Examen de Matemáticas y Biología
            </h1>
            <p class="text-gray-600">Generado el 15 de junio, 2023</p>
          </div>
          <div class="mt-4 md:mt-0 bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg">
            <i class="fas fa-info-circle mr-2"></i>
            <span>5 preguntas • 3 horas • Dificultad: Mixta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
