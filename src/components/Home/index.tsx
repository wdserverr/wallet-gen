"use client";
import { useEffect, useState, useRef } from "react";
import {
  handleGenerateWallet,
  handleImportWallet,
  handleTestSign,
  WalletData,
  TestSign,
  getKeypair,
} from "@/lib/wallet_generator";
import {
  FilePen,
  Import,
  SquarePlus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Github,
} from "lucide-react";
import Button from "@/components/ui/button";
import { SignKeyPair } from "tweetnacl";
import { useWallet } from "@/context/wallet-context";
import bip39 from "bip39";

export default function Home() {
  const { wallet, setWallet, keypair, setKeypair } = useWallet();
  const [mnemonicInput, setMnemonicInput] = useState("");
  const [error, setError] = useState("");
  const [invalidMnemonic, setInvalidMnemonic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<TestSign | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);

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
      if (!bip39.validateMnemonic(mnemonicInput.trim())) {
        setError("Invalid mnemonic phrase.");
        setInvalidMnemonic(true);
        setLoading(false);
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

  const handleCopy = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
      <div className="flex items-center justify-between p-2 bg-gray-200 font-medium rounded-md">
        <div>Source Code</div>
        <a
          href="https://github.com/wdserverr/wallet-gen" // TODO: Replace with your actual repo URL
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors shadow-md"
        >
          <Github className="w-5 h-5" />
          <span className="font-semibold">GitHub</span>
        </a>
      </div>
      <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
        <img src={"/logo.svg"} width={35} />
        <div>Octra Wallet</div>
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

          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-center font-medium">{error}</div>
      )}
      {wallet && (
        <div className="mt-6 space-y-4">
          <div className="relative group bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-4 shadow-md flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-700 dark:text-gray-200">
                Address:
              </div>
              <button
                className="ml-2 p-1 hover:cursor-pointer rounded hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                onClick={handleCopy}
                aria-label="Copy address"
              >
                <Copy className="w-4 h-4 text-blue-600 dark:text-blue-300" />
              </button>
              <span
                className={`ml-2 text-xs text-green-600 dark:text-green-400 transition-opacity duration-300 ${
                  copied ? "opacity-100" : "opacity-0"
                }`}
              >
                Copied!
              </span>
            </div>
            <div
              ref={addressRef}
              className="break-all text-blue-700 dark:text-blue-300 font-mono text-lg select-all"
            >
              {wallet.address}
            </div>
          </div>
          <button
            className={
              `flex items-center hover:cursor-pointer gap-2 text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2 focus:outline-none transition-colors rounded-lg px-3 py-2 ` +
              `hover:bg-blue-100 dark:hover:bg-blue-900 active:bg-blue-200 dark:active:bg-blue-800`
            }
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
          >
            Wallet Details
            <span
              className={`transition-transform duration-300 ${
                detailsOpen ? "rotate-180" : ""
              }`}
            >
              <ChevronUp className="w-5 h-5" />
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 ${
              detailsOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            } bg-white dark:bg-gray-900 rounded-lg shadow-inner`}
            style={{ willChange: "max-height, opacity" }}
          >
            {detailsOpen && (
              <div className="space-y-4 p-4 animate-fade-in">
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
                    Public Key B64:
                  </div>
                  <div className="break-all text-gray-800 dark:text-gray-100 font-mono text-xs">
                    {wallet.public_key_b64}
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
                <div>
                  <div className="font-semibold text-gray-700 dark:text-gray-200">
                    Private Key B64:
                  </div>
                  <div className="break-all text-gray-800 dark:text-gray-100 font-mono text-xs">
                    {wallet.private_key_b64}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="font-semibold text-gray-700 dark:text-gray-200">
                    Raw Json:
                  </div>
                  <div className="break-all text-gray-800 bg-gray-100 p-2 rounded-md dark:text-gray-100 font-mono text-xs">
                    {JSON.stringify(wallet, null, 2)}
                  </div>
                </div>
                {/* <Button
                  onClick={() => {
                    window.localStorage.removeItem("wallet");
                    setWallet(null);
                    setKeypair(null);
                  }}
                  Icon={Trash2}
                  text="Delete Wallet"
                  color="red"
                /> */}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
