import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { ChakraProvider } from "@chakra-ui/react";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { wagmiClient, chains } from "../helpers/rainbowSetup";
import LoadingContext from "../context/loading";
import CeramicDataContext from "../context/ceramicData";
import Loading from "./components/Loading";
import Header from "./Header";
import { useState } from "react";

function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);
  const [ceramicData, setCeramicData] = useState({
    did: "",
    idx: "",
  });

  const appInfo = {
    appName: "polygon-africa-bootcamp",
  };

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: "#1A202C",
          overlayBlur: "small",
        })}
        showRecentTransactions={true}
        coolMode
        appInfo={appInfo}
        chains={chains}
      >
        <ChakraProvider>
          <LoadingContext.Provider value={{ loading, setLoading }}>
            <CeramicDataContext.Provider
              value={{ ceramicData, setCeramicData }}
            >
              <Loading />
              <Header />
              <Component {...pageProps} />
            </CeramicDataContext.Provider>
          </LoadingContext.Provider>
        </ChakraProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
