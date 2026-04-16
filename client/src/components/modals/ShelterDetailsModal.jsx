import { useState } from "react";
import { X, Home, Users, MapPin, Phone, User, Activity } from "lucide-react";

// Default shelter to an empty object to prevent undefined errors when adding
const ShelterDetailsModal = ({ shelter = {}, onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine if we are in edit mode or add mode based on the presence of an ID
  const isEditMode = Boolean(shelter?.id);
  
  // Initialize form state with shelter data OR blank defaults for a new shelter
  const [formData, setFormData] = useState({
    name: shelter?.name || "",
    barangay: shelter?.barangay || "",
    currentCapacity: shelter?.currentCapacity || 0,
    maxCapacity: shelter?.maxCapacity || 0,
    manager: shelter?.manager || "",
    contact: shelter?.contact || "",
    lat: shelter?.location?.lat || "",
    lng: shelter?.location?.lng || "",
    status: shelter?.status || "ACTIVE", 
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
      status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        barangay: formData.barangay,
        currentCapacity: parseInt(formData.currentCapacity, 10) || 0,
        maxCapacity: parseInt(formData.maxCapacity, 10) || 0,
        manager: formData.manager,
        contact: formData.contact,
        status: formData.status,
        location: {
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0,
        }
      };
      
      // Pass the ID (will be undefined if adding) and the payload back to the page
      await onSave(shelter?.id, payload);
      onClose();
    } catch (error) {
      console.error("Error saving shelter:", error);
      alert("Failed to save shelter.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClassName = "w-full p-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-text-primary/20 focus:border-text-primary outline-none transition-all";
  const labelClassName = "text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] border border-gray-200">
                
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-text-primary flex items-center gap-3">
              {isEditMode ? "Shelter Details" : "Add New Shelter"}
              
              {/* Static Status Badge */}
              <span className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${
                formData.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-700 border-green-200' 
                  : 'bg-red-100 text-red-700 border-red-200'
              }`}>
                {formData.status}
              </span>
            </h2>
            {/* Only show ID if in edit mode */}
            {isEditMode && <p className="text-xs text-gray-500 font-mono mt-1">ID: {shelter.id}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Explicit Toggle Button */}
            <button 
              onClick={handleStatusToggle}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border focus:ring-2 focus:ring-offset-1 outline-none ${
                formData.status === 'ACTIVE'
                  ? 'bg-white text-red-600 border-gray-200 hover:bg-red-50 hover:border-red-200 focus:ring-red-500/50'
                  : 'bg-white text-green-600 border-gray-200 hover:bg-green-50 hover:border-green-200 focus:ring-green-500/50'
              }`}
            >
              {formData.status === 'ACTIVE' ? 'Set as Inactive' : 'Set as Active'}
            </button>
            
            <div className="hidden sm:block w-px h-6 bg-gray-200"></div>

            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors outline-none focus:ring-2 focus:ring-gray-300">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BODY (Single Column) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/30 space-y-6">
          
          {/* Basic Info Section */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
            <div>
              <label className={labelClassName}>
                <Home size={14} className="text-gray-400" />
                Shelter Name
              </label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClassName}
                placeholder="e.g. Naga City Evacuation Center"
              />
            </div>
            
            <div>
              <label className={labelClassName}>
                <MapPin size={14} className="text-gray-400" />
                Barangay
              </label>
              <input 
                type="text" 
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                className={inputClassName}
                placeholder="e.g. Igualdad"
              />
            </div>
          </div>

          {/* Capacity Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className={labelClassName}>
                <Users size={14} className="text-gray-400" />
                Current Capacity
              </label>
              <input 
                type="number" 
                name="currentCapacity"
                min="0"
                value={formData.currentCapacity}
                onChange={handleChange}
                className={`${inputClassName} font-mono font-bold text-gray-800`}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <label className={labelClassName}>
                <Users size={14} className="text-gray-400" />
                Max Capacity
              </label>
              <input 
                type="number" 
                name="maxCapacity"
                min="0"
                value={formData.maxCapacity}
                onChange={handleChange}
                className={`${inputClassName} font-mono font-bold text-gray-800`}
              />
            </div>
          </div>

          {/* Contact Person Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-1 rounded-xl">
              <label className={labelClassName}>
                <User size={14} className="text-gray-400" />
                Manager / Point Person
              </label>
              <input 
                type="text" 
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className={inputClassName}
                placeholder="Name of manager"
              />
            </div>
            <div className="bg-white p-1 rounded-xl">
              <label className={labelClassName}>
                <Phone size={14} className="text-gray-400" />
                Contact Number
              </label>
              <input 
                type="text" 
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className={inputClassName}
                placeholder="+63 9..."
              />
            </div>
          </div>

          {/* Coordinates Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Map Coordinates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1">LATITUDE</label>
                <input 
                  type="number" 
                  step="any"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  className={`${inputClassName} font-mono text-xs`}
                  placeholder="13.1391"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 tracking-wider block mb-1">LONGITUDE</label>
                <input 
                  type="number" 
                  step="any"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  className={`${inputClassName} font-mono text-xs`}
                  placeholder="123.7438"
                />
              </div>
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
            {isSaving ? "Saving..." : isEditMode ? "Save Changes" : "Add Shelter"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShelterDetailsModal;