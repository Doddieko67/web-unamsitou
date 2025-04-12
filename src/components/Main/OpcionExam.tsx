export function OpcionExam() {
    return (
        <>
        {/* Creation Tabs */}
        <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button id="new-exam-tab" className="tab-active whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                    <i className="fas fa-plus-circle mr-2"></i> Nuevo Examen
                </button>
                <button id="upload-exam-tab" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                    <i className="fas fa-file-upload mr-2"></i> Subir Examen
                </button>
                <button id="history-exam-tab" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                    <i className="fas fa-history mr-2"></i> Basado en Historial
                </button>
            </nav>
        </div>
        </>
    )
}