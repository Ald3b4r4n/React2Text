// src/components/Modals/WhatsAppInstructionsModal.jsx
const WhatsAppInstructionsModal = ({ onContinue, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Compartilhar via WhatsApp
          </h3>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Para compartilhar a imagem junto com o texto:
            </p>

            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>O texto já foi copiado para sua área de transferência</li>
              <li>Abra o WhatsApp e selecione o contato ou grupo</li>
              <li>Cole o texto (Ctrl+V ou toque prolongado + colar)</li>
              <li>Toque no ícone de anexo (📎)</li>
              <li>Selecione "Galeria" ou "Documentos"</li>
              <li>Escolha a foto do abordado</li>
              <li>Envie a mensagem</li>
            </ol>
          </div>

          <div className="flex justify-end space-x-3">
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
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInstructionsModal;
