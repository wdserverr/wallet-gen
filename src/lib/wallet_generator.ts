import nacl, { SignKeyPair } from "tweetnacl";
import { entropyToMnemonic, mnemonicToSeedSync } from "bip39";
import crypto, { Sign } from "crypto";


interface MasterKey {
  masterPrivateKey: Buffer;
  masterChainCode: Buffer;
}
function generateEntropy(strength: number = 128): Buffer {
  if (![128, 160, 192, 224, 256].includes(strength)) {
    throw new Error("Strength must be 128, 160, 192, 224 or 256 bits");
  }
  return crypto.randomBytes(strength / 8);
}
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


const BASE58_ALPHABET: string =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
// Derive master key using HMAC-SHA512 with "Octra seed"
function deriveMasterKey(seed: Buffer): MasterKey {
  const key: Buffer = Buffer.from("Octra seed", "utf8");
  const mac: Buffer = crypto.createHmac("sha512", key).update(seed).digest();

  const masterPrivateKey: Buffer = mac.slice(0, 32);
  const masterChainCode: Buffer = mac.slice(32, 64);

  return { masterPrivateKey, masterChainCode };
}
export interface WalletData {
  mnemonic: string[];
  seed_hex: string;
  master_chain_hex: string;
  private_key_hex: string;
  public_key_hex: string;
  private_key_b64: string;
  public_key_b64: string;
  address: string;
  entropy_hex: string;
}
export interface TestSign {
  message: string;
  signature: string;
  signatureValid: boolean;
}

function base58Encode(buffer: Buffer): string {
  if (buffer.length === 0) return "";

  let num: bigint = BigInt("0x" + buffer.toString("hex"));
  let encoded: string = "";

  while (num > 0n) {
    const remainder: bigint = num % 58n;
    num = num / 58n;
    encoded = BASE58_ALPHABET[Number(remainder)] + encoded;
  }

  // Handle leading zeros
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    encoded = "1" + encoded;
  }

  return encoded;
}
function bufferToHex(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString("hex");
}

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}
function createOctraAddress(publicKey: Buffer): string {
  const hash: Buffer = crypto.createHash("sha256").update(publicKey).digest();
  const base58Hash: string = base58Encode(hash);
  return "oct" + base58Hash;
}

function verifyAddressFormat(address: string): boolean {
  if (!address.startsWith("oct")) return false;
  if (address.length !== 47) return false;

  const base58Part: string = address.slice(3);
  for (const char of base58Part) {
    if (!BASE58_ALPHABET.includes(char)) return false;
  }

  return true;
}

function base64Encode(buffer: Buffer | Uint8Array): string {
  return Buffer.from(buffer).toString("base64");
}
export function handleTestSign(keypair: SignKeyPair): TestSign {
  const message = "This is a test message";
  const signature = nacl.sign.detached(
    new TextEncoder().encode(message),
    keypair.secretKey
  );
  const signatureValid = nacl.sign.detached.verify(
    new TextEncoder().encode(message),
    signature,
    keypair.publicKey
  );
  return {
    message,
    signature: bufferToHex(signature),
    signatureValid,
  };
}

export function signTransaction(
  keypair: SignKeyPair,
  from: string,
  to: string,
  amount: number
) {
  const transaction = { from, to, amount};
  const messageBytes = new TextEncoder().encode(JSON.stringify(transaction));
  const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
  return {
    transaction,
    signature: bufferToHex(signature),
  };
}

export async function handleGenerateWallet(): Promise<{ walletData: WalletData, keypair: SignKeyPair }> {
  const entropy: Buffer = generateEntropy(128);
  const mnemonic: string = entropyToMnemonic(
    entropy.toString("hex")
  );
  const mnemonicWords: string[] = mnemonic.split(" ");
  const seed: Buffer = mnemonicToSeedSync(mnemonic);
  const { masterPrivateKey, masterChainCode }: MasterKey = deriveMasterKey(seed);
  const keyPair = nacl.sign.keyPair.fromSeed(masterPrivateKey);
  const privateKeyRaw: Buffer = Buffer.from(
    keyPair.secretKey.slice(0, 32)
  );
  const publicKeyRaw: Buffer = Buffer.from(keyPair.publicKey);
  const address: string = createOctraAddress(publicKeyRaw);
  if (!verifyAddressFormat(address)) {
    console.log("ERROR: Invalid address format generated")
    throw new Error("Invalid address format generated");
  }

  const walletData: WalletData = {
    mnemonic: mnemonicWords,
    seed_hex: bufferToHex(seed),
    master_chain_hex: bufferToHex(masterChainCode),
    private_key_hex: bufferToHex(privateKeyRaw),
    public_key_hex: bufferToHex(publicKeyRaw),
    private_key_b64: base64Encode(privateKeyRaw),
    public_key_b64: base64Encode(publicKeyRaw),
    address: address,
    entropy_hex: bufferToHex(entropy)
  };

  return {
    walletData,
    keypair: keyPair
  };
}

export function getKeypair(mnemonic: string): SignKeyPair {
  const seed: Buffer = mnemonicToSeedSync(mnemonic);
  const { masterPrivateKey, masterChainCode }: MasterKey = deriveMasterKey(seed);
  const keyPair = nacl.sign.keyPair.fromSeed(masterPrivateKey);
  return keyPair
}

export async function handleImportWallet(mnemonic: string): Promise<{ walletData: WalletData, keypair: SignKeyPair }> {
  const entropy: Buffer = generateEntropy(128);
  const mnemonicWords: string[] = mnemonic.split(" ");
  const seed: Buffer = mnemonicToSeedSync(mnemonic);
  const { masterPrivateKey, masterChainCode }: MasterKey = deriveMasterKey(seed);
  const keyPair = nacl.sign.keyPair.fromSeed(masterPrivateKey);
  const privateKeyRaw: Buffer = Buffer.from(
    keyPair.secretKey.slice(0, 32)
  );
  const publicKeyRaw: Buffer = Buffer.from(keyPair.publicKey);
  const address: string = createOctraAddress(publicKeyRaw);
  if (!verifyAddressFormat(address)) {
    console.log("ERROR: Invalid address format generated")
    throw new Error("Invalid address format generated");
  }
  const walletData: WalletData = {
    mnemonic: mnemonicWords,
    seed_hex: bufferToHex(seed),
    master_chain_hex: bufferToHex(masterChainCode),
    private_key_hex: bufferToHex(privateKeyRaw),
    public_key_hex: bufferToHex(publicKeyRaw),
    private_key_b64: base64Encode(privateKeyRaw),
    public_key_b64: base64Encode(publicKeyRaw),
    address: address,
    entropy_hex: bufferToHex(entropy)
  };

  return {
    walletData,
    keypair: keyPair
  };
}