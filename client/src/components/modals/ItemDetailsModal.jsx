import { useState } from "react";
import { X, Package, Tag, Hash, Building2, Phone } from "lucide-react";

const ItemDetailsModal = ({ item = {}, onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine if we are in edit mode or add mode based on the presence of an ID
  const isEditMode = Boolean(item?.id);
  
  // Initialize form state
  const [formData, setFormData] = useState({
    name: item?.name || "",
    category: item?.category || "",
    quantity_total: item?.quantity_total || 0,
    quantity_available: item?.quantity_available || 0,
    supplier: item?.supplier || "",
    supplier_contact: item?.supplier_contact || "",
    status: item?.status || "FUNCTIONAL", 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === 'FUNCTIONAL' ? 'NOT FUNCTIONAL' : 'FUNCTIONAL',
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        category: formData.category,
        quantity_total: parseInt(formData.quantity_total, 10) || 0,
        quantity_available: parseInt(formData.quantity_available, 10) || 0,
        supplier: formData.supplier,
        supplier_contact: formData.supplier_contact,
        status: formData.status,
      };
      
      // Pass the ID (will be undefined if adding) and the payload back to the page
      await onSave(item?.id, payload);
      onClose();
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName = "w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-text-primary/20 focus:border-text-primary outline-none transition-all";
  const labelClassName = "text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-gray-200">
                
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
              {isEditMode ? "Equipment Details" : "Add New Equipment"}
              
              <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                formData.status === 'FUNCTIONAL' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {formData.status}
              </span>
            </h2>
            {isEditMode && <p className="text-xs text-gray-500 font-mono mt-1">ID: {item.id}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleStatusToggle}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border focus:ring-2 focus:ring-offset-1 outline-none ${
                formData.status === 'FUNCTIONAL'
                  ? 'bg-white text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 focus:ring-red-500/50'
                  : 'bg-white text-green-600 border-gray-200 hover:bg-green-50 hover:border-green-200 focus:ring-green-500/50'
              }`}
            >
              {formData.status === 'FUNCTIONAL' ? 'Set Not Functional' : 'Set Functional'}
            </button>
            
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors outline-none focus:ring-2 focus:ring-gray-300">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30 space-y-6">
          
          {/* Basic Info Section */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
            <div>
              <label className={labelClassName}>
                <Package size={14} className="text-gray-400" />
                Equipment Name
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                placeholder="e.g. Heavy Duty Generator"
              />
            </div>
            
            <div>
              <label className={labelClassName}>
                <Tag size={14} className="text-gray-400" />
                Category
              </label>
              <input 
                type="text" 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputClassName}
                placeholder="e.g. Power Supply, Medical, Vehicles"
              />
            </div>
          </div>

          {/* Quantities Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className={labelClassName}>
                <Hash size={14} className="text-gray-400" />
                Total Quantity
              </label>
              <input 
                type="number" 
                name="quantity_total"
                min="0"
                value={formData.quantity_total}
                onChange={handleChange}
                className={`${inputClassName} font-mono font-bold text-gray-800`}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className={labelClassName}>
                <Hash size={14} className="text-gray-400" />
                Quantity Available
              </label>
              <input 
                type="number" 
                name="quantity_available"
                min="0"
                value={formData.quantity_available}
                onChange={handleChange}
                className={`${inputClassName} font-mono font-bold text-gray-800`}
              />
            </div>
          </div>

          {/* Supplier Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-1 rounded-xl">
              <label className={labelClassName}>
                <Building2 size={14} className="text-gray-400" />
                Supplier
              </label>
              <input 
                type="text" 
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Name of supplier/donor"
              />
            </div>
            <div className="bg-white p-1 rounded-xl">
              <label className={labelClassName}>
                <Phone size={14} className="text-gray-400" />
                Supplier Contact
              </label>
              <input 
                type="text" 
                name="supplier_contact"
                value={formData.supplier_contact}
                onChange={handleChange}
                className={inputClassName}
                placeholder="+63 9..."
              />
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-text-primary text-white py-3 rounded-xl font-semibold shadow-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Add Equipment"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ItemDetailsModal;