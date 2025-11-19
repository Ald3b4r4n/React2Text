// src/utils/dataExtraction.js

/**
 * Converte texto plano para o formato JSON do OCR.space
 * Permite usar a mesma lógica de extração para texto colado
 */
function convertTextToOcrJson(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  const textOverlayLines = lines.map((lineText, index) => {
    const words = lineText.trim().split(/\s+/).map((wordText, wordIndex) => ({
      WordText: wordText,
      Left: wordIndex * 50, // Posição simulada
      Top: index * 20,      // Posição simulada (espaçamento vertical)
      Height: 20,
      Width: wordText.length * 10
    }));
    
    return {
      LineText: lineText.trim(),
      Words: words,
      MaxHeight: 20,
      MinTop: index * 20
    };
  });
  
  return {
    ParsedResults: [{
      TextOverlay: {
        Lines: textOverlayLines,
        HasOverlay: true
      },
      TextOrientation: "0",
      FileParseExitCode: 1,
      ParsedText: text,
      ErrorMessage: "",
      ErrorDetails: ""
    }],
    OCRExitCode: 1,
    IsErroredOnProcessing: false,
    ProcessingTimeInMilliseconds: "0"
  };
}

/**
 * Main extraction function - accepts either JSON object or plain text
 */
export const extractAndFillFields = (input, updateField) => {
  if (!input) return;

  // Detect input type
  const isJsonInput = typeof input === 'object' && input.ParsedResults;
  
  if (isJsonInput) {
    extractFromJson(input, updateField);
  } else {
    // Converter texto para formato JSON e usar extração JSON
    console.log('📝 Texto colado detectado - convertendo para formato JSON');
    const syntheticJson = convertTextToOcrJson(input);
    extractFromJson(syntheticJson, updateField);
  }
};

/**
 * JSON-based extraction using TextOverlay and coordinates
 */
