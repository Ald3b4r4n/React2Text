// src/components/Modals/ServerTimeoutModal.jsx
const ServerTimeoutModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Servidor OCR Fora do Ar
            </h3>
          </div>

          <div className="text-gray-700 mb-6">
            <p className="mb-3">
              O servidor de reconhecimento de texto está demorando mais que o
              esperado (mais de 10 segundos).
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                💡 Solução Alternativa:
              </h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>
                  1. Use a função nativa do seu celular para extrair texto da
                  imagem
                </li>
                <li>2. Copie o texto extraído</li>
                <li>3. Cole o texto no campo "Texto Extraído do Documento"</li>
                <li>4. Clique em "Processar Texto Colado"</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">
                📱 Como usar a função nativa:
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>
                  • <strong>Android:</strong> Abra a imagem na Galeria, toque em
                  "Lens" ou "Google"
                </li>
                <li>
                  • <strong>iPhone:</strong> Abra a imagem na Fotos, toque no
                  ícone de texto
                </li>
                <li>
                  • <strong>Outros:</strong> Use apps como Google Lens ou
                  Microsoft Lens
                </li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerTimeoutModal;
