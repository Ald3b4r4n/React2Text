// src/hooks/useOcr.js
import { useState, useCallback } from "react";
import { callOcrSpaceApi } from "../utils/ocr";
import { processImageFile, fileToBase64 } from "../utils/imageProcessing";
import { extractAndFillFields } from "../utils/dataExtraction";

export const useOcr = (currentFile, updateField, setOcrRawText) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const processDocument = useCallback(async () => {
    if (!currentFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      setProcessingProgress(30);
      const processedFile = await processImageFile(
        currentFile,
        setProcessingProgress
      );

      setProcessingProgress(60);
      // Converter para base64 antes de enviar para a API
      const base64String = await fileToBase64(processedFile);
      const text = await callOcrSpaceApi(base64String);

      setOcrRawText(text);
      extractAndFillFields(text, updateField);

      setProcessingProgress(100);
    } catch (error) {
      console.error("Erro no processamento:", error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessingProgress(0), 1000);
    }
  }, [currentFile, updateField, setOcrRawText]);

  const processPastedText = useCallback(
    (text) => {
      if (!text || text.trim().length < 10) return;

      setOcrRawText(text);
      extractAndFillFields(text, updateField);
    },
    [updateField, setOcrRawText]
  );

  return {
    processDocument,
    processPastedText,
    isProcessing,
    processingProgress,
  };
};
