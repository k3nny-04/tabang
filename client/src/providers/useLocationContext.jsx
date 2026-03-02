import { useContext } from "react";
import { LocationContext } from "./LocationProvider";

export const useLocationContext = () => {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocationContext must be used within a LocationProvider"
    );
  }

  return context;
};