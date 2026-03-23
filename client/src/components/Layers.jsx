import { FaHouse } from "react-icons/fa6";
import { useLayers } from "../providers/useLayersContext";
import { AlertTriangle, Users } from "lucide-react";

// eslint-disable-next-line no-unused-vars
const LayerToggle = ({ label, icon: Icon, isActive, onClick, colorClass }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-surface cursor-pointer transition-all active:scale-[0.98]"
  >
    {/* Left Side: Icon & Text */}
    <div className="flex items-center space-x-3">
      <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${colorClass}`} strokeWidth={2.5} />
      </div>
      <span className="font-medium text-text-primary text-sm">{label}</span>
    </div>

    {/* Right Side: Custom Toggle Switch */}
    <div 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out ${
        isActive ? 'bg-text-primary' : 'bg-gray-300'
      }`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
          isActive ? 'translate-x-6' : 'translate-x-1'
        }`} 
      />
    </div>
  </div>
);

const Layers = () => {
  const { activeLayers, toggleLayer } = useLayers();

  return (
    <div className="space-y-1">
      <LayerToggle
        label="Evacuation Shelters"
        icon={FaHouse}
        isActive={activeLayers.evacShelters}
        onClick={() => toggleLayer("evacShelters")}
        colorClass="text-green-600 bg-green-100" 
      />

      <LayerToggle
        label="Incident Reports"
        icon={AlertTriangle}
        isActive={activeLayers.incidents}
        onClick={() => toggleLayer("incidents")}
        colorClass="text-red-600 bg-red-100" 
      />

      <LayerToggle
        label="Response Teams"
        icon={Users}
        isActive={activeLayers.responders}
        onClick={() => toggleLayer("responders")}
        colorClass="text-blue-600 bg-blue-100" 
      />
    </div>
  );
};

export default Layers;