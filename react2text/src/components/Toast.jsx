// src/components/Toast.jsx
import { useEffect } from "react";

const Toast = ({ show, message, type = "info", onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const bgColor = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }[type];

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center`}
      >
        <span className="mr-2">{message}</span>
        <button onClick={onClose} className="text-white text-lg font-bold">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
