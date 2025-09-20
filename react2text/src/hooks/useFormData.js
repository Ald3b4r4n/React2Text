// src/hooks/useFormData.js
import { useState, useCallback } from "react";

export const useFormData = () => {
  const [formData, setFormData] = useState({
    abordado: "",
    naturalidade: "",
    genitora: "",
    apelido: "",
    cpf: "",
    dn: "",
    antecedentes: "",
    endereco: "",
    local: "",
    equipe: "",
    veiculoPlaca: "",
    veiculoCor: "",
    veiculoModelo: "",
    tornozeleiraNumero: "",
    inserirApelido: false,
    naoAplicaApelido: true,
    tornozeleiraCheck: false,
    naoAplicaTornozeleira: true,
    veiculoCheck: false,
    naoAplicaVeiculo: true,
  });

  const [ocrRawText, setOcrRawText] = useState("");
  const [currentFile, setCurrentFile] = useState(null);
  const [abordadoFile, setAbordadoFile] = useState(null);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetField = useCallback((field) => {
    setFormData((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = [
      "abordado",
      "genitora",
      "cpf",
      "dn",
      "antecedentes",
      "endereco",
      "local",
      "equipe",
    ];
    return requiredFields.every((field) => formData[field]?.trim() !== "");
  }, [formData]);

  const isFormValid = useCallback(() => {
    return validateForm();
  }, [validateForm]);

  return {
    formData,
    updateField,
    resetField,
    validateForm,
    isFormValid,
    ocrRawText,
    setOcrRawText,
    currentFile,
    setCurrentFile,
    abordadoFile,
    setAbordadoFile,
  };
};
