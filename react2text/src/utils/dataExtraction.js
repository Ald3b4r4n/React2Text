// src/utils/dataExtraction.js

const cleanText = (text) => {
  return text
    .replace(/O/g, "0") // Common OCR error for numbers, handle carefully
    .replace(/l/g, "1")
    .replace(/[^\w\s\-\/\.]/g, ""); // Remove special chars except common separators
};

export const extractAndFillFields = (text, updateField) => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const upperLines = lines.map((line) => line.toUpperCase());

  // --- Helper Functions ---
  const findNextLine = (keywords, stopWords = []) => {
    for (let i = 0; i < upperLines.length; i++) {
      if (keywords.some((kw) => upperLines[i].includes(kw))) {
        // Look ahead for a valid value
        // Increased lookahead to 8 to handle cases with many headers between NOME and the actual name
        for (let j = 1; j <= 8; j++) { 
            if (i + j >= upperLines.length) break;
            const candidate = upperLines[i + j];
             // Basic validation: not a keyword, not too short
             const isKeyword = keywords.some(kw => candidate.includes(kw));
             const isStopWord = stopWords.some(sw => candidate.includes(sw));
             
             if (
                candidate.length > 2 &&
                !isKeyword &&
                !isStopWord
             ) {
                 return candidate;
             }
        }
      }
    }
    return null;
  };

  // --- Name (Abordado) ---
  // Strategy: Look for "NOME" but avoid document headers.
  const nameStopWords = [
      "REPÚBLICA", "ESTADO", "SECRETARIA", "CARTEIRA", "VALIDADE", "FILIAÇÃO", 
      "DATA", "CPF", "DOC.", "POLICIA", "INSTITUTO", "DEPARTAMENTO", "MINISTÉRIO",
      "NACIONAL", "FEDERAL", "IDENTIDADE", "HABILITAÇÃO", "REGISTRO", "MÃE", "PAI", "RG",
      "SEGURANÇA", "CIVIL", "PÚBLICA", "DETRAN", "SESP", "SSP"
  ];
  let nome = findNextLine(["NOME", "NAME"], nameStopWords);
  
  if (nome) updateField("abordado", nome);


  // --- CPF ---
  const cpfRegex = /\b\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2}\b/;
  const cpfMatch = text.match(cpfRegex);
  if (cpfMatch) updateField("cpf", cpfMatch[0]);


  // --- Date of Birth (Data de Nasc) ---
  const dnRegex = /\b\d{2}\/\d{2}\/\d{4}\b/;
  let dn = null;
  for(let i=0; i<upperLines.length; i++) {
      if(upperLines[i].includes("NASCIMENTO")) {
          const context = [upperLines[i], upperLines[i+1] || ""].join(" ");
          const match = context.match(dnRegex);
          if(match) {
              dn = match[0];
              break;
          }
      }
  }
  if (!dn) {
      const match = text.match(dnRegex);
      if (match) dn = match[0];
  }
  if (dn) updateField("dn", dn);


  // --- Mother's Name (Genitora) ---
  // Strategy: Look for "FILIAÇÃO". Collect lines that look like names.
  // Usually Father is first, Mother is second.
  let genitora = null;
  for (let i = 0; i < upperLines.length; i++) {
      if (upperLines[i].includes("FILIAÇÃO") || upperLines[i].includes("MÃE") || upperLines[i].includes("GENITORA")) {
          let names = [];
          // Look ahead up to 8 lines to skip noise (dates, numbers)
          for (let j = 1; j <= 8; j++) {
              if (i + j >= upperLines.length) break;
              const line = upperLines[i + j];
              
              // Skip lines that are clearly not names
              if (
                  line.length < 3 ||
                  /\d/.test(line) || // Contains numbers
                  line.includes("DATA") ||
                  line.includes("REGISTRO") ||
                  line.includes("LOCAL") ||
                  line.includes("ASSINATURA") ||
                  line.includes("PORTADOR") ||
                  line.includes("OBSERVAÇÃO") ||
                  line.includes("CAT. HAB") ||
                  line.includes("VALIDADE")
              ) {
                  continue;
              }
              
              names.push(line);
          }
          
          if (names.length > 0) {
              // If we found names, usually the last one is the mother.
              // If multiple names, the first one is likely the Father.
              // We join the rest to handle split mother names.
              if (names.length > 1) {
                  genitora = names.slice(1).join(" ");
              } else {
                  genitora = names[0];
              }
              
              // Cleanup candidate
              if (genitora) genitora = genitora.replace(/[\.\,\-]*$/, ""); 
          }
          break;
      }
  }
  if (genitora) updateField("genitora", genitora);


  // --- Place of Birth (Naturalidade) ---
  let naturalidade = findNextLine(["NATURALIDADE", "NATURAL"], ["DATA", "CPF", "FILIAÇÃO"]);
  if (!naturalidade) {
      // Allow hyphens and slashes in the capture group
      const natMatch = text.match(/(?:NATURALIDADE|NATURAL|NAT\.)\s*[:\-]?\s*([A-ZÀ-Ü\s\-\/]+)/i);
      if (natMatch && natMatch[1]) {
          naturalidade = natMatch[1].trim();
      } else {
          // Fallback: Look for "CITY - UF" pattern (e.g. BRASILIA - DF)
          // Must be at start of line or distinct
          const cityUfMatch = text.match(/^\s*([A-ZÀ-Ü\s]+)\s-\s([A-Z]{2})\b/m);
          if (cityUfMatch) {
              naturalidade = `${cityUfMatch[1].trim()} - ${cityUfMatch[2]}`;
          }
      }
  }
  if (naturalidade) updateField("naturalidade", naturalidade);


  // --- Vehicle Data ---
  const placaRegex = /\b[A-Z]{3}[0-9][0-9A-Z][0-9]{2}\b|\b[A-Z]{3}-?\d{4}\b/;
  const placaMatch = text.toUpperCase().match(placaRegex);
  if (placaMatch) updateField("placa", placaMatch[0]);

  const corMatch = text.match(/COR\s*[:\.]?\s*([A-ZÀ-Ü]+)/i);
  if (corMatch && corMatch[1]) {
      updateField("cor", corMatch[1].trim());
  } else {
      const colors = ["BRANCA", "PRETA", "PRATA", "CINZA", "VERMELHA", "AZUL", "VERDE", "AMARELA"];
      const foundColor = colors.find(c => text.toUpperCase().includes(c));
      if (foundColor) updateField("cor", foundColor);
  }

  const modeloMatch = text.match(/(?:MARCA\/MODELO|MARCA|MODELO)\s*[:\.]?\s*([A-Z0-9\/\s\.\-]+)/i);
  if (modeloMatch && modeloMatch[1]) {
       updateField("modelo", modeloMatch[1].trim());
  }
};
