/**
 * Sistema avançado de extração de dados de OCR
 * Inclui análise de layout, padrões brasileiros, e detecção contextual
 */

import {
  validateCPF,
  validatePlaca,
  validateRenavam,
  validateData,
  validateCNPJ,
  validateCEP
} from './brazilianValidators.js';

/**
 * Extrai dados usando padrões universais brasileiros
 * @param {object} ocrResult - Resultado completo do OCR
 * @returns {object} Dados extraídos com confiança
 */
export function extractUniversalPatterns(ocrResult) {
  const fullText = ocrResult.ParsedResults?.[0]?.ParsedText || '';
  const lines = ocrResult.ParsedResults?.[0]?.TextOverlay?.Lines || [];
  
  const patterns = {
    cpf: { regex: /\d{3}\.\d{3}\.\d{3}-\d{2}/g, validator: validateCPF },
    cpfSimples: { regex: /\b\d{11}\b/g, validator: validateCPF },
    placa: { regex: /\b[A-Z]{3}[0-9][A-Z0-9][0-9]{2}\b/g, validator: validatePlaca },
    renavam: { regex: /\b\d{11}\b/g, validator: validateRenavam },
    data: { regex: /\d{2}\/\d{2}\/\d{4}/g, validator: validateData },
    cnpj: { regex: /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g, validator: validateCNPJ },
    cep: { regex: /\d{5}-\d{3}/g, validator: validateCEP },
    telefone: { regex: /\(\d{2}\)\s?\d{4,5}-\d{4}/g, validator: null }
  };
  
  const extracted = {};
  
  Object.keys(patterns).forEach(key => {
    const pattern = patterns[key];
    const matches = [...fullText.matchAll(pattern.regex)];
    
    const validMatches = matches
      .map(m => m[0])
      .filter(value => !pattern.validator || pattern.validator(value))
      .map(value => ({
        value,
        confidence: pattern.validator ? 0.95 : 0.7,
        validated: !!pattern.validator
      }));
    
    if (validMatches.length > 0) {
      // Se houver múltiplos matches, pega o primeiro válido
      extracted[key] = validMatches[0];
    }
  });
  
  console.log('🔍 Padrões universais extraídos:', extracted);
  return extracted;
}

/**
 * Analisa layout do documento e extrai dados por posicionamento
 * @param {array} lines - Linhas do TextOverlay
 * @returns {object} Dados organizados por região
 */
export function analyzeLayout(lines) {
  if (!lines || lines.length === 0) return {};
  
  // Agrupa linhas por regiões verticais
  const regions = {
    top: [],      // 0-300px
    upper: [],    // 300-600px
    middle: [],   // 600-900px
    lower: [],    // 900-1200px
    bottom: []    // 1200+
  };
  
  lines.forEach(line => {
    const y = line.MinTop;
    if (y < 300) regions.top.push(line);
    else if (y < 600) regions.upper.push(line);
    else if (y < 900) regions.middle.push(line);
    else if (y < 1200) regions.lower.push(line);
    else regions.bottom.push(line);
  });
  
  console.log('📐 Regiões detectadas:', {
    top: regions.top.length,
    upper: regions.upper.length,
    middle: regions.middle.length,
    lower: regions.lower.length,
    bottom: regions.bottom.length
  });
  
  return regions;
}

/**
 * Encontra linha em uma coordenada Y específica (com tolerância)
 * @param {array} lines - Linhas do documento
 * @param {number} targetY - Coordenada Y alvo
 * @param {number} tolerance - Tolerância em pixels
 * @returns {object|null} Linha encontrada
 */
export function findLineNearY(lines, targetY, tolerance = 20) {
  return lines.find(line => 
    Math.abs(line.MinTop - targetY) <= tolerance
  );
}

/**
 * Encontra linhas próximas após uma palavra-chave
 * @param {array} lines - Linhas do documento
 * @param {string} keyword - Palavra-chave a buscar
 * @param {number} maxDistance - Distância máxima em pixels
 * @returns {array} Linhas encontradas
 */
export function findLinesAfterKeyword(lines, keyword, maxDistance = 50) {
  const keywordLine = lines.find(line =>
    line.LineText.toUpperCase().includes(keyword.toUpperCase())
  );
  
  if (!keywordLine) return [];
  
  return lines.filter(line =>
    line.MinTop > keywordLine.MinTop &&
    line.MinTop < keywordLine.MinTop + maxDistance
  );
}

/**
 * Detecta tipo de documento brasileiro
 * @param {array} lines - Linhas do documento
 * @returns {object} Tipo e confiança
 */
