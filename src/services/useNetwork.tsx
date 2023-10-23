import { MAINNET, TESTNET } from "kujira.js";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from "react";
import config from "../../config.json";

const networks = Object.keys(config.chains);

export interface Context {
  networks: string[];
  network: string;
  setNetwork: (network: string) => void;
}

//create a context with default values
const Context = createContext<Context>({
  networks: [MAINNET, TESTNET],
  network: TESTNET,
  setNetwork: () => {
    throw new Error("NetworkContext not created");
  },
});

//component that utilizes useState to manage the current network selection
//and provides the network context to its children (networks, network, setNetwork)
export const NetworkContext: FC<PropsWithChildren> = ({ children }) => {
  const [network, setNetwork] = useState(networks[0]);
  return (
    <Context.Provider
      value={{
        network,
        setNetwork,
        networks,
      }}
    >
      {children}
    </Context.Provider>
  );
};

//hook to get the current network
export const useNetwork = () => useContext(Context);

//component to render a dropdown for network selection
export const NetworkSelect = () => {
  const { networks, network, setNetwork } = useNetwork();
  return (
    <select
      name="network"
      id="network"
      value={network}
      onChange={(e) => setNetwork(e.currentTarget.value)}
    >
      {networks.map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
};
