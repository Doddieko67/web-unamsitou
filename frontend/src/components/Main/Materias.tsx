export function Materias() {
    return (
        <>
        {/* Subjects Selection */}
            <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">1. Selecciona las materias</h3>
                <div className="flex flex-wrap gap-3 mb-4" id="selected-subjects-container">
                    {/* Selected subjects will appear here */}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Subject Card 1 */}
                    <div className="subject-chip bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-indigo-300" data-color="bg-blue-100" data-text="text-blue-800" data-subject="Matemáticas">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <i className="fas fa-square-root-alt text-blue-600"></i>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Matemáticas</h4>
                                <p className="text-sm text-gray-500">Álgebra, cálculo, geometría</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Subject Card 2 */}
                    <div className="subject-chip bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-indigo-300" data-color="bg-green-100" data-text="text-green-800" data-subject="Biología">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                <i className="fas fa-dna text-green-600"></i>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Biología</h4>
                                <p className="text-sm text-gray-500">Células, genética, ecología</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Subject Card 3 */}
                    <div className="subject-chip bg-white border border-gray-200 rounded-lg p-4 shadow-sm cursor-pointer hover:border-indigo-300" data-color="bg-purple-100" data-text="text-purple-800" data-subject="Literatura">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                <i className="fas fa-book-open text-purple-600"></i>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">Literatura</h4>
                                <p className="text-sm text-gray-500">Obras clásicas, análisis</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Add Custom Subject */}
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-indigo-300 hover:bg-gray-100 flex items-center justify-center" id="add-subject-btn">
                        <div className="text-center">
                            <i className="fas fa-plus-circle text-gray-400 text-2xl mb-1"></i>
                            <p className="text-sm font-medium text-gray-500">Añadir materia</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}