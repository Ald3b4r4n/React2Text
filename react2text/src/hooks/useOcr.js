import { useState } from "react";
import { extractAndFillFields } from "../utils/dataExtraction";
import { withValidation } from "../utils/validationWrapper";

const MAX_FILE_SIZE_KB = 1024;
const MAX_DIMENSION = 1200;
const OCR_API_KEY = "K88430917688957";
const OCR_TIMEOUT = 20000; // Aumentado para 20s devido à Engine 2 ser mais lenta

export const useOcr = (currentFile, updateField, setOcrRawText, onTimeout) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const processDocument = async () => {
    if (!currentFile) {
      console.error("Nenhum arquivo selecionado.");
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const processedFile = await processImageFile(currentFile);
      setProcessingProgress(30);

      // Não precisamos mais converter para base64, enviamos o arquivo direto
      // const base64Image = await fileToBase64(processedFile);
      setProcessingProgress(50);

      // Implementando estratégia de fallback: Engine 2 -> Engine 1
      const { fullJson, parsedText } = await handleOCRWithFallback(processedFile);
      setProcessingProgress(90);

      // Exibe o JSON completo no campo "Texto Extraído"
      setOcrRawText(JSON.stringify(fullJson, null, 2));
      
      // ===== SISTEMA DE VALIDAÇÃO AVANÇADO ATIVADO =====
      // Aplica validação automática: CPF, Placa, Renavam, Data
      // Fallback para padrões universais se validação falhar
      // Formatação automática de dados brasileiros
      const extractWithValidation = withValidation(extractAndFillFields);
      extractWithValidation(fullJson, updateField);
      console.log('✅ Sistema de validação avançado aplicado');
      // =================================================
      setProcessingProgress(100);
    } catch (error) {
      console.error("Erro no processamento:", error);

      // Verifica se é erro de timeout
      if (error.message.includes("OCR demorou muito tempo para responder")) {
        if (onTimeout) {
          onTimeout();
        }
      }

      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPastedText = (text) => {
    if (!text?.trim()) {
      throw new Error("Nenhum texto para processar");
    }

    try {
      setOcrRawText(text);
      extractAndFillFields(text, updateField);
    } catch (error) {
      console.error("Erro no processamento do texto:", error);
      throw error;
    }
  };

  const handleOCRWithFallback = async (imageFile) => {
    console.log("Iniciando OCR com Engine 2 (Alta Precisão)...");
    try {
      // Primeira tentativa com Engine 2
      const result2 = await performOCR(imageFile, 2);
      
      if (result2 && !result2.IsErroredOnProcessing && result2.ParsedResults?.[0]?.ParsedText) {
        return {
          fullJson: result2,
          parsedText: result2.ParsedResults[0].ParsedText
        };
      }
      
      console.log("Engine 2 falhou ou não retornou texto. Tentando Engine 1 (Rápida)...");
    } catch (e) {
      console.warn("Erro na Engine 2:", e);
    }

    // Fallback para Engine 1
    const result1 = await performOCR(imageFile, 1);
    
    if (result1.IsErroredOnProcessing) {
       throw new Error(result1.ErrorMessage?.[0] || "Erro no processamento OCR");
    }
    
    if (!result1.ParsedResults?.length || !result1.ParsedResults[0].ParsedText) {
       throw new Error("Nenhum texto reconhecido");
    }

    return {
      fullJson: result1,
      parsedText: result1.ParsedResults[0].ParsedText
    };
  };

  const performOCR = async (imageFile, engine) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("apikey", OCR_API_KEY);
    formData.append("OCREngine", engine.toString());
    formData.append("language", "por");
    
    // Parâmetros otimizados
    formData.append("isOverlayRequired", "true");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("isTable", "true");

    let timeoutId;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("OCR demorou muito tempo para responder"));
        }, OCR_TIMEOUT);
      });

      const fetchPromise = fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);

      return await response.json();
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      throw error;
    }
  };

  // Funções auxiliares de processamento de imagem
  const processImageFile = async (file) => {
    if (file.size / 1024 <= MAX_FILE_SIZE_KB) return file;

    try {
      const resizedImage = await resizeImage(
        file,
        MAX_DIMENSION,
        MAX_DIMENSION
      );
      const compressedImage = await compressToFileSize(
        resizedImage,
        MAX_FILE_SIZE_KB
      );
      return compressedImage;
    } catch (error) {
      console.error("Erro no processamento da imagem:", error);
      throw error;
    }
  };

  // fileToBase64 removido pois não é mais usado

  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Falha ao criar blob"));
            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })
            );
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = URL.createObjectURL(file);
    });
  };

  const compressToFileSize = (file, maxSizeKB) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          let quality = 0.9;
          const compress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                  resolve(
                    new File([blob], file.name, {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    })
                  );
                } else {
                  quality -= 0.1;
                  compress();
                }
              },
              "image/jpeg",
              quality
            );
          };
          compress();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    processDocument,
    processPastedText,
    isProcessing,
    processingProgress,
  };
};
