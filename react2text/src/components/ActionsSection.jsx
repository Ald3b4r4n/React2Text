// src/components/ActionsSection.jsx
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

  return (
    <div className="card bg-white bg-opacity-95 rounded-xl shadow-lg border border-blue-200 mb-6">
      <div className="card-body p-6">
        <h5 className="card-title text-blue-900 font-semibold text-center text-xl mb-4 pb-2 border-b-2 border-blue-400 flex items-center justify-center gap-2">
          4. Ações
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <button
            onClick={copyToClipboard}
            disabled={!isFormValid}
            className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">📋</span> Copiar para Área de Transferência
          </button>

          <button
            onClick={onWhatsApp}
            disabled={!isFormValid || !abordadoFile}
            className="btn bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">💬</span> Compartilhar via WhatsApp
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={onResetAntecedentes}
            className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            Limpar Antecedentes
          </button>

          <button
            onClick={onResetLocal}
            className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            Limpar Local
          </button>

          <button
            onClick={onResetEquipe}
            className="btn bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
          >
            Limpar Equipe
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionsSection;
