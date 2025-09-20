// src/App.jsx
import { useState, useEffect } from "react";
import DocumentAnalysis from "./components/DocumentAnalysis";
import ApproachData from "./components/ApproachData";
import PhotoSection from "./components/PhotoSection";
import ActionsSection from "./components/ActionsSection";
import CorrectionModal from "./components/Modals/CorrectionModal";
import WhatsAppInstructionsModal from "./components/Modals/WhatsAppInstructionsModal";
import TutorialModal from "./components/Modals/TutorialModal";
import Toast from "./components/Toast";
import { useFormData } from "./hooks/useFormData";
import { useOcr } from "./hooks/useOcr";
import { useImageProcessing } from "./hooks/useImageProcessing";
import "./styles/Responsive.css";

function App() {
  const {
    formData,
    updateField,
    resetField,
    validateForm,
    isFormValid,
    ocrRawText,
    setOcrRawText,
    currentFile,
    setCurrentFile,
    abordadoFile,
    setAbordadoFile,
  } = useFormData();

  const {
    processDocument,
    processPastedText,
    isProcessing,
    processingProgress,
  } = useOcr(currentFile, updateField, setOcrRawText);

  const [resetFeedback, setResetFeedback] = useState("");

  const handleResetWithFeedback = (resetFunction, fieldName) => {
    resetFunction();
    setResetFeedback(`${fieldName} limpo com sucesso!`);
    setTimeout(() => setResetFeedback(""), 2000);
  };

  const { handleFileSelect, documentPreviewUrl, abordadoPreviewUrl } =
    useImageProcessing(setCurrentFile, setAbordadoFile);

  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // ✅ REGISTRO DO SERVICE WORKER
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js");
          console.log("✅ Service Worker registrado: ", registration.scope);

          // Verifica se há uma nova versão disponível
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            console.log("🔄 Nova versão do Service Worker encontrada");

            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                console.log("📦 Nova versão instalada");
                // Pode mostrar um toast para o usuário atualizar a página
                showToast("Nova versão disponível! Atualize a página.", "info");
              }
            });
          });
        } catch (error) {
          console.error("❌ Falha no registro do Service Worker:", error);
        }
      }
    };

    // Registra apenas em produção
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
    } else {
      console.log("⚡ Modo desenvolvimento: Service Worker não registrado");
    }
  }, []);

  // Função para resetar todos os campos
  const resetAllFields = () => {
    const fieldsToReset = {
      abordado: "",
      naturalidade: "",
      genitora: "",
      apelido: "",
      cpf: "",
      dn: "",
      antecedentes: "",
      endereco: "",
      local: "",
      equipe: "",
      veiculoPlaca: "",
      veiculoCor: "",
      veiculoModelo: "",
      tornozeleiraNumero: "",
      inserirApelido: false,
      naoAplicaApelido: true,
      tornozeleiraCheck: false,
      naoAplicaTornozeleira: true,
      veiculoCheck: false,
      naoAplicaVeiculo: true,
    };

    Object.keys(fieldsToReset).forEach((field) => {
      updateField(field, fieldsToReset[field]);
    });

    setOcrRawText("");
  };

  const handleDocumentFileSelect = (e) => {
    handleFileSelect(e, "document");
    resetAllFields();
  };

  const handleAbordadoFileSelect = (e) => {
    handleFileSelect(e, "abordado");
  };

  const openBnmpPortal = () => {
    window.open("https://portalbnmp.cnj.jus.br/#/pesquisa-peca", "_blank");
  };

  const openPlacaPortal = () => {
    window.open("https://mportal.ssp.go.gov.br/", "_blank");
  };

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const openModal = (modalName, data = {}) => {
    setActiveModal(modalName);
    setModalData(data);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020024] via-[#161640] to-[#00d4ff] text-white pt-16 pb-8">
      <nav className="fixed top-0 left-0 right-0 bg-[#020024] bg-opacity-90 backdrop-blur-md shadow-lg border-b border-[#79bbff] z-50 h-16 flex items-center px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="text-[#79bbff] text-2xl">🛡️</span>
            Doc2text
          </div>
          <a
            href="https://geradordeproativas.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-light text-[#79bbff] border-[#79bbff] hover:bg-[#79bbff] hover:text-[#020024] text-sm px-3 py-1 transition-all duration-300"
          >
            <span className="mr-1">⚡</span> Gerador de Proativas
          </a>
        </div>
      </nav>

      <main className="container mx-auto px-4 max-w-4xl mt-2 pt-2">
        <DocumentAnalysis
          onFileSelect={handleDocumentFileSelect}
          previewUrl={documentPreviewUrl}
          onProcess={processDocument}
          isProcessing={isProcessing}
          progress={processingProgress}
          onTextProcess={processPastedText}
          ocrText={ocrRawText}
          setOcrText={setOcrRawText}
        />

        <ApproachData
          formData={formData}
          onFieldChange={updateField}
          onEditField={(field) => openModal("correction", { field })}
          onSearchBnmp={openBnmpPortal}
          onSearchPlate={openPlacaPortal}
          ocrText={ocrRawText}
        />

        <PhotoSection
          onFileSelect={handleAbordadoFileSelect}
          previewUrl={abordadoPreviewUrl}
        />

        <ActionsSection
          isFormValid={isFormValid()}
          abordadoFile={abordadoFile}
          formData={formData}
          onCopy={() =>
            showToast("Dados copiados para a área de transferência!", "success")
          }
          onWhatsApp={() => openModal("whatsapp-instructions")}
          onResetAntecedentes={() => resetField("antecedentes")}
          onResetLocal={() => resetField("local")}
          onResetEquipe={() => resetField("equipe")}
        />

        <div className="text-center mb-6">
          <button
            onClick={() => openModal("tutorial")}
            className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📘 Como Usar
          </button>
        </div>

        <footer className="text-center text-gray-300 text-sm mt-8">
          Desenvolvido por CB Antônio Rafael | versão React 1.0
          <div className="mt-2">
            <a
              href="https://wa.me/5561982887294?text=Olá,%20gostaria%20de%20mais%20informações%20sobre%20o%20Doc2text"
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm rounded-lg transition-colors inline-flex items-center"
            >
              <span className="mr-1">💬</span> Fale pelo WhatsApp
            </a>
          </div>
        </footer>
      </main>

      {/* Modals */}
      {activeModal === "correction" && (
        <CorrectionModal
          field={modalData.field}
          ocrText={ocrRawText}
          currentValue={formData[modalData.field]}
          onApply={(value) => {
            updateField(modalData.field, value);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {activeModal === "whatsapp-instructions" && (
        <WhatsAppInstructionsModal
          onContinue={shareViaWhatsApp}
          onClose={closeModal}
        />
      )}

      {activeModal === "tutorial" && <TutorialModal onClose={closeModal} />}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}

export default App;
