// src/components/Modals/WhatsAppInstructionsModal.jsx
const WhatsAppInstructionsModal = ({ onContinue, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            Compartilhar via WhatsApp
          </h3>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-4">
              Para compartilhar os dados via WhatsApp, siga estas instruções:
            </p>

            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Copie o texto para a área de transferência</li>
              <li>Abra o WhatsApp e selecione o contato ou grupo</li>
              <li>Cole o texto na conversa</li>
              <li>Selecione a foto do abordado para anexar</li>
              <li>Envie a mensagem</li>
            </ol>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInstructionsModal;
