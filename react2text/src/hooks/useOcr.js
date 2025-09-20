// src/hooks/useOcr.js
import { useState } from "react";

const MAX_FILE_SIZE_KB = 1024;
const MAX_DIMENSION = 1200;
const OCR_API_KEY = "K82112819888957";
const OCR_TIMEOUT = 10000;

export const useOcr = (currentFile, updateField, setOcrRawText) => {
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

      const base64Image = await fileToBase64(processedFile);
      setProcessingProgress(60);

      const text = await callOcrSpaceApi(base64Image);
      setProcessingProgress(90);

      setOcrRawText(text);
      extractAndFillFields(text);
      setProcessingProgress(100);
    } catch (error) {
      console.error("Erro no processamento:", error);
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
      extractAndFillFields(text);
    } catch (error) {
      console.error("Erro no processamento do texto:", error);
      throw error;
    }
  };

  const callOcrSpaceApi = async (base64Image) => {
    const formData = new FormData();
    formData.append("base64Image", `data:image/jpeg;base64,${base64Image}`);
    formData.append("language", "por");
    formData.append("OCREngine", "5");

    let timeoutId;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("OCR demorou muito tempo para responder"));
        }, OCR_TIMEOUT);
      });

      const fetchPromise = fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        headers: { apikey: OCR_API_KEY },
        body: formData,
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Erro de rede: ${response.status}`);

      const data = await response.json();
      if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage[0]);
      if (!data.ParsedResults?.length)
        throw new Error("Nenhum texto reconhecido");

      return data.ParsedResults[0].ParsedText || "";
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      throw error;
    }
  };

  const extractAndFillFields = (text) => {
    if (!text) return;

    const toLines = (t) =>
      t
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const normalizeSpaces = (s) => s.replace(/\s+/g, " ").trim();
    const UPPER = (s) => s.toUpperCase();
    const isAllCaps = (s) => /^[A-ZÀ-Ü\s./-]+$/.test(s);

    const stopWordsMae = [
      "PERMISSÃO",
      "ACC",
      "REGISTRO",
      "VALIDADE",
      "CATEGORIA",
      "RENAVAM",
      "PLACA",
      "HABILITAÇÃO",
      "NACIONAL",
      "EXERCÍCIO",
      "ASSINATURA",
      "DETRAN",
      "MARCA",
      "MODELO",
      "VERSÃO",
      "CHASSI",
      "COMBUSTÍVEL",
      "COR",
      "CÓDIGO",
      "ESPÉCIE",
      "TIPO",
      "LOCAL",
    ];

    const looksLikeName = (s) => {
      if (!s) return false;
      if (!isAllCaps(s)) return false;
      if (/\d/.test(s)) return false;
      const parts = s.split(/\s+/).filter(Boolean);
      if (parts.length < 2) return false;
      if (stopWordsMae.some((w) => s.includes(w))) return false;
      if (s.length < 5) return false;
      return true;
    };

    // Processamento do texto
    const rawLines = toLines(text);
    const linhas = rawLines.map((l) => UPPER(l));

    let nome = "",
      mae = "",
      cpf = "",
      dn = "",
      placa = "";
    let naturalidade = "";

    // Heurística linha a linha
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];

      // NOME
      if ((linha.includes("NOME") || linha.includes("NAME")) && !nome) {
        const candidato1 = linhas[i + 1];
        const candidato2 = linhas[i + 2];

        for (const candidato of [candidato1, candidato2]) {
          if (
            candidato &&
            candidato.split(" ").length >= 2 &&
            !candidato.includes("HABILITAÇÃO") &&
            !/\d/.test(candidato)
          ) {
            nome = normalizeSpaces(candidato);
            break;
          }
        }
      }

      // NATURALIDADE
      if (!naturalidade) {
        if (
          linha.includes("NATURALIDADE") ||
          linha.includes("NATURAL DE") ||
          linha.includes("LOCAL DE NASCIMENTO")
        ) {
          const prox = linhas[i + 1];
          if (prox && prox.length > 2 && !/\d/.test(prox)) {
            naturalidade = normalizeSpaces(prox);
          } else {
            const match = linha.match(
              /(?:NATURALIDADE|LOCAL\s+DE\s+NASCIMENTO)[^\n:]*[:]*\s*([A-ZÀ-Ú\s\/-]+)/i
            );
            if (match && match[1]) naturalidade = normalizeSpaces(match[1]);
          }
        }

        if (
          linha.includes("DATA") &&
          linha.includes("LOCAL") &&
          linha.includes("UF") &&
          linha.includes("NASC")
        ) {
          const prox = linhas[i + 1];
          if (prox) {
            const match = prox.match(
              /(\d{2}\/\d{2}\/\d{4}),\s*([A-ZÀ-Ú\s]+),\s*([A-Z]{2})/i
            );
            if (match && match[2] && match[3]) {
              naturalidade = normalizeSpaces(match[2] + ", " + match[3]);
            }
          }
        }
      }

      // NOME DA MÃE - Lógica melhorada
      const isFiliationLine = (line) => {
        return /[-\s]*([C\s]*)?(FILIA[CÇ]ÃO|FILIA[CÇ]?A?O|FILA[CÇ]ÃO|FIL[IAÇÃ]*|GENITORA|MOTHER|MAE|MÃE)/i.test(
          line
        );
      };

      if (isFiliationLine(linha) && !mae) {
        const possibleNames = [];
        let j = i + 1;
        let maxLines = 10;

        while (j < linhas.length && maxLines > 0) {
          const currentLine = linhas[j].trim();

          if (
            currentLine.length <= 2 ||
            /[*_]/.test(currentLine) ||
            /\d{2,}/.test(currentLine) ||
            stopWordsMae.some((w) => currentLine.includes(w))
          ) {
            break;
          }

          if (
            isAllCaps(currentLine) &&
            !currentLine.includes("FILIAÇÃO") &&
            currentLine.length > 3 &&
            currentLine.split(/\s+/).length >= 2
          ) {
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

      // CPF
      if (!cpf && (linha.includes("CPF") || linha.includes("TAX ID"))) {
        const candidato = linhas[i + 1]?.replace(/\D/g, "");
        if (candidato?.length === 11) {
          cpf = `${candidato.slice(0, 3)}.${candidato.slice(
            3,
            6
          )}.${candidato.slice(6, 9)}-${candidato.slice(9)}`;
        }
      }

      if (!cpf) {
        const matchCpf = linha.match(
          /\b\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}\b/
        );
        if (matchCpf) {
          const digits = matchCpf[0].replace(/\D/g, "");
          if (digits.length === 11) {
            cpf = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
              6,
              9
            )}-${digits.slice(9)}`;
          }
        }
      }

      // DATA DE NASCIMENTO
      if (!dn && linha.includes("NASC")) {
        const janela = linhas.slice(i, i + 4).join(" ");
        const match = janela.match(/\b\d{2}\/\d{2}\/\d{4}\b/);
        if (match) dn = match[0];
      }

      // PLACA
      if (!placa) {
        const m = linha
          .replace(/\s+/g, "")
          .match(/\b[A-Z]{3}\d{4}\b|\b[A-Z]{3}\d[A-Z]\d{2}\b/);
        if (m) placa = m[0];
      }
    }

    // Fallback com regex
    const findValue = (patterns, text) => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match.length > 1 && match[1]) {
          return normalizeSpaces(match[1]);
        }
      }
      return "";
    };

    const patterns = {
      abordado: [
        /(?:NOME(?:\s+E\s+SOBRENOME)?)[^\n]*\n(?:.*\n)?([A-ZÀ-Ü]{2,}(?:\s+[A-ZÀ-Ü]{2,}){1,})/i,
        /2\s*e\s*1\s*NOME\s*E\s*SOBRENOME\s*\n(?:.*\n)?([A-ZÀ-Ü]{2,}(?:\s+[A-ZÀ-Ü]{2,})+)/i,
      ],
      naturalidade: [
        /(?:NATURALIDADE|LOCAL\s+DE\s+NASCIMENTO)[^\n]*[\n:]*\s*([A-ZÀ-Ú\s\/-]+)/i,
      ],
      dn: [/(?:DATA\s+NASC(?:IMENTO)?)[\s:.-]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})/i],
      cpf: [
        /CPF\s*[:\n-]*\s*(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})/i,
        /\b(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})\b/,
      ],
      veiculoPlaca: [
        /PLACA\s*[:\n-]*\s*([A-Z]{3}[- ]?\d{4})/i,
        /\b([A-Z]{3}\d[A-Z]\d{2})\b/i,
      ],
      maeBloco: [
        /(?:[C-\s]*FILIA[CÇ]ÃO|GENITORA|MOTHER|MAE|MÃE)[\s:.-]*([\s\S]{10,200})/i,
      ],
    };

    // Completa campos vazios
    if (!nome) {
      const nomeRx = findValue(patterns.abordado, text);
      if (nomeRx && nomeRx.split(" ").length >= 2) nome = UPPER(nomeRx);
    }

    if (!naturalidade) {
      naturalidade = UPPER(findValue(patterns.naturalidade, text));
    }

    if (!dn) {
      const dnRx = findValue(patterns.dn, text);
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dnRx)) dn = dnRx;
    }

    if (!cpf) {
      let cpfRx = findValue(patterns.cpf, text).replace(/\D/g, "");
      if (cpfRx.length === 11) {
        cpf = `${cpfRx.slice(0, 3)}.${cpfRx.slice(3, 6)}.${cpfRx.slice(
          6,
          9
        )}-${cpfRx.slice(9)}`;
      }
    }

    if (!mae) {
      const bloco = findValue(patterns.maeBloco, text);
      if (bloco) {
        const lines = toLines(UPPER(bloco));
        const valid = [];
        for (const l of lines) {
          if (!l) continue;
          if (stopWordsMae.some((w) => l.includes(w))) break;
          if (!/\d/.test(l) && isAllCaps(l) && l.length >= 3) {
            valid.push(normalizeSpaces(l));
          } else {
            break;
          }
        }
        if (valid.length >= 3) {
          mae = normalizeSpaces(valid.slice(2).join(" "));
        } else if (valid.length >= 2) {
          mae = normalizeSpaces(valid[1]);
        }
      }
    }

    if (!mae) {
      const maeRegex =
        /(?:FILIAÇÃO|GENITORA|MAE|MÃE)[\s\S]*?([A-ZÀ-Ü]{2,}[\s\S]{5,80}?)(?:(?:\n|$)|(?:\d|\b(?:CPF|RG|NACIONA|ESTADO|ASSIN|LOCAL|DATA|CAT|N°)))/i;
      const match = text.match(maeRegex);
      if (match && match[1]) {
        const potencialMae = match[1].trim();
        if (
          potencialMae.split(/\s+/).length >= 2 &&
          !/^\d+$/.test(potencialMae)
        ) {
          mae = normalizeSpaces(UPPER(potencialMae));
        }
      }
    }

    if (!placa) {
      placa = UPPER(findValue(patterns.veiculoPlaca, text)).replace(" ", "");
    }

    // Valores padrão quando não encontrado
    if (!nome) nome = "Vá em Corrigir";
    if (!naturalidade) naturalidade = "Vá em Corrigir ou digite";
    if (!mae) mae = "Vá em Corrigir";
    if (!cpf) cpf = "Vá em Corrigir";
    if (!dn) dn = "Vá em Corrigir";
    if (!placa) placa = "Vá em Corrigir";

    // Atualiza os campos no formulário
    updateField("abordado", nome);
    updateField("naturalidade", naturalidade);
    updateField("genitora", mae);
    updateField("cpf", cpf);
    updateField("dn", dn);
    updateField("veiculoPlaca", placa);

    // Ativa campos de veículo se placa for encontrada
    if (placa && placa !== "Vá em Corrigir") {
      updateField("veiculoCheck", true);
      updateField("naoAplicaVeiculo", false);
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

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) =>
        reject(new Error("Falha ao converter para Base64"));
      reader.readAsDataURL(file);
    });
  };

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
