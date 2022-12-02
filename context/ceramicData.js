import { createContext, useContext } from "react";
const CeramicDataContext = createContext();

export function useCeramicContext() {
  return useContext(CeramicDataContext);
}

export default CeramicDataContext;
