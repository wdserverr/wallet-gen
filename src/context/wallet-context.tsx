"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getKeypair, WalletData } from "@/lib/wallet_generator";
import { SignKeyPair } from "tweetnacl";
import { AddressData } from "@/lib/types";

interface WalletContextType {
  wallet: WalletData | null;
  addressData: AddressData | null;
  setAddressData: (addressData: AddressData | null) => void;
  setWallet: (wallet: WalletData | null) => void;
  keypair: SignKeyPair | null;
  setKeypair: (keypair: SignKeyPair | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [keypair, setKeypair] = useState<SignKeyPair | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("wallet");
    if (stored) {
      const parsed: WalletData = JSON.parse(stored);
      setWallet(parsed || null);
      setKeypair(getKeypair(parsed.mnemonic.join(" ")));
    }
  }, []);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        keypair,
        setKeypair,
        addressData,
        setAddressData,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
