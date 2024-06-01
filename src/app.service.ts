import { Injectable } from '@nestjs/common';
import { FailedToFetchTokenError } from './app.errors';
import { GetTokenResponseDto, ScreenerResponse } from './app.dto';
import {
  ConfirmedSignatureInfo,
  Connection,
  ParsedTransactionWithMeta,
  PublicKey,
} from '@solana/web3.js';
import {
  checkBuyTransaction,
  getTokenSender,
} from './shared/utils/transactions';
import { LatestTx } from './app.types';
import { delay } from './shared/utils/helpers';

@Injectable()
export class AppService {
  private connection: Connection;
  private latestBuyTx: LatestTx | null = null; // can also be cached in Redis

  constructor() {
    if (!process.env.SOLANA_URL) {
      throw 'No solana URL set, check env config';
    }
    this.connection = new Connection(process.env.SOLANA_URL);
  }

  async getToken(token: string) {
    const [dexScreenerRes, latestBuyTx] = await Promise.all([
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${token}`),
      this.getLatestTxForToken(token),
    ]);

    if (!dexScreenerRes.ok) {
      throw new FailedToFetchTokenError(token, dexScreenerRes.statusText);
    }

    const dexScreenerJson = (await dexScreenerRes.json()) as ScreenerResponse;
    if (!dexScreenerJson.pairs) {
      throw new FailedToFetchTokenError(token, 'no pairs found');
    }

    return new GetTokenResponseDto(
      dexScreenerJson.pairs[0].liquidity?.usd || 0,
      latestBuyTx,
    );
  }

  private async getLatestTxForToken(token: string): Promise<LatestTx | null> {
    const tokenPublicKey = new PublicKey(token);
    const LIMIT_MULTIPLIER = 1.5;
    const MAX_RETRIES = 5;
    const INITIAL_DELAY_MS = 50;

    let limit = 30;
    let retryCount = 0;
    let delayMs = INITIAL_DELAY_MS;

    while (retryCount < MAX_RETRIES) {
      const nonErrorSignatures = await this.fetchRecentSignatures(
        tokenPublicKey,
        limit,
      );

      if (nonErrorSignatures.length === 0) {
        await delay(delayMs);
        limit *= LIMIT_MULTIPLIER;
        retryCount++;
        delayMs *= 2;
        continue;
      }

      const transactions = await this.fetchTransactions(nonErrorSignatures);

      const latestBuyTx = this.findLatestBuyTx(transactions, token);

      if (latestBuyTx) {
        this.latestBuyTx = latestBuyTx;
        return latestBuyTx;
      }

      limit = Math.round(limit * LIMIT_MULTIPLIER);
      retryCount++;
      await delay(delayMs);
      delayMs *= 2;
    }

    console.warn(
      `No buy transactions found for token ${token} after multiple retries`,
    );
    if (this.latestBuyTx) {
      return this.latestBuyTx;
    }

    return null;
  }

  private async fetchRecentSignatures(
    tokenPublicKey: PublicKey,
    limit: number,
  ): Promise<ConfirmedSignatureInfo[]> {
    const recentSignatures =
      await this.connection.getConfirmedSignaturesForAddress2(tokenPublicKey, {
        limit: Math.floor(limit),
      });

    return recentSignatures.filter(
      (signatureInfo) => signatureInfo.err === null,
    );
  }

  private async fetchTransactions(
    nonErrorSignatures: ConfirmedSignatureInfo[],
  ): Promise<ParsedTransactionWithMeta[]> {
    const txPromises = nonErrorSignatures.map(async (signatureInfo) => {
      const tx = await this.connection.getParsedTransaction(
        signatureInfo.signature,
        { maxSupportedTransactionVersion: 0 },
      );
      return tx;
    });

    const transactions = await Promise.all(txPromises);

    return transactions.filter(
      (tx): tx is ParsedTransactionWithMeta => tx !== null,
    );
  }

  private findLatestBuyTx(
    transactions: ParsedTransactionWithMeta[],
    token: string,
  ): LatestTx | null {
    for (const tx of transactions) {
      if (
        !tx?.meta?.preTokenBalances?.length ||
        !tx?.meta?.postTokenBalances?.length
      ) {
        continue;
      }

      const buyTransactionData = checkBuyTransaction(
        tx.meta.preTokenBalances,
        token,
        tx.meta.postTokenBalances,
      );

      if (!buyTransactionData.isBuy) {
        continue;
      }

      const { preTokenBalance, postTokenBalance } = buyTransactionData;

      if (
        !postTokenBalance.owner ||
        !preTokenBalance.uiTokenAmount.uiAmount ||
        !postTokenBalance.uiTokenAmount.uiAmount
      ) {
        continue;
      }

      const amountBought =
        postTokenBalance.uiTokenAmount.uiAmount -
        preTokenBalance.uiTokenAmount.uiAmount;

      const senderFromInstructions = tx.transaction.message.instructions.find(
        (instruction) => {
          if ('accounts' in instruction && instruction.accounts.length > 0) {
            return instruction;
          }
        },
      )?.programId;

      return {
        slot: tx.slot,
        hash: tx.transaction.signatures[0],
        sender: getTokenSender(
          tx.meta.preTokenBalances,
          token,
          postTokenBalance.owner,
          tx.meta.postTokenBalances,
        ),
        recipient: tx.transaction.message.accountKeys[0].pubkey.toString(),
        amount: amountBought.toFixed(postTokenBalance.uiTokenAmount.decimals),

        dapp: senderFromInstructions?.toString(),
      };
    }

    return null;
  }
}
