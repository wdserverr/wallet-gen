import React, { useState } from "react";
import { useWallet } from "@/context/wallet-context";
import { sendTransaction } from "@/lib/wallet_generator";
import Button from "@/components/ui/button";
import { Send, Plus } from "lucide-react";

export default function BatchSend() {
  const { wallet, keypair, addressData } = useWallet();
  const [recipients, setRecipients] = useState([
    { to: "", amount: "" },
  ]);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [useStaticAmount, setUseStaticAmount] = useState(false);
  const [staticAmount, setStaticAmount] = useState("");

  const handleRecipientChange = (idx: number, field: string, value: string) => {
    setRecipients((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRecipient = () => {
    setRecipients((prev) => [...prev, { to: "", amount: "" }]);
  };

  const handleSendAll = async () => {
    setError("");
    setResults([]);
    if (!wallet || !keypair || !addressData) {
      setError("Wallet not connected or data not loaded.");
      return;
    }
    if (useStaticAmount && !staticAmount) {
      setError("Please enter a static amount.");
      return;
    }
    setLoading(true);
    let nonce = addressData.nonce + 1;
    const txResults = [];
    for (const { to, amount } of recipients) {
      if (!to || (!amount && !useStaticAmount)) {
        txResults.push({ to, amount, error: "Missing address or amount" });
        continue;
      }
      if (to.toLowerCase() === addressData.address.toLowerCase()) {
        txResults.push({ to, amount, error: "Cannot send to yourself!" });
        continue;
      }
      try {
        const sendAmt = useStaticAmount ? staticAmount : amount;
        const result = await sendTransaction(
          keypair,
          wallet.address,
          to,
          sendAmt,
          nonce
        );
        txResults.push({ to, amount: sendAmt, result });
        nonce++;
      } catch (e: any) {
        txResults.push({ to, amount: useStaticAmount ? staticAmount : amount, error: e.message });
        nonce++;
      }
    }
    setResults(txResults);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-gray-900 rounded-2xl shadow-2xl p-8 space-y-8 animate-fade-in">
      <h2 className="text-2xl font-extrabold text-blue-800 dark:text-blue-200 mb-4 tracking-tight flex items-center gap-2">
        <Send className="w-6 h-6 text-blue-500 animate-bounce" /> Batch Send Transactions
      </h2>
      <div className="flex items-center gap-2 mb-4 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shadow-sm">
        <input
          id="static-amount"
          type="checkbox"
          checked={useStaticAmount}
          onChange={() => setUseStaticAmount((v) => !v)}
          className="accent-blue-600 w-4 h-4 transition-all duration-200"
        />
        <label htmlFor="static-amount" className="text-blue-800 dark:text-blue-200 text-sm select-none font-medium">
          Use static amount for all recipients
        </label>
        {useStaticAmount && (
          <input
            className="ml-4 w-40 px-3 py-2 border-2 border-blue-300 dark:border-blue-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-200 shadow-sm"
            type="number"
            placeholder="Static Amount"
            value={staticAmount}
            onChange={(e) => setStaticAmount(e.target.value)}
          />
        )}
      </div>
      <div className="flex flex-col gap-4">
        {recipients.map((r, idx) => (
          <div
            key={idx}
            className="flex gap-2 items-center bg-white dark:bg-gray-800 rounded-lg shadow p-3 animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <input
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-200"
              type="text"
              placeholder="Recipient Address"
              value={r.to}
              onChange={(e) => handleRecipientChange(idx, "to", e.target.value)}
            />
            {!useStaticAmount && (
              <input
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white transition-all duration-200"
                type="number"
                placeholder="Amount"
                value={r.amount}
                onChange={(e) => handleRecipientChange(idx, "amount", e.target.value)}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 rounded bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-700 transition self-start shadow-md mt-2 animate-fade-in"
          onClick={handleAddRecipient}
        >
          <Plus className="w-4 h-4" /> Add Recipient
        </button>
        <div className="border-t border-blue-200 dark:border-blue-700 my-4" />
        <Button
          Icon={Send}
          text={loading ? "Sending..." : "Send All"}
          onClick={handleSendAll}
        />
        {error && <div className="text-red-500 text-sm animate-fade-in">{error}</div>}
        {results.length > 0 && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Results:</h3>
            {results.map((res, i) => (
              <div key={i} className={`text-xs font-mono break-all flex items-center gap-2 rounded p-2 ${res.error ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'} animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
                <span className="font-semibold">[{i + 1}]</span> To: {res.to}, Amount: {res.amount} - {res.error ? <span>Error: {res.error}</span> : <span>Success</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* Add this to your global CSS (e.g., globals.css):
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.5s ease;
}
*/ 