"use client";
import { useEffect, useState } from "react";
import {
  handleGenerateWallet,
  handleImportWallet,
  handleTestSign,
  WalletData,
  TestSign,
  getKeypair,
} from "@/lib/wallet_generator";
import { FilePen, Import, SquarePlus, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import { SignKeyPair } from "tweetnacl";
export default function Home() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [keypair, setKeypair] = useState<SignKeyPair | null>(null);
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [error, setError] = useState("");
  const [invalidMnemonic, setInvalidMnemonic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<TestSign | null>(null);

  const handleGenerate = async () => {
    setError("");
    setLoading(true);
    try {
      const w = await handleGenerateWallet();
      setWallet(w.walletData);
      setKeypair(w.keypair);
      window.localStorage.setItem("wallet", JSON.stringify(w.walletData));
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleImport = async () => {
    setError("");
    setLoading(true);
    setInvalidMnemonic(false);
    try {
      if (!mnemonicInput.length) {
        setTimeout(() => {
          setLoading(false);
          setInvalidMnemonic(true);
        }, 2000);
        return;
      }
      const w = await handleImportWallet(mnemonicInput);
      setWallet(w.walletData);
      setKeypair(w.keypair);
      window.localStorage.setItem("wallet", JSON.stringify(w.walletData));
      setInvalidMnemonic(false);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    let wallet = window.localStorage.getItem("wallet");
    if (wallet) {
      const parsedWallet: WalletData = JSON.parse(wallet);
      setWallet(parsedWallet);
      const keyPair = getKeypair(parsedWallet.mnemonic.join(" "));
      setKeypair(keyPair);
    }
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
          <img src={"/logo.svg"} width={35} />
          Octra Wallet
        </h1>

        {keypair && (
          <>
            {signature ? (
              <Button
                Icon={Trash2}
                text={"Remove Signature"}
                color="red"
                onClick={() => setSignature(null)}
              />
            ) : (
              <Button
                Icon={FilePen}
                text={"Test Sign"}
                color="blue"
                onClick={() => setSignature(handleTestSign(keypair))}
              />
            )}
          </>
        )}
        {signature && (
          <div className="break-all text-gray-800 bg-gray-100 p-2 rounded-md   dark:text-gray-100 font-mono text-xs">
            {JSON.stringify(signature, null, 2)}
          </div>
        )}
        {!wallet && (
          <div className="flex flex-col gap-4">
            <Button
              Icon={SquarePlus}
              text={loading ? "Generating..." : "Generate New Wallet"}
              color="blue"
              onClick={handleGenerate}
            />
            <div className="flex flex-col gap-2">
              <input
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
                type="text"
                placeholder="Enter mnemonic to import"
                value={mnemonicInput}
                onChange={(e) => setMnemonicInput(e.target.value)}
                disabled={loading}
              />
              <Button
                Icon={Import}
                text={loading ? "Importing..." : "Import Wallet"}
                color="green"
                onClick={handleImport}
              />
              {invalidMnemonic && (
                <div className="text-red-500">
                  Cannot import menmonic is invalid
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-center font-medium">{error}</div>
        )}
        {wallet && (
          <div className="mt-6 space-y-4">
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Address:
              </div>
              <div className="break-all text-blue-700 dark:text-blue-300 font-mono">
                {wallet.address}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Mnemonic:
              </div>
              <div className="break-all text-gray-800 dark:text-gray-100 font-mono text-sm">
                {wallet.mnemonic.join(" ")}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Public Key:
              </div>
              <div className="break-all text-gray-800 dark:text-gray-100 font-mono text-xs">
                {wallet.public_key_hex}
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Private Key:
              </div>
              <div className="break-all text-gray-800 dark:text-gray-100 font-mono text-xs">
                {wallet.private_key_hex}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Raw Json:
              </div>
              <div className="break-all text-gray-800 bg-gray-100 p-2 rounded-md   dark:text-gray-100 font-mono text-xs">
                {JSON.stringify(wallet, null, 2)}
              </div>
            </div>
            <Button
              onClick={() => {
                window.localStorage.removeItem("wallet");
                setWallet(null);
              }}
              Icon={Trash2}
              text="Delete Wallet"
              color="red"
            />

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Send / Receive (Coming Soon)
              </h2>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 text-gray-500 dark:text-gray-400 text-center">
                This feature will allow you to send and receive tokens.
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Transaction History (Coming Soon)
              </h2>
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 text-gray-500 dark:text-gray-400 text-center">
                Your recent transactions will appear here.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
