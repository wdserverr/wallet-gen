"use client";
import Home from "@/components/Home";
import Transfer from "@/components/Transfer";
import { useWallet } from "@/context/wallet-context";
export default function Page() {
  const { wallet } = useWallet();
  return (
    <div className="min-h-screen bg-slate-500 dark:bg-gray-900 flex max-lg:flex-col max-lg:items-center justify-center p-4 gap-8">
      <Home />
      {wallet && <Transfer />}
    </div>
  );
}
