import { PublicKey } from '@solana/web3.js';

export function isSolanaAddress(address: string) {
  try {
    new PublicKey(address);

    return true;
  } catch (err) {
    return false;
  }
}
