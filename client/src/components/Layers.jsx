import { FaHouse } from "react-icons/fa6";
import { useLayers } from "../providers/useLayersContext";
import { AlertTriangle, ShieldAlert, Waves, Mountain, CloudLightning } from "lucide-react";

// eslint-disable-next-line no-unused-vars
const LayerCard = ({ label, icon: Icon, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className="flex flex-col items-center gap-2 cursor-pointer group transition-transform active:scale-95"
  >
    {/* Map details square card */}
    <div 
      className={`relative flex h-18 w-18 items-center justify-center rounded-[20px] transition-all duration-200 shadow-md ${
        isActive 
          ? 'border-2 border-text-primary bg-surface-elevated' 
          : 'border-2 border-transparent bg-surface hover:bg-surface-hover'
      }`}
    >
      <Icon 
        size={34} 
        strokeWidth={isActive ? 2.5 : 2}
        className={`transition-colors duration-200 ${
          isActive ? 'text-text-primary' : 'text-gray-500'
        }`} 
      />
    </div>
    
    {/* Label below the card */}
    <span 
      className={`text-[13px] text-center leading-tight max-w-20 transition-all duration-200 ${
        isActive ? 'text-text-primary font-bold' : 'text-gray-600 font-medium'
      }`}
    >
      {label}
    </span>
  </div>
);

const Layers = () => {
  const { activeLayers, toggleLayer } = useLayers();

  return (
    <div className="p-2 flex flex-col gap-6">
      
      {/* --- MARKERS SECTION --- */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Markers
        </h3>
        {/* Changed to grid-cols-3 for perfectly even spacing */}
        <div className="grid grid-cols-3 gap-y-6">
          <LayerCard
            label="Evac Shelters"
            icon={FaHouse}
            isActive={activeLayers.evacShelters}
            onClick={() => toggleLayer("evacShelters")}
          />
          <LayerCard
            label="Incident Reports"
            icon={AlertTriangle}
            isActive={activeLayers.incidentReports}
            onClick={() => toggleLayer("incidentReports")}
          />
          <LayerCard
            label="Response Teams"
            icon={ShieldAlert}
            isActive={activeLayers.responseTeams}
            onClick={() => toggleLayer("responseTeams")}
          />
        </div>
      </div>

      <div className="h-px bg-gray-200/60 w-full" />

      {/* --- HAZARDS SECTION --- */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
          Hazards 
        </h3>
        {/* Changed to grid-cols-3 for perfectly even spacing */}
        <div className="grid grid-cols-3 gap-y-6">
          <LayerCard
            label="Flood Map"
            icon={Waves}
            isActive={activeLayers.floodMap}
            onClick={() => toggleLayer("floodMap")}
          />
          <LayerCard
            label="Storm Surge"
            icon={CloudLightning}
            isActive={activeLayers.stormSurge}
            onClick={() => toggleLayer("stormSurge")}
          />
          {/* <LayerCard
            label="Landslide"
            icon={Mountain}
            isActive={activeLayers.landslide}
            onClick={() => toggleLayer("landslide")}
          /> */}
        </div>
      </div>

    </div>
  );
};

export default Layers;