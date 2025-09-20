// src/utils/dataExtraction.js
export const extractAndFillFields = (text, updateField) => {
  // Implementação da lógica de extração de dados do texto OCR
  // Esta é uma versão simplificada - a implementação completa seria mais complexa

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const upperLines = lines.map((line) => line.toUpperCase());

  // Extrair nome
  let nome = "";
  for (let i = 0; i < upperLines.length; i++) {
    if (
      (upperLines[i].includes("NOME") || upperLines[i].includes("NAME")) &&
      !nome
    ) {
      const candidate = upperLines[i + 1];
      if (
        candidate &&
        candidate.split(" ").length >= 2 &&
        !candidate.includes("HABILITAÇÃO") &&
        !/\d/.test(candidate)
      ) {
        nome = candidate;
        break;
      }
    }
  }
  if (nome) updateField("abordado", nome);

  // Extrair CPF
  const cpfMatch = text.match(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/);
  if (cpfMatch) updateField("cpf", cpfMatch[0]);

  // Extrair Data de Nascimento
  const dnMatch = text.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
  if (dnMatch) updateField("dn", dnMatch[0]);

  // Extrair Naturalidade
  const naturalidadeMatch = text.match(
    /(?:NATURALIDADE|NATURAL|NAT\.)\s*[:\-]?\s*([A-ZÀ-Ü\s]+)/i
  );
  if (naturalidadeMatch && naturalidadeMatch[1]) {
    updateField("naturalidade", naturalidadeMatch[1].trim());
  }

  // Extrair Nome da Mãe
  const maeMatch = text.match(
    /(?:FILIAÇÃO|MAE|MÃE|GENITORA)\s*[:\-]?\s*([A-ZÀ-Ü\s]+)/i
  );
  if (maeMatch && maeMatch[1]) {
    updateField("genitora", maeMatch[1].trim());
  }
};
