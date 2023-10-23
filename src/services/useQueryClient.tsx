import {
  HttpBatchClient,
  StatusResponse,
  Tendermint37Client,
} from "@cosmjs/tendermint-rpc";
import { KujiraQueryClient, kujiraQueryClient } from "kujira.js";
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { chains } from "../config";
import { useNetwork } from "./useNetwork";

//Function to establish a connection to a Tendermint node, returning a client and status.
const toClient = async (
  url: string
): Promise<[Tendermint37Client, StatusResponse]> => {
  // eslint-disable-next-line no-useless-catch
  try {
    const http = new HttpBatchClient(url, { batchSizeLimit: 100 });
    const tm = await Tendermint37Client.create(http);
    const status = await tm.status();
    return [tm, status];
  } catch (error) {
    throw error;
  }
};

// based on the network selected, create a client to connect to the Tendermint node
export const createTmClient = async (network: string) => {
  if (!(network in chains))
    throw new Error(`No config available for ${network}`);
  // goes over each validators object in the config and returns only the rpc_url
  const rpcs = chains[network].validators.map((n) => n.rpc_url);
  return Promise.any(rpcs.map(toClient));
};

// Defines and creates a React context for sharing blockchain connection and status.
export interface Context {
  queryClient?: KujiraQueryClient;
  tmClient?: Tendermint37Client;
  status?: StatusResponse | null;
}

const Context = createContext<Context>({});

// Component that reacts on a change in the network and creates a new client.
export const QueryContext: FC<PropsWithChildren> = ({ children }) => {
  const [tmClient, setTmClient] = useState<Tendermint37Client>();
  const [status, setStatus] = useState<StatusResponse | null>();
  const { network } = useNetwork();
  // overwrites the tmClient and status state with the new client and status
  useEffect(() => {
    createTmClient(network)
      .then(([tmClient, status]) => {
        setTmClient(tmClient);
        setStatus(status);
      })
      .catch((err) => {
        console.error(err);
        setStatus(null);
      });
  }, [network]);
  return (
    <Context.Provider
      value={{
        queryClient: tmClient && kujiraQueryClient({ client: tmClient }),
        status,
        tmClient,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useQueryClient = () => useContext(Context);
