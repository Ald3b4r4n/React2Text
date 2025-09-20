// src/components/PhotoSection.jsx
import { useRef } from "react";

const PhotoSection = ({ onFileSelect, previewUrl }) => {
  const fileInputRef = useRef(null);

  const handleCameraClick = () => {
    fileInputRef.current.setAttribute("capture", "environment");
    fileInputRef.current.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current.removeAttribute("capture");
    fileInputRef.current.click();
  };

  return (
    <div className="card bg-white bg-opacity-95 rounded-xl shadow-lg border border-blue-200 mb-6">
      <div className="card-body p-6">
        <h5 className="card-title text-blue-900 font-semibold text-center text-xl mb-4 pb-2 border-b-2 border-blue-400 flex items-center justify-center gap-2">
          <i className="bi bi-camera"></i>
          3. Foto do Abordado
        </h5>

        <div className="text-center">
          <div className="btn-group flex rounded-lg overflow-hidden shadow-md mb-3">
            <button
              onClick={handleCameraClick}
              className="btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 flex-1 transition-colors"
            >
              <i className="bi bi-camera mr-2"></i> Tirar Foto
            </button>
            <button
              onClick={handleGalleryClick}
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
            onChange={(e) => onFileSelect(e, "abordado")}
          />
        </div>

        {previewUrl && (
          <div className="text-center mt-4">
            <img
              src={previewUrl}
              alt="Pré-visualização do Abordado"
              className="img-fluid rounded-lg border shadow-md mx-auto max-h-64"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoSection;
