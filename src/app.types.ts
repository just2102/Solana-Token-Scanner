import { TokenBalance } from '@solana/web3.js';

interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface Liquidity {
  usd?: number;
  base: number;
  quote: number;
}

export interface Pair {
  chainId: string; // 'solana'
  dexId: string;
  url: string;
  pairAddress: string;

  baseToken: Token;
  quoteToken: Token;

  priceUsd: string;
  liquidity?: Liquidity;
}

export interface LatestTx {
  hash: string;
  slot: number;
  sender: string | null;
  recipient: string;
  amount: string;

  dapp?: string; // address for now, ideally map known dexes' addresses
}

interface BuyTransaction {
  isBuy: true;
  preTokenBalance: TokenBalance;
  postTokenBalance: TokenBalance;
}

interface NotBuyTransaction {
  isBuy: false;
}

export type CheckBuyTransactionResult = BuyTransaction | NotBuyTransaction;
