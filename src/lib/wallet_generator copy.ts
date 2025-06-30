import nacl from "tweetnacl";
import bip39 from "bip39";

// Type definitions
export interface WalletData {
  mnemonic: string[];
  seed_hex: string;
  private_key_hex: string;
  public_key_hex: string;
  private_key_b64: string;
  public_key_b64: string;
  address: string;
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function base64Encode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

function base58Encode(buffer: Uint8Array): string {
  let num = BigInt("0x" + bufferToHex(buffer));
  let encoded = "";
  while (num > 0n) {
    const remainder = num % 58n;
    num = num / 58n;
    encoded = BASE58_ALPHABET[Number(remainder)] + encoded;
  }
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = "1" + encoded;
  }
  return encoded;
}

function createOctraAddress(publicKey: Uint8Array): string {
  // Use browser crypto.subtle for SHA-256
  // This function must be async in browser
  throw new Error("Use createOctraAddressAsync in browser");
}

export async function createOctraAddressAsync(publicKey: Uint8Array): Promise<string> {
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", publicKey);
  const hash = new Uint8Array(hashBuffer);
  const base58Hash = base58Encode(hash);
  return "oct" + base58Hash;
}

export async function generateWallet(): Promise<WalletData> {
  const entropy = window.crypto.getRandomValues(new Uint8Array(16));
  const mnemonic = bip39.entropyToMnemonic(bufferToHex(entropy));
  const mnemonicWords = mnemonic.split(" ");
  const seed = bip39.mnemonicToSeedSync(mnemonic); // returns Buffer, but works as Uint8Array
  const privateKey = new Uint8Array(seed).slice(0, 32);
  const keyPair = nacl.sign.keyPair.fromSeed(privateKey);
  const publicKey = keyPair.publicKey;
  const address = await createOctraAddressAsync(publicKey);
  return {
    mnemonic: mnemonicWords,
    seed_hex: bufferToHex(seed),
    private_key_hex: bufferToHex(privateKey),
    public_key_hex: bufferToHex(publicKey),
    private_key_b64: base64Encode(privateKey),
    public_key_b64: base64Encode(publicKey),
    address,
  };
}

export async function importWalletFromMnemonic(mnemonic: string): Promise<WalletData> {
  const mnemonicWords = mnemonic.trim().split(/\s+/);
  if (!bip39.validateMnemonic(mnemonicWords.join(" "))) {
    throw new Error("Invalid mnemonic");
  }
  const seed = bip39.mnemonicToSeedSync(mnemonicWords.join(" "));
  const privateKey = new Uint8Array(seed).slice(0, 32);
  const keyPair = nacl.sign.keyPair.fromSeed(privateKey);
  const publicKey = keyPair.publicKey;
  const address = await createOctraAddressAsync(publicKey);
  return {
    mnemonic: mnemonicWords,
    seed_hex: bufferToHex(seed),
    private_key_hex: bufferToHex(privateKey),
    public_key_hex: bufferToHex(publicKey),
    private_key_b64: base64Encode(privateKey),
    public_key_b64: base64Encode(publicKey),
    address,
  };
}
