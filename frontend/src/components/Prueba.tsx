import { useState } from "react";

export function PruebaBoton() {
  const [textPasted, setTextPasted] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  const handleDeleteFile = (indexToDelete: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToDelete);
    setFiles(updatedFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /* ... (sin cambios) ... */
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: FileList = event.target.files;

      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        if (prevFiles) {
          return [...prevFiles, ...newFilesArray];
        } else {
          return newFilesArray;
        }
      });
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* ... (sin cambios) ... */
    setTextPasted(event.target.value);
  };

  return (
    <div>
      <label htmlFor="id-file">Seleccionar archivos</label>
      <input
        id="id-file"
        className="hidden"
        type="file"
        onChange={handleFileChange}
        multiple
      />
      <textarea onChange={handleTextChange}></textarea>
      <div className="grid grid-cols-2">
        <div>
          {files &&
            Array.from(files).map((file, index) => (
              <ul className="flex flex-row justify-between">
                <div>
                  {file.type == "image/*" && <Image source={file}></Image>}
                  <li key={index}>{file.name}</li>
                  <li>{file.size}</li>
                </div>
                <button
                  className="fas fa-xmark bg-red-100 text-red-600"
                  onClick={() => {
                    handleDeleteFile(index);
                  }}
                ></button>
              </ul>
            ))}
        </div>
        <div>{textPasted}</div>
      </div>
    </div>
  );
}