function extractFromJson(ocrResult, updateField) {
  const parsedResult = ocrResult.ParsedResults?.[0];
  if (!parsedResult) return;

  const lines = parsedResult.TextOverlay?.Lines || [];
  const plainText = parsedResult.ParsedText || "";
  
  // If no TextOverlay, fallback to text extraction
  if (lines.length === 0) {
    extractFromText(plainText, updateField);
    return;
  }

  console.log(`🔍 Extração baseada em JSON - ${lines.length} linhas detectadas`);

  // Helper functions for spatial navigation
  const findLineByKeyword = (keywords) => {
    const keywordsArray = Array.isArray(keywords) ? keywords : [keywords];
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i].LineText.toUpperCase().replace(/[-\s]/g, "");
      if (keywordsArray.some(kw => lineText.includes(kw.toUpperCase().replace(/[-\s]/g, "")))) {
        return { line: lines[i], index: i };
      }
    }
    return null;
  };

  const getNextLines = (fromIndex, count = 5) => {
    return lines.slice(fromIndex + 1, fromIndex + 1 + count);
  };

  const isValidNameLine = (lineText) => {
    const text = lineText.trim().toUpperCase();
    
    // Must be all caps letters and spaces
    if (!/^[A-ZÀ-Ü\s]+$/.test(text)) return false;
    
    // Must have at least 2 words
    if (text.split(/\s+/).filter(Boolean).length < 2) return false;
    
    // Must be at least 6 characters
    if (text.length < 6) return false;
    
    // Reject common document headers/keywords
    const rejectPatterns = [
      /REPÚBLICA|FEDERATIVA|BRASIL/,
      /MINISTÉRIO|INFRAESTRUTURA|DEPARTAMENTO/,
      /SECRETARIA|NACIONAL|TRANSITO/,
      /CARTEIRA|HABILITAÇÃO|HABILITACAO/,
      /DETRAN|POLICIA|SSP|SESP/,
      /REGISTRO|DOCUMENTO|IDENTIDADE/,
      /VALIDADE|EMISSÃO|EMISSAO/,
      /NASCIMENTO|FILIAÇÃO|FILIACAO/,
      /PERMISSÃO|PERMISSAO|CATEGORIA/,
      /CERTIFICADO|LICENCIAMENTO|VEÍCULO|VEICULO/,
      /CODIGO|RENAVAM|PLACA|EXERCICIO/,
      /FABRICAÇÃO|FABRICACAO|MODELO/,
      /NUMERO|CRV/
    ];
    
    return !rejectPatterns.some(pattern => pattern.test(text));
  };

  // Extract NOME (Abordado)
  let nome = "";
  const nomeResult = findLineByKeyword(["NOME", "NAME"]);
  
  if (nomeResult) {
    const nextLines = getNextLines(nomeResult.index, 3);
    for (const line of nextLines) {
      if (isValidNameLine(line.LineText)) {
        nome = line.LineText.trim();
        break;
      }
    }
  }
  
  // Fallback: se não achou com keyword, tenta pegar a primeira linha válida de nome
  if (!nome) {
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      if (isValidNameLine(lines[i].LineText)) {
        nome = lines[i].LineText.trim();
        console.log(`📌 Nome encontrado sem keyword na linha ${i}: ${nome}`);
        break;
      }
    }
  }

  // Extract NATURALIDADE
  let naturalidade = "";
  
  // 1. Procurar por keyword explícita
  const natResult = findLineByKeyword(["NATURALIDADE", "NATURAL DE", "LOCAL DE NASCIMENTO"]);
  if (natResult) {
    const nextLines = getNextLines(natResult.index, 2);
    for (const line of nextLines) {
      const text = line.LineText.trim();
      if (text.length > 2 && !/\d{2}\/\d{2}\/\d{4}/.test(text)) {
        naturalidade = text;
        break;
      }
    }
  }
  
  // 2. Procurar padrão "DATA, LOCAL E UF DE NASCIMENTO" seguido de linha com data e cidade
  if (!naturalidade) {
    const dataLocalResult = findLineByKeyword(["DATA, LOCAL E UF"]);
    if (dataLocalResult) {
      const nextLines = getNextLines(dataLocalResult.index, 2);
      for (const line of nextLines) {
        // Procurar padrão: DD/MM/YYYY CIDADE/UF ou DD/MM/YYYY, CIDADE, UF
        const match = line.LineText.match(/\d{2}\/\d{2}\/\d{4}\s+([A-ZÀ-Ú]+)[\/-]([A-Z]{2})/i);
        if (match) {
          naturalidade = `${match[1]}/${match[2]}`.toUpperCase();
          console.log(`📍 Naturalidade extraída da linha de data: ${naturalidade}`);
          break;
        }
      }
    }
  }
  
  
  // 3. Fallback: buscar padrão "CIDADE/UF" ou "CIDADE - UF" no texto inteiro
  if (!naturalidade) {
    const matches = plainText.matchAll(/\b([A-ZÀ-Ú\s]+)[\/-]\s*([A-Z]{2})\b/g);
    
    const forbiddenKeywords = [
      "SENATRAN", "DETRAN", "DENATRAN", "DEPARTAMENTO", "SECRETARIA",
      "MINISTERIO", "MINISTÉRIO", "INFRAESTRUTURA", "TRANSPORTES",
      "TRANSITO", "TRÂNSITO", "NACIONAL", "FEDERAL", "ESTADUAL",
      "REPUBLICA", "REPÚBLICA", "CARTEIRA", "HABILITAÇÃO", "HABILITACAO"
    ];
    
    for (const match of matches) {
      const cityPart = match[1].trim();
      const ufPart = match[2];
      
      // Verificar se não contém palavras proibidas
      const hasForbiddenWord = forbiddenKeywords.some(kw => cityPart.toUpperCase().includes(kw));
      
      if (!hasForbiddenWord && cityPart.length > 2 && cityPart.length < 30) {
        naturalidade = `${cityPart}/${ufPart}`.toUpperCase();
        console.log(`🔍 Naturalidade encontrada por regex geral: ${naturalidade}`);
        break;
      }
    }
  }

  // Extract GENITORA/MÃE
  let genitora = "";
  const filiacaoResult = findLineByKeyword(["FILIAÇÃO", "FILIACAO", "GENITORA", "MÃE", "MAE"]);
  if (filiacaoResult) {
    const nextLines = getNextLines(filiacaoResult.index, 12);
    const validLines = [];
    
    for (const line of nextLines) {
      const text = line.LineText.trim();
      
      // Stop on certain keywords
      if (/PERMISSÃO|PERMISSAO|REGISTRO|VALIDADE|CATEGORIA|RENAVAM|ASSINATURA|OBSERVAÇÃO|LOCAL|CPF|ACC/i.test(text)) {
        break;
      }
      
      // Collect valid name lines (all caps, letters only)
      if (text.length > 2 && /^[A-ZÀ-Ü\s]+$/.test(text)) {
        validLines.push(text);
      }
    }
    
    console.log(`👨‍👩‍👧 Linhas válidas após FILIAÇÃO:`, validLines);
    
    if (validLines.length === 0) {
      // Nenhuma linha encontrada
      genitora = "";
    } else if (validLines.length === 1) {
      // Apenas uma linha - assumir que é a mãe
      genitora = validLines[0];
    } else if (validLines.length === 2) {
      // Duas linhas - primeira é pai, segunda é mãe
      genitora = validLines[1];
    } else {
      // 3+ linhas - lógica mais complexa
      // Detectar onde o nome do pai termina e o da mãe começa
      // Estratégia: o nome do pai vai até encontrarmos uma linha com 2+ palavras novamente
      let motherStartIndex = -1;
      
      // Se primeira linha tem 2+ palavras, é o início do pai
      const firstLineWords = validLines[0].split(/\s+/).length;
      if (firstLineWords >= 2) {
        // Procurar próxima linha com 2+ palavras (início da mãe)
        for (let i = 1; i < validLines.length; i++) {
          const words = validLines[i].split(/\s+/).length;
          if (words >= 2) {
            motherStartIndex = i;
            break;
          }
        }
      }
      
      if (motherStartIndex === -1) {
        // Não encontrou padrão claro - assumir que segunda metade é mãe
        const midPoint = Math.floor(validLines.length / 2);
        genitora = validLines.slice(midPoint).join(" ").trim();
        console.log(`⚠️ Padrão ambíguo - usando segunda metade das linhas para mãe: ${genitora}`);
      } else {
        // Juntar todas as linhas a partir do índice da mãe
        genitora = validLines.slice(motherStartIndex).join(" ").trim();
        console.log(`✅ Nome da mãe detectado a partir da linha ${motherStartIndex}: ${genitora}`);
      }
    }
  }

  // Extract CPF
  let cpf = "";
  const cpfResult = findLineByKeyword(["CPF", "TAX ID"]);
  if (cpfResult) {
    const nextLines = getNextLines(cpfResult.index, 2);
    for (const line of nextLines) {
      const digits = line.LineText.replace(/\D/g, "");
      if (digits.length === 11) {
        cpf = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
        break;
      }
    }
  }
  
  // Fallback: search in entire text
  if (!cpf) {
    const cpfMatch = plainText.match(/\b\d{3}[\.\s]?\d{3}[\.\s]?\d{3}[-\s]?\d{2}\b/);
    if (cpfMatch) {
      const digits = cpfMatch[0].replace(/\D/g, "");
      if (digits.length === 11) {
        cpf = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
      }
    }
  }

  // Extract DATA DE NASCIMENTO
  let dn = "";
  const nascResult = findLineByKeyword(["NASC", "NASCIMENTO", "DATA NASCIMENTO"]);
  if (nascResult) {
    const nextLines = getNextLines(nascResult.index, 3);
    for (const line of nextLines) {
      const dateMatch = line.LineText.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
      if (dateMatch) {
        dn = dateMatch[0];
        break;
      }
    }
  }

  // Fallback: search in entire text
  if (!dn) {
    const dateMatch = plainText.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
    if (dateMatch) dn = dateMatch[0];
  }

  // Extract PLACA
  let placa = "";
  const placaResult = findLineByKeyword(["PLACA"]);
  if (placaResult) {
    const nextLines = getNextLines(placaResult.index, 2);
    for (const line of nextLines) {
      const text = line.LineText.replace(/\s+/g, "");
      const placaMatch = text.match(/\b[A-Z]{3}\d{4}\b|\b[A-Z]{3}\d[A-Z]\d{2}\b/);
      if (placaMatch) {
        placa = placaMatch[0];
        break;
      }
    }
  }
  
  // Fallback: search in all lines
  if (!placa) {
    for (const line of lines) {
      const text = line.LineText.replace(/\s+/g, "");
      const placaMatch = text.match(/\b[A-Z]{3}\d{4}\b|\b[A-Z]{3}\d[A-Z]\d{2}\b/);
      if (placaMatch) {
        placa = placaMatch[0];
        break;
      }
    }
  }

  // Apply default values
  if (!nome) nome = "Vá em Corrigir";
  if (!naturalidade) naturalidade = "Corrija ou Digite";
  if (!genitora) genitora = "Vá em Corrigir";
  if (!cpf) cpf = "Vá em Corrigir";
  if (!dn) dn = "Vá em Corrigir";
  if (!placa) placa = "Vá em Corrigir";

  // Update form fields
  updateField("abordado", nome);
  updateField("naturalidade", naturalidade);
  updateField("genitora", genitora);
  updateField("cpf", cpf);
  updateField("dn", dn);
  updateField("veiculoPlaca", placa);

  // Handle vehicle checkbox
  if (placa && placa !== "Vá em Corrigir" && placa.trim() !== "") {
    updateField("veiculoCheck", true);
    updateField("naoAplicaVeiculo", false);
  } else {
    updateField("veiculoCheck", false);
    updateField("naoAplicaVeiculo", true);
  }
  
  console.log("✅ Extração JSON concluída:", { nome, naturalidade, genitora, cpf, dn, placa });
}

