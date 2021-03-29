import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

interface TransactionProps {
  id: number;
  title: string;
  amount: number;
  type: string;
  category: string;
  createdAt: string;
}

type TransactionInputProps = Omit<TransactionProps, "id" | "createdAt">;

interface TransactionProviderProps {
  children: ReactNode;
}

interface TransactionContextData {
  transactions: TransactionProps[];
  createTransaction: (transaction: TransactionInputProps) => Promise<void>;
}

const TransactionsContext = createContext<TransactionContextData>(
  {} as TransactionContextData
);

export const TransactionsProvider = ({
  children,
}: TransactionProviderProps) => {
  const [transactions, setTransactions] = useState<TransactionProps[]>([]);

  useEffect(() => {
    (async () => {
      await api.get("/transactions").then((resp) => {
        setTransactions(resp.data.transactions);
      });
    })();
  }, []);

  const createTransaction = useCallback(
    async (transactionInput: TransactionInputProps) => {
      const response = await api.post("/transactions", {
        ...transactionInput,
        createdAt: new Date(),
      });

      const { transaction } = response.data;

      setTransactions([...transactions, transaction]);
    },
    [transactions]
  );

  return (
    <TransactionsContext.Provider value={{ transactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export function useTransactions() {
  const context = useContext(TransactionsContext);

  return context;
}
