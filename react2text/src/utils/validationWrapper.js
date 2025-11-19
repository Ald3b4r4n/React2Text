/**
 * Camada de validação e aprimoramento pós-extração
 * Funciona como wrapper sobre dataExtraction.js existente
 */

import {
  validateCPF,
  validatePlaca,
  validateRenavam,
  validateData,
  formatCPF,
  formatPlaca
} from './brazilianValidators.js';

import {
  extractUniversalPatterns,
  detectDocumentType
} from './advancedExtraction.js';

/**
 * Wrapper que adiciona validação após extração
 * Usa sistema atual + validação extra
 * @param {function} originalExtractFn - Função original de extração
 * @returns {function} Função com validação integrada
 */
export function withValidation(originalExtractFn) {
  return (input, updateField) => {
    // Criar wrapper para capturar valores extraídos
    const extractedData = {};
    const wrappedUpdateField = (field, value) => {
      extractedData[field] = value;
      updateField(field, value);
    };
    
    // Executar extração original
    originalExtractFn(input, wrappedUpdateField);
    
    // Aplicar validação e melhorias
    const isJsonInput = typeof input === 'object' && input.ParsedResults;
    if (isJsonInput) {
      enhanceExtractedData(input, extractedData, updateField);
    }
  };
}

/**
 * Melhora dados extraídos com validação e padrões universais
 */
function enhanceExtractedData(ocrResult, extractedData, updateField) {
  console.log('🔬 Aplicando validação avançada...');
  
  // Detectar tipo de documento
  const lines = ocrResult.ParsedResults?.[0]?.TextOverlay?.Lines || [];
  if (lines.length > 0) {
    const docType = detectDocumentType(lines);
    console.log(`📄 Documento: ${docType.type} (${(docType.confidence * 100).toFixed(0)}%)`);
  }
  
  // Extrair usando padrões universais como backup
  const universalData = extractUniversalPatterns(ocrResult);
  
  // Validar e melhorar CPF
  if (extractedData.cpf) {
    const cpfValidation = validateCPF(extractedData.cpf);
    if (!cpfValidation) {
      console.log(`⚠️ CPF extraído falhou na validação: ${extractedData.cpf}`);
      // Tentar usar padrão universal se disponível
      if (universalData.cpf && validateCPF(universalData.cpf.value)) {
        console.log(`✅ Usando CPF do padrão universal: ${universalData.cpf.value}`);
        updateField('cpf', formatCPF(universalData.cpf.value));
      }
    } else {
      console.log(`✅ CPF validado: ${extractedData.cpf}`);
      // Formatar se não estiver formatado
      if (!extractedData.cpf.includes('.')) {
        updateField('cpf', formatCPF(extractedData.cpf));
      }
    }
  } else if (universalData.cpf) {
    // CPF não foi extraído, mas padrão universal encontrou
    console.log(`📌 CPF encontrado por padrão universal: ${universalData.cpf.value}`);
    updateField('cpf', formatCPF(universalData.cpf.value));
  }
  
  // Validar e melhorar PLACA
  if (extractedData.placa) {
    const placaValidation = validatePlaca(extractedData.placa);
    if (!placaValidation) {
      console.log(`⚠️ Placa extraída falhou na validação: ${extractedData.placa}`);
      if (universalData.placa && validatePlaca(universalData.placa.value)) {
        console.log(`✅ Usando placa do padrão universal: ${universalData.placa.value}`);
        updateField('placa', formatPlaca(universalData.placa.value));
      }
    } else {
      console.log(`✅ Placa validada: ${extractedData.placa}`);
      updateField('placa', formatPlaca(extractedData.placa));
    }
  } else if (universalData.placa) {
    console.log(`📌 Placa encontrada por padrão universal: ${universalData.placa.value}`);
    updateField('placa', formatPlaca(universalData.placa.value));
  }
  
  // Validar RENAVAM
  if (extractedData.renavam) {
    const renavamValidation = validateRenavam(extractedData.renavam);
    if (!renavamValidation) {
      console.log(`⚠️ Renavam extraído falhou na validação: ${extractedData.renavam}`);
      if (universalData.renavam && validateRenavam(universalData.renavam.value)) {
        console.log(`✅ Usando Renavam do padrão universal: ${universalData.renavam.value}`);
        updateField('renavam', universalData.renavam.value);
      }
    } else {
      console.log(`✅ Renavam validado: ${extractedData.renavam}`);
    }
  } else if (universalData.renavam) {
    console.log(`📌 Renavam encontrado por padrão universal: ${universalData.renavam.value}`);
    updateField('renavam', universalData.renavam.value);
  }
  
  // Validar DATA DE NASCIMENTO
  if (extractedData.dataNascimento) {
    const dataValidation = validateData(extractedData.dataNascimento);
    if (!dataValidation) {
      console.log(`⚠️ Data de nascimento inválida: ${extractedData.dataNascimento}`);
      if (universalData.data && validateData(universalData.data.value)) {
        console.log(`✅ Usando data do padrão universal: ${universalData.data.value}`);
        updateField('dataNascimento', universalData.data.value);
      }
    } else {
      console.log(`✅ Data de nascimento validada: ${extractedData.dataNascimento}`);
    }
  } else if (universalData.data) {
    console.log(`📌 Data encontrada por padrão universal: ${universalData.data.value}`);
    updateField('dataNascimento', universalData.data.value);
  }
  
  // Log de confiança geral
  const validationResults = {
    cpf: extractedData.cpf ? validateCPF(extractedData.cpf) : false,
    placa: extractedData.placa ? validatePlaca(extractedData.placa) : false,
    renavam: extractedData.renavam ? validateRenavam(extractedData.renavam) : false,
    dataNascimento: extractedData.dataNascimento ? validateData(extractedData.dataNascimento) : false
  };
  
  const validCount = Object.values(validationResults).filter(Boolean).length;
  const totalCount = Object.keys(validationResults).length;
  const confidenceScore = totalCount > 0 ? (validCount / totalCount) * 100 : 0;
  
  console.log(`📊 Confiança geral da extração: ${confidenceScore.toFixed(0)}% (${validCount}/${totalCount} campos validados)`);
}

/**
 * Aplica validação apenas (sem re-extração)
 * Útil para validar dados já extraídos
 */
export function validateExtractedFields(fields) {
  const results = {};
  
  if (fields.cpf) {
    results.cpf = {
      valid: validateCPF(fields.cpf),
      formatted: formatCPF(fields.cpf)
    };
  }
  
  if (fields.placa) {
    results.placa = {
      valid: validatePlaca(fields.placa),
      formatted: formatPlaca(fields.placa)
    };
  }
  
  if (fields.renavam) {
    results.renavam = {
      valid: validateRenavam(fields.renavam),
      value: fields.renavam
    };
  }
  
  if (fields.dataNascimento) {
    results.dataNascimento = {
      valid: validateData(fields.dataNascimento),
      value: fields.dataNascimento
    };
  }
  
  return results;
}
