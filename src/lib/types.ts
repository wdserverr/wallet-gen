export interface Transaction {
  epoch: number;
  hash: string;
  url: string;
}

export interface AddressData {
  address: string;
  balance: string;
  nonce: number;
  balance_raw: string;
  has_public_key: boolean;
  transaction_count: number;
  recent_transactions: Transaction[];
  error: string | null
} 