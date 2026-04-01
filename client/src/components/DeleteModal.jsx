import { useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";

const DeleteModal = ({ 
  title = "Confirm Deletion", 
  itemName = "this item", 
  itemId, 
  extraDetails = [], // Array of objects: { label: string, value: string }
  onClose, 
  onConfirm 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(itemId);
      onClose();
    } catch (error) {
      console.error(`Error deleting ${itemName}:`, error);
      alert(`Failed to delete ${itemName}. Please try again.`);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="flex justify-between items-start px-6 pt-6 pb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
          </div>
          <button 
            onClick={onClose} 
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Section */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-black text-gray-900 mb-2">
            {title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Are you sure you want to delete <strong className="text-gray-800">{itemName}</strong>? This action cannot be undone and will permanently remove all associated data from the system.
          </p>
          
          {/* Contextual Info Box */}
          <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-3 flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-mono">
              <span className="font-bold text-gray-400 uppercase mr-2">ID:</span> 
              {itemId}
            </span>
            {extraDetails.map((detail, index) => (
              <span key={index} className="text-xs text-gray-500">
                <span className="font-bold text-gray-400 uppercase mr-2">{detail.label}:</span> 
                {detail.value || "N/A"}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-1"
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default DeleteModal;