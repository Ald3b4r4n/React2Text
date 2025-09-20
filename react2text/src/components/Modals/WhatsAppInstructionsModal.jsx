// src/components/Modals/WhatsAppInstructionsModal.jsx
const WhatsAppInstructionsModal = ({ onContinue, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-blue-900 mb-4">
          Compartilhar via WhatsApp
        </h2>
        <p className="text-gray-700 mb-4">
          Ao clicar em "Continuar", o aplicativo irá abrir o WhatsApp com o
          relatório preenchido automaticamente.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg text-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onContinue();
              onClose();
            }}
            className="px-4 py-2 bg-green-500 rounded-lg text-white"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppInstructionsModal;
