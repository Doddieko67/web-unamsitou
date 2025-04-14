export async function handleGenerate(input: string) {
  try {
    // Llama a TU backend, no directamente a Google
    const response = await fetch("http://localhost:3001/api/generate-content", {
      // Asegúrate que la URL/puerto sea correcto
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: input }), // Envía el input como 'prompt'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.generatedText;
  } catch (err) {
    console.error("Error fetching from backend:", err);
  }
  return "";
}
