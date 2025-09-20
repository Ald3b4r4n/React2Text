// src/components/Modals/CorrectionModal.jsx
import { useState, useEffect } from "react";

const CorrectionModal = ({
  field,
  ocrText, // ← Agora recebe ocrRawText com o nome de ocrText
  currentValue,
  onApply,
  onClose,
}) => {
  const [manualValue, setManualValue] = useState(currentValue || "");
  const [startExpression, setStartExpression] = useState("");
  const [endExpression, setEndExpression] = useState("");
  const [extractedValue, setExtractedValue] = useState("");

  // Função para extrair texto entre expressões
  const extractTextBetweenExpressions = () => {
    if (!ocrText || !startExpression.trim()) {
      setExtractedValue("");
      return;
    }

    try {
      const text = ocrText;
      const startExpr = startExpression.trim();
      const endExpr = endExpression.trim();

      // Encontra o índice inicial (case insensitive)
      const startIndex = text.toLowerCase().indexOf(startExpr.toLowerCase());

      if (startIndex === -1) {
        setExtractedValue("❌ Expressão inicial não encontrada");
        return;
      }

      let finalEndIndex;

      // Se há expressão final, procura por ela
      if (endExpr) {
        const endIndex = text
          .toLowerCase()
          .indexOf(endExpr.toLowerCase(), startIndex + startExpr.length);

        if (endIndex !== -1) {
          finalEndIndex = endIndex + endExpr.length;
        } else {
          finalEndIndex = text.length;
          setExtractedValue(
            "⚠️ Expressão final não encontrada - extraído até o final"
          );
        }
      } else {
        // Se não há expressão final, vai até o final do texto
        finalEndIndex = text.length;
      }

      // Extrai o texto (mantendo o case original)
      const result = text.substring(startIndex, finalEndIndex).trim();
      setExtractedValue(result);
    } catch (error) {
      console.error("Erro na extração:", error);
      setExtractedValue("❌ Erro na extração");
    }
  };

  // Atualiza a extração quando as expressões mudam
  useEffect(() => {
    extractTextBetweenExpressions();
  }, [startExpression, endExpression]);

  // Atualiza o manualValue quando currentValue muda
  useEffect(() => {
    setManualValue(currentValue || "");
  }, [currentValue]);

  const handleApply = () => {
    // Usa o valor extraído se disponível, senão o manual
    const finalValue =
      extractedValue && extractedValue !== "❌ Expressão inicial não encontrada"
        ? extractedValue
        : manualValue;

    if (finalValue.trim()) {
      onApply(finalValue.trim());
    }
  };

  const handleUseExtracted = () => {
    if (
      extractedValue &&
      extractedValue !== "❌ Expressão inicial não encontrada"
    ) {
      setManualValue(extractedValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <h3 className="text-xl font-semibold text-gray-800">
            ✏️ Corrigir: {field}
          </h3>
        </div>

        <div className="p-6">
          {/* Texto OCR Original */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Texto extraído do documento:
            </label>
            <div className="bg-gray-100 p-4 rounded-lg text-black h-40 overflow-y-auto text-sm font-mono">
              {ocrText || "Nenhum texto extraído disponível"}
            </div>
          </div>

          {/* Expressões de Extração */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-gray-700 mb-3 font-medium">
              🔍 Extrair texto entre expressões:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Expressão inicial:
                </label>
                <input
                  type="text"
                  value={startExpression}
                  onChange={(e) => setStartExpression(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: An"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Expressão final (opcional):
                </label>
                <input
                  type="text"
                  value={endExpression}
                  onChange={(e) => setEndExpression(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: nha"
                />
              </div>
            </div>

            {/* Preview da Extração */}
            {extractedValue && (
              <div className="mt-4 p-4 bg-white border border-blue-300 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-blue-800">
                    Texto extraído:
                  </label>
                  <button
                    onClick={handleUseExtracted}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    disabled={
                      extractedValue.includes("❌") ||
                      extractedValue.includes("⚠️")
                    }
                  >
                    Usar este texto
                  </button>
                </div>
                <div className="text-black font-medium bg-yellow-50 p-3 rounded border">
                  {extractedValue}
                </div>
              </div>
            )}
          </div>

          <hr className="my-6" />

          {/* Entrada Manual */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-3 font-medium">
              ✍️ Ou digite o valor manualmente:
            </label>
            <input
              type="text"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500"
              placeholder={`Digite o valor correto para ${field}`}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            disabled={!manualValue.trim()}
          >
            Aplicar Correção
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectionModal;
