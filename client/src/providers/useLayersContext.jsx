import { useContext } from "react";
import { LayersContext } from "./LayersProvider";

export const useLayers = () => {
  const context = useContext(LayersContext);
  if (!context) {
    throw new Error("useLayers must be used within LayersProvider");
  }
  return context;
};