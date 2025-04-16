import { useState } from "react";
import { handleGenerate } from "../API/Gemini";

export function BotonPrueba() {
  const [mensaje, setMensaje] = useState<string>("");
  return (
    <>
      <input
        onChange={(e) => {
          setMensaje(e.target.value);
        }}
      />
      <button onClick={() => handleGenerate(mensaje)}>
        Esto es una prueba
      </button>
    </>
  );
}
