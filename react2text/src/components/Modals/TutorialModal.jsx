// src/components/Modals/TutorialModal.jsx
const TutorialModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-xl font-semibold text-gray-800">
            Como Usar o Doc2text
          </h3>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">
              📋 Passo a Passo
            </h4>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-700 mb-2">
                  1. Análise do Documento
                </h5>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>
                    Clique em "Tirar Foto do Documento" ou "Galeria" para
                    selecionar a imagem
                  </li>
                  <li>
                    O sistema processará automaticamente a imagem e extrairá os
                    dados
                  </li>
                  <li>
                    Você pode colar texto manualmente na área de texto se
                    preferir
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-semibold text-green-700 mb-2">
                  2. Dados da Abordagem
                </h5>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>
                    Verifique e corrija os dados extraídos automaticamente
                  </li>
                  <li>
                    Use os botões de "Corrigir", para editar campos específicos
                  </li>
                  <li>Consulte o BNMP para verificar mandados de prisão</li>
                  <li>
                    Preencha informações adicionais como veículo ou tornozeleira
                    se aplicável
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h5 className="font-semibold text-yellow-700 mb-2">
                  3. Foto do Abordado
                </h5>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Tire uma foto do abordado ou selecione da galeria</li>
                  <li>A foto será anexada ao relatório final</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-700 mb-2">
                  4. Ações Finais
                </h5>
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  <li>Copie os dados para a área de transferência</li>
                  <li>Compartilhe via WhatsApp com a foto incluída</li>
                  <li>
                    Use os botões de limpeza para reiniciar campos específicos
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">
              💡 Dicas Importantes
            </h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              <li>
                Certifique-se de que a foto do documento esteja bem iluminada e
                nítida
              </li>
              <li>Verifique sempre os dados extraídos automaticamente</li>
              <li>
                Consulte o BNMP para cada abordado para verificar mandados de
                prisão
              </li>
              <li>Mantenha o aplicativo atualizado para melhor desempenho</li>
            </ul>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">
              📞 Suporte
            </h4>
            <p className="text-gray-700">
              Em caso de dúvidas ou problemas, entre em contato com o
              desenvolvedor:
              <a
                href="https://wa.me/5561982887294"
                className="text-blue-600 hover:underline ml-2"
              >
                WhatsApp do Desenvolvedor
              </a>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Fechar Tutorial
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