export function detectDocumentType(lines) {
  const fullText = lines.map(l => l.LineText).join(' ').toUpperCase();
  const keywords = {
    cnh: ['HABILITAÇÃO', 'DETRAN', 'CARTEIRA NACIONAL', 'CNH'],
    crlv: ['LICENCIAMENTO', 'VEICULO', 'PLACA', 'RENAVAM', 'CRLV'],
    cpf: ['CADASTRO PESSOA FISICA', 'RECEITA FEDERAL', 'CPF'],
    rg: ['IDENTIDADE', 'SECRETARIA SEGURANCA', 'RG'],
    boleto: ['BOLETO', 'BANCO', 'VENCIMENTO', 'VALOR'],
    contrato: ['CONTRATO', 'PARTES', 'CLAUSULA']
  };
  
  const scores = {};
  Object.keys(keywords).forEach(type => {
    const matches = keywords[type].filter(kw => fullText.includes(kw)).length;
    scores[type] = matches / keywords[type].length;
  });
  
  const bestMatch = Object.keys(scores).reduce((a, b) => 
    scores[a] > scores[b] ? a : b
  );
  
  console.log(`📄 Tipo de documento detectado: ${bestMatch} (${(scores[bestMatch] * 100).toFixed(0)}%)`);
  
  return {
    type: bestMatch,
    confidence: scores[bestMatch],
    allScores: scores
  };
}

/**
 * Extrai dados com análise de contexto semântico
 * @param {array} lines - Linhas do documento
 * @param {string} fieldName - Nome do campo a extrair
 * @returns {object|null} Dado extraído com contexto
 */
export function extractWithContext(lines, fieldName) {
  const contextKeywords = {
    nome: ['NOME', 'TITULAR', 'PESSOA'],
    cpf: ['CPF', 'CADASTRO'],
    placa: ['PLACA', 'VEICULO'],
    renavam: ['RENAVAM', 'REGISTRO'],
    data_nascimento: ['DATA NASCIMENTO', 'NASCIMENTO', 'NASC'],
    naturalidade: ['NATURALIDADE', 'NATURAL', 'LOCAL NASCIMENTO'],
    genitora: ['FILIAÇÃO', 'MÃE', 'GENITORA'],
    genitor: ['FILIAÇÃO', 'PAI', 'GENITOR']
  };
  
  const keywords = contextKeywords[fieldName.toLowerCase()] || [];
  
  for (const keyword of keywords) {
    const keywordLine = lines.find(line =>
      line.LineText.toUpperCase().includes(keyword)
    );
    
    if (keywordLine) {
      // Procura próxima linha com dados
      const dataLine = lines.find(line =>
        line.MinTop > keywordLine.MinTop &&
        line.MinTop < keywordLine.MinTop + 50 &&
        line.LineText.trim().length > 2
      );
      
      if (dataLine) {
        return {
          value: dataLine.LineText.trim(),
          context: keyword,
          confidence: 0.85,
          y: dataLine.MinTop
        };
      }
    }
  }
  
  return null;
}

/**
 * Calcula score de confiança para extração
 * @param {string} value - Valor extraído
 * @param {string} type - Tipo do dado
 * @param {boolean} hasKeyword - Se encontrou palavra-chave relacionada
 * @param {boolean} validated - Se passou por validação
 * @returns {number} Score de 0 a 1
 */
export function calculateConfidence(value, type, hasKeyword = false, validated = false) {
  let score = 0.5; // Base
  
  if (validated) score += 0.3;
  if (hasKeyword) score += 0.15;
  if (value && value.length > 2) score += 0.05;
  
  // Ajustes por tipo
  const typeBonus = {
    cpf: validated ? 0.2 : 0,
    placa: validated ? 0.15 : 0,
    renavam: validated ? 0.15 : 0,
    data: validated ? 0.1 : 0
  };
  
  score += typeBonus[type] || 0;
  
  return Math.min(score, 1.0);
}

/**
 * Combina múltiplas extrações e escolhe a melhor
 * @param {array} extractions - Array de extrações com confidence
 * @returns {object|null} Melhor extração
 */
export function chooseBestExtraction(extractions) {
  if (!extractions || extractions.length === 0) return null;
  
  return extractions.reduce((best, current) => 
    (current.confidence || 0) > (best.confidence || 0) ? current : best
  );
}

/**
 * Valida valor extraído contra múltiplos critérios
 * @param {string} value - Valor a validar
 * @param {string} fieldType - Tipo do campo
 * @returns {object} Resultado da validação
 */
export function validateExtractedValue(value, fieldType) {
  const validators = {
    cpf: validateCPF,
    placa: validatePlaca,
    renavam: validateRenavam,
    data: validateData,
    cnpj: validateCNPJ,
    cep: validateCEP
  };
  
  const validator = validators[fieldType];
  
  if (!validator) {
    return {
      isValid: true,
      confidence: 0.6,
      message: 'Sem validador específico'
    };
  }
  
  const isValid = validator(value);
  
  return {
    isValid,
    confidence: isValid ? 0.95 : 0.3,
    message: isValid ? '✓ Válido' : '✗ Inválido'
  };
}
