// src/utils/ocr.js
const OCR_API_KEY = "K82112819888957";
const OCR_TIMEOUT = 10000;

export const callOcrSpaceApi = async (base64String) => {
  const formData = new FormData();
  formData.append("base64Image", `data:image/jpeg;base64,${base64String}`);
  formData.append("language", "por");
  formData.append("OCREngine", "5");
  formData.append("scale", "true");
  formData.append("detectOrientation", "true");

  let timeoutId;
  let isTimedOut = false;

  try {
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        isTimedOut = true;
        reject(new Error("OCR demorou muito tempo para responder"));
      }, OCR_TIMEOUT);
    });

    const fetchPromise = fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: { apikey: OCR_API_KEY },
      body: formData,
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);

    const data = await response.json();
    if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage[0]);
    if (!data.ParsedResults?.length)
      throw new Error("Nenhum texto reconhecido");

    return data.ParsedResults[0].ParsedText || "";
  } catch (error) {
    if (!isTimedOut && timeoutId) clearTimeout(timeoutId);
    throw error;
  }
};
