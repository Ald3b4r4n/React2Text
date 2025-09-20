// src/hooks/useImageProcessing.js
import { useState, useCallback } from "react";

export const useImageProcessing = (setCurrentFile, setAbordadoFile) => {
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [abordadoPreviewUrl, setAbordadoPreviewUrl] = useState("");

  const handleFileSelect = useCallback(
    (event, type) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === "document") {
          setCurrentFile(file);
          setDocumentPreviewUrl(e.target.result);
        } else {
          setAbordadoFile(file);
          setAbordadoPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    },
    [setCurrentFile, setAbordadoFile]
  );

  return {
    handleFileSelect,
    documentPreviewUrl,
    abordadoPreviewUrl,
  };
};
