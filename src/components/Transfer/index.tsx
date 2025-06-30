import React, { useState, useEffect } from "react";
import { useWallet } from "@/context/wallet-context";
import { sendTransaction, signTransaction } from "@/lib/wallet_generator";
import Button from "@/components/ui/button";
import { Send } from "lucide-react";
import { AddressData, Transaction } from "@/lib/types";

function Transfer() {
  const { wallet, keypair, addressData, setAddressData } = useWallet();
  const [loading, setLoading] = useState(false);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchAddressData(address: string): Promise<AddressData> {
    const response = await fetch(`api/info?address=${address}`);

    if (!response.ok) {
      throw new Error(`Network response was not ok for address ${address}`);
    }

    return await response.json();
  }
  useEffect(() => {
    if (wallet?.address) {
      setLoading(true);
      const fetchAndSet = () => {
        fetchAddressData(wallet.address)
          .then((res) => {
            if (res.error) {
              return;
            } else {
              setAddressData(res);
            }
          })
          .catch((err) => setError("Failed to fetch account data."))
          .finally(() => setLoading(false));
      };
      fetchAndSet();
      const interval = setInterval(fetchAndSet, 10000);
      return () => clearInterval(interval);
    }
  }, [wallet?.address]);

  const handleTransfer = async () => {
    setError("");
    setSuccess("");
    if (!wallet || !keypair || !addressData) {
      setError("Wallet not connected or data not loaded.");
      return;
    }
    if (!to || !amount) {
      setError("Please fill in all fields.");
      return;
    }
    if (to.toLowerCase() === addressData.address.toLowerCase()) {
      setError("Cannot send to yourself!");
      return
    }
    try {
      const result = await sendTransaction(
        keypair,
        wallet.address,
        to,
        amount,
        addressData?.nonce + 1
      );
      setSuccess(`Result: ${JSON.stringify(result)}`);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const balance = addressData
    ? parseFloat(addressData.balance).toFixed(4)
    : "0.00";
  const nonce = addressData ? addressData.nonce : 0;

  return (
    <div className="min-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Send Transaction
        </h2>
        <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 rounded p-3 mb-2">
          <div className="text-gray-700 dark:text-gray-200 font-semibold">
            Balance:{" "}
            <span className="font-mono">
              {loading ? "Loading..." : `${balance} OCT`}
            </span>
          </div>
          <div className="text-gray-700 dark:text-gray-200 font-semibold">
            Nonce: <span className="font-mono">{loading ? "..." : nonce}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            type="text"
            placeholder="Recipient Address"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button Icon={Send} text="Sign and Send" onClick={handleTransfer} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && (
          <div className="text-green-500 text-sm break-all max-w-md">
            {success}
          </div>
        )}
      </div>

      <div className="mt-4 ">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Recent Transactions
        </h2>
        <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Loading...
            </p>
          ) : addressData && addressData.recent_transactions.length > 0 ? (
            addressData.recent_transactions.map((tx, i) => (
              <div
                key={tx.hash}
                className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all flex gap-2"
              >
                <div>{`[${i + 1}]`}</div>
                <a
                  href={`https://octrascan.io${tx.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {tx.hash}
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No recent transactions found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transfer;
