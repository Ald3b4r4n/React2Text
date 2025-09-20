// src/components/ActionsSection.jsx
import { useState } from "react";

const ActionsSection = ({
  isFormValid,
  abordadoFile,
  formData,
  onCopy,
  onWhatsApp,
  onResetAntecedentes,
  onResetLocal,
  onResetEquipe,
}) => {
  const [resetFeedback, setResetFeedback] = useState("");

  const generateText = (data) => {
    const apelidoFinal = data.naoAplicaApelido
      ? "Não se aplica"
      : data.apelido || "Não informado";

    let report =
      `🚨 *ABORDAGEM POLICIAL* 🚨\n\n` +
      `*Abordado:* ${data.abordado || "Não informado"}\n` +
      `*Naturalidade:* ${data.naturalidade || "Não informado"}\n` +
      `*Genitora:* ${data.genitora || "Não informado"}\n` +
      `*Apelido:* ${apelidoFinal}\n` +
      `*CPF:* ${data.cpf || "Não informado"}\n` +
      `*Data Nasc.:* ${data.dn || "Não informado"}\n` +
      `*Endereço:* ${data.endereco || "Não informado"}\n` +
      `*Antecedentes:* ${data.antecedentes || "Não informado"}\n` +
      `*Local da Abordagem:* ${data.local || "Não informado"}\n` +
      `*Equipe:* ${data.equipe || "Não informado"}\n` +
      `*OBSERVAÇÕES:*\n`;

    report += data.tornozeleiraCheck
      ? `- Tornozeleira: Sim. *Número:* ${
          data.tornozeleiraNumero || "Não informado"
        }\n`
      : `- Tornozeleira: Não se aplica.\n`;

    report += data.veiculoCheck
      ? `- Veículo: Sim.\n  *Placa:* ${
          data.veiculoPlaca || "Não informado"
        }\n  *Cor:* ${data.veiculoCor || "Não informado"}\n  *Modelo:* ${
          data.veiculoModelo || "Não informado"
        }\n`
      : `- Veículo: Não se aplica.\n`;

    return report.trim();
  };

  const copyToClipboard = () => {
    const text = generateText(formData);
    navigator.clipboard
      .writeText(text)
      .then(() => onCopy())
      .catch((err) => console.error("Erro ao copiar texto:", err));
  };

  const shareViaWhatsApp = () => {
    const text = generateText(formData);
    const phoneNumber = "";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;

    if (abordadoFile && navigator.share) {
      navigator
        .share({
          title: "Abordagem Policial",
          text: text,
          files: [abordadoFile],
        })
        .then(() => console.log("Compartilhado com sucesso"))
        .catch((error) => {
          console.log(
            "Falha ao compartilhar com imagem, usando fallback de texto:",
            error
          );
          window.open(url, "_blank");
        });
    } else {
      window.open(url, "_blank");
    }

    onWhatsApp();
  };

  const handleResetWithFeedback = (resetFunction, fieldName) => {
    resetFunction();
    setResetFeedback(`${fieldName} limpo com sucesso!`);
    setTimeout(() => setResetFeedback(""), 2000);
  };

  return (
    <div className="card bg-white bg-opacity-95 rounded-xl shadow-lg border border-blue-200 mb-6">
      {/* Padding responsivo: p-4 em telas pequenas, p-6 em telas médias e maiores */}
      <div className="card-body p-4 md:p-6">
        <h5 className="card-title text-blue-900 font-semibold text-center text-xl mb-4 pb-2 border-b-2 border-blue-400 flex items-center justify-center gap-2">
          4. Ações
        </h5>

        {resetFeedback && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
            {resetFeedback}
          </div>
        )}

        {/* O grid já estava responsivo, o que é ótimo! */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={copyToClipboard}
            disabled={!isFormValid}
            className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span className="mr-2">📋</span>
            <span className="hidden md:inline">
              Copiar para Área de Transferência
            </span>
            <span className="md:hidden">Copiar Texto</span>
          </button>

          <button
            onClick={shareViaWhatsApp}
            disabled={!isFormValid || !abordadoFile}
            className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span className="mr-2">💬</span>
            <span className="hidden md:inline">Compartilhar via WhatsApp</span>
            <span className="md:hidden">WhatsApp</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() =>
              handleResetWithFeedback(onResetAntecedentes, "Antecedentes")
            }
            className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="md:hidden mr-1">🗑️</span>
            Limpar Antecedentes
          </button>

          <button
            onClick={() => handleResetWithFeedback(onResetLocal, "Local")}
            className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="md:hidden mr-1">🗑️</span>
            Limpar Local
          </button>

          <button
            onClick={() => handleResetWithFeedback(onResetEquipe, "Equipe")}
            className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="md:hidden mr-1">🗑️</span>
            Limpar Equipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionsSection;