/**
 * Text-based extraction (fallback for pasted text)
 */
function extractFromText(text, updateField) {
  console.log("📝 Extração baseada em texto (fallback)");
  
  const toLines = (t) =>
    t
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

  const normalizeSpaces = (s) => s.replace(/\s+/g, " ").trim();
  const UPPER = (s) => s.toUpperCase();
  const isAllCaps = (s) => /^[A-ZÀ-Ü\s./-]+$/.test(s);

  const stopWordsMae = [
    "PERMISSÃO", "ACC", "REGISTRO", "VALIDADE", "CATEGORIA", "RENAVAM", "PLACA",
    "HABILITAÇÃO", "NACIONAL", "EXERCÍCIO", "ASSINATURA", "DETRAN", "MARCA",
    "MODELO", "VERSÃO", "CHASSI", "COMBUSTÍVEL", "COR", "CÓDIGO", "ESPÉCIE", "TIPO", "LOCAL"
  ];

  const rawLines = toLines(text);
  const linhas = rawLines.map((l) => UPPER(l));

  let nome = "", mae = "", cpf = "", dn = "", placa = "";
  let naturalidade = "";

  // Extract logic (same as before)
  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    if ((linha.includes("NOME") || linha.includes("NAME")) && !nome) {
      const candidato1 = linhas[i + 1];
      const candidato2 = linhas[i + 2];
      for (const candidato of [candidato1, candidato2]) {
        if (candidato && candidato.split(" ").length >= 2 && !candidato.includes("HABILITAÇÃO") && !/\d/.test(candidato)) {
          nome = normalizeSpaces(candidato);
          break;
        }
      }
    }

    if (!naturalidade) {
      if (linha.includes("NATURALIDADE") || linha.includes("NATURAL DE") || linha.includes("LOCAL DE NASCIMENTO")) {
        const prox = linhas[i + 1];
        if (prox && prox.length > 2 && !/\d/.test(prox)) {
          naturalidade = normalizeSpaces(prox);
        }
      }
    }

    if (/FILIAÇÃO|GENITORA|MAE|MÃE/.test(linha) && !mae) {
      const possibleNames = [];
      let j = i + 1;
      let maxLines = 10;

      while (j < linhas.length && maxLines > 0) {
        const currentLine = linhas[j].trim();
        if (currentLine.length <= 2 || /\d{2,}/.test(currentLine) || stopWordsMae.some((w) => currentLine.includes(w))) break;
        if (isAllCaps(currentLine) && currentLine.length > 3 && currentLine.split(/\s+/).length >= 2) {
          possibleNames.push(normalizeSpaces(currentLine));
        }
        j++;
        maxLines--;
      }

      if (possibleNames.length >= 2) {
        mae = possibleNames[1];
        if (possibleNames.length > 2) {
          const paiParts = possibleNames[0].split(/\s+/);
          const potencialMaeParts = possibleNames[2].split(/\s+/);
          if (paiParts[0] !== potencialMaeParts[0]) {
            mae = normalizeSpaces(possibleNames[1] + " " + possibleNames[2]);
          }
        }
      }
    }

    if (!cpf && (linha.includes("CPF") || linha.includes("TAX ID"))) {
      const candidato = linhas[i + 1]?.replace(/\D/g, "");
      if (candidato?.length === 11) {
        cpf = `${candidato.slice(0, 3)}.${candidato.slice(3, 6)}.${candidato.slice(6, 9)}-${candidato.slice(9)}`;
      }
    }

    if (!dn && linha.includes("NASC")) {
      const janela = linhas.slice(i, i + 4).join(" ");
      const match = janela.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
      if (match) dn = match[0];
    }

    if (!placa) {
      const m = linha.replace(/\s+/g, "").match(/\b[A-Z]{3}\d{4}\b|\b[A-Z]{3}\d[A-Z]\d{2}\b/);
      if (m) placa = m[0];
    }
  }

  if (!nome) nome = "Vá em Corrigir";
  if (!naturalidade) naturalidade = "Corrija ou Digite";
  if (!mae) mae = "Vá em Corrigir";
  if (!cpf) cpf = "Vá em Corrigir";
  if (!dn) dn = "Vá em Corrigir";
  if (!placa) placa = "Vá em Corrigir";

  updateField("abordado", nome);
  updateField("naturalidade", naturalidade);
  updateField("genitora", mae);
  updateField("cpf", cpf);
  updateField("dn", dn);
  updateField("veiculoPlaca", placa);

  if (placa && placa !== "Vá em Corrigir" && placa.trim() !== "") {
    updateField("veiculoCheck", true);
    updateField("naoAplicaVeiculo", false);
  } else {
    updateField("veiculoCheck", false);
    updateField("naoAplicaVeiculo", true);
  }
}
