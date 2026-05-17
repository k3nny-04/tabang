import { useEffect } from "react";
import AdminMap from "../AdminMap";
import { X, Map } from "lucide-react";

const ExpandedMapModal = ({ isOpen, onClose, targetCoords }) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full h-full flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white z-10">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm md:text-base uppercase tracking-wider">
            <Map size={18} className="text-gray-400" />
            Live Map
          </h2>
          <button 
            onClick={onClose}
            className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <X size={16} />
            Close
          </button>
        </div>

        {/* Modal Map Container */}
        <div className="flex-1 w-full relative bg-gray-100">
          <AdminMap targetCoords={targetCoords} />
        </div>
      </div>
    </div>
  );
};

export default ExpandedMapModal;