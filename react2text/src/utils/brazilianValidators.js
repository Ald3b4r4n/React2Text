/**
 * Validadores para documentos e dados brasileiros
 * Inclui validação de CPF, CNPJ, Placa, Renavam, etc.
 */

/**
 * Valida CPF brasileiro com cálculo de dígitos verificadores
 * @param {string} cpf - CPF no formato xxx.xxx.xxx-xx ou xxxxxxxxxxx
 * @returns {boolean} true se o CPF é válido
 */
export function validateCPF(cpf) {
  if (!cpf) return false;
  
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  // Verifica se os dígitos conferem
  return (
    parseInt(cleanCPF.charAt(9)) === digit1 &&
    parseInt(cleanCPF.charAt(10)) === digit2
  );
}

/**
 * Valida CNPJ brasileiro
 * @param {string} cnpj - CNPJ no formato xx.xxx.xxx/xxxx-xx
 * @returns {boolean} true se o CNPJ é válido
 */
export function validateCNPJ(cnpj) {
  if (!cnpj) return false;
  
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  
  if (cleanCNPJ.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Calcula primeiro dígito
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  const digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  // Calcula segundo dígito
  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === parseInt(digits.charAt(1));
}

/**
 * Valida placa de veículo (formato antigo e Mercosul)
 * @param {string} placa - Placa no formato ABC1234 ou ABC1D23
 * @returns {boolean} true se a placa é válida
 */
export function validatePlaca(placa) {
  if (!placa) return false;
  
  const cleanPlaca = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Formato antigo: ABC1234 (3 letras + 4 números)
  const formatoAntigo = /^[A-Z]{3}[0-9]{4}$/;
  
  // Formato Mercosul: ABC1D23 (3 letras + 1 número + 1 letra + 2 números)
  const formatoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  return formatoAntigo.test(cleanPlaca) || formatoMercosul.test(cleanPlaca);
}

/**
 * Valida código RENAVAM
 * @param {string} renavam - Código RENAVAM (11 dígitos)
 * @returns {boolean} true se o RENAVAM é válido
 */
export function validateRenavam(renavam) {
  if (!renavam) return false;
  
  const cleanRenavam = renavam.replace(/\D/g, '');
  
  // RENAVAM deve ter 11 dígitos
  if (cleanRenavam.length !== 11) return false;
  
  // Todos os dígitos iguais são inválidos
  if (/^(\d)\1{10}$/.test(cleanRenavam)) return false;
  
  // Validação do dígito verificador (algoritmo simplificado)
  const sequencia = '3298765432';
  let soma = 0;
  
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanRenavam.charAt(i)) * parseInt(sequencia.charAt(i));
  }
  
  const digito = soma % 11;
  const digitoVerificador = digito === 0 || digito === 1 ? 0 : 11 - digito;
  
  return parseInt(cleanRenavam.charAt(10)) === digitoVerificador;
}

/**
 * Valida data brasileira
 * @param {string} data - Data no formato DD/MM/YYYY
 * @returns {boolean} true se a data é válida
 */
export function validateData(data) {
  if (!data) return false;
  
  const match = data.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  
  const dia = parseInt(match[1]);
  const mes = parseInt(match[2]);
  const ano = parseInt(match[3]);
  
  // Verifica ranges básicos
  if (mes < 1 || mes > 12) return false;
  if (dia < 1 || dia > 31) return false;
  if (ano < 1900 || ano > 2100) return false;
  
  // Verifica dias por mês
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Verifica ano bissexto
  if ((ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0) {
    diasPorMes[1] = 29;
  }
  
  return dia <= diasPorMes[mes - 1];
}

/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP no formato xxxxx-xxx
 * @returns {boolean} true se o CEP é válido
 */
export function validateCEP(cep) {
  if (!cep) return false;
  
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
}

/**
 * Valida telefone brasileiro
 * @param {string} telefone - Telefone no formato (xx) xxxxx-xxxx ou (xx) xxxx-xxxx
 * @returns {boolean} true se o telefone é válido
 */
export function validateTelefone(telefone) {
  if (!telefone) return false;
  
  const cleanTel = telefone.replace(/\D/g, '');
  
  // Formato: (xx) xxxxx-xxxx (celular) ou (xx) xxxx-xxxx (fixo)
  return cleanTel.length === 10 || cleanTel.length === 11;
}

/**
 * Formata CPF
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf) {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata placa
 * @param {string} placa - Placa sem formatação
 * @returns {string} Placa formatada (ABC-1234 ou ABC-1D23)
 */
export function formatPlaca(placa) {
  const clean = placa.replace(/[^A-Z0-9]/g, '').toUpperCase();
  if (clean.length === 7) {
    return clean.replace(/([A-Z]{3})([0-9A-Z]{4})/, '$1-$2');
  }
  return placa;
}

/**
 * Limpa e valida valor extraído
 * @param {string} value - Valor a ser validado
 * @param {string} type - Tipo do dado (cpf, placa, renavam, data, etc.)
 * @returns {object} { isValid: boolean, cleaned: string, formatted: string }
 */
export function validateAndClean(value, type) {
  if (!value) return { isValid: false, cleaned: '', formatted: '' };
  
  const validators = {
    cpf: { validate: validateCPF, format: formatCPF },
    placa: { validate: validatePlaca, format: formatPlaca },
    renavam: { validate: validateRenavam, format: (v) => v },
    data: { validate: validateData, format: (v) => v },
    cep: { validate: validateCEP, format: (v) => v },
    telefone: { validate: validateTelefone, format: (v) => v }
  };
  
  const validator = validators[type];
  if (!validator) {
    return { isValid: false, cleaned: value, formatted: value };
  }
  
  const cleaned = value.replace(/\s+/g, ' ').trim();
  const isValid = validator.validate(cleaned);
  const formatted = isValid ? validator.format(cleaned) : cleaned;
  
  return { isValid, cleaned, formatted };
}
