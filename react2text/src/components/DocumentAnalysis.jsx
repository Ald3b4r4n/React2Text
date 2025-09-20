// src/components/DocumentAnalysis.jsx
import { useRef } from "react";

const DocumentAnalysis = ({
  onFileSelect,
  previewUrl,
  onProcess,
  isProcessing,
  progress,
  onTextProcess,
  ocrText,
  setOcrText,
}) => {
  const fileInputRef = useRef(null);
  const fileInputAbordadoRef = useRef(null);

  const handleCameraClick = (type) => {
    const input =
      type === "document" ? fileInputRef.current : fileInputAbordadoRef.current;
    input.setAttribute("capture", "environment");
    input.click();
  };

  const handleGalleryClick = (type) => {
    const input =
      type === "document" ? fileInputRef.current : fileInputAbordadoRef.current;
    input.removeAttribute("capture");
    input.click();
  };

  return (
    <div className="card bg-white bg-opacity-95 rounded-xl shadow-lg border border-blue-200 mb-6">
      <div className="card-body p-6">
        <h5 className="card-title text-blue-900 font-semibold text-center text-xl mb-4 pb-2 border-b-2 border-blue-400 flex items-center justify-center gap-2">
          <i className="bi bi-file-earmark-text"></i>
          1. Análise do Documento
        </h5>

        <div className="text-center mb-4">
          <div className="btn-group flex rounded-lg overflow-hidden shadow-md mb-3">
            <button
              onClick={() => handleCameraClick("document")}
              className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex-1 transition-colors"
            >
              <i className="bi bi-camera mr-2"></i> Tirar Foto do Documento
            </button>
            <button
              onClick={() => handleGalleryClick("document")}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 flex-1 transition-colors"
            >
              <i className="bi bi-images mr-2"></i> Galeria
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e, "document")}
          />
        </div>

        {previewUrl && (
          <div className="text-center mb-4">
            <img
              src={previewUrl}
              alt="Pré-visualização do Documento"
              className="img-fluid rounded-lg border shadow-md mx-auto max-h-64"
            />
          </div>
        )}

        {progress > 0 && (
          <div className="progress mb-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="progress-bar bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="mb-4">
          <label className="form-label text-blue-900 font-medium">
            Texto Extraído do Documento
          </label>
          <textarea
            value={ocrText}
            onChange={(e) => setOcrText(e.target.value)}
            className="form-control w-full p-3 border border-gray-300 rounded-lg h-36 text-black bg-white"
            placeholder="Texto extraído ou cole aqui seu texto..."
          />

          {ocrText.length > 10 && (
            <div className="text-center mt-2">
              <button
                onClick={() => onTextProcess(ocrText)}
                className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 transition-colors"
              >
                <i className="bi bi-gear mr-2"></i> Processar Texto Colado
              </button>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onProcess}
            disabled={isProcessing || !previewUrl}
            className="btn bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2"></span>
                Processando...
              </>
            ) : (
              <>
                <i className="bi bi-gear mr-2"></i> Processar Documento
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
