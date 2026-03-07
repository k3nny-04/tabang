import { useLayers } from "../providers/useLayersContext";

const Layers = () => {
  const { activeLayers, toggleLayer } = useLayers();

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between">
        <span>Evacuation Shelters</span>
        <input
          type="checkbox"
          checked={activeLayers.evacShelters}
          onChange={() => toggleLayer("evacShelters")}
        />
      </label>
    </div>
  );
};

export default Layers;