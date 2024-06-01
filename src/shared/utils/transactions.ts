import { TokenBalance } from '@solana/web3.js';
import { CheckBuyTransactionResult } from 'src/app.types';

// should also check the invoked function is a swap (map function names for all aggregators)
export function checkBuyTransaction(
  preTokenBalances: TokenBalance[],
  token: string,
  postTokenBalances: TokenBalance[],
): CheckBuyTransactionResult {
  const preTokenBalance = preTokenBalances.find(
    (balance) => balance.mint === token,
  );
  const postTokenBalance = postTokenBalances.find(
    (balance) => balance.mint === token,
  );

  if (
    !preTokenBalance?.uiTokenAmount?.uiAmount ||
    !postTokenBalance?.uiTokenAmount?.uiAmount
  ) {
    return { isBuy: false };
  }

  const hasTokenAmountIncreased =
    postTokenBalance.uiTokenAmount.uiAmount >
    preTokenBalance.uiTokenAmount.uiAmount;

  if (!hasTokenAmountIncreased) {
    return { isBuy: false };
  }

  const otherTokenBalancesChanged = preTokenBalances.some((preBalance) => {
    const postBalance = postTokenBalances.find(
      (postBalance) => postBalance.mint === preBalance.mint,
    );
    return (
      postBalance &&
      postBalance.uiTokenAmount.uiAmount !==
        preBalance.uiTokenAmount.uiAmount &&
      preBalance.mint !== token
    );
  });

  if (!otherTokenBalancesChanged) {
    return { isBuy: false };
  }

  return {
    isBuy: true,
    preTokenBalance: preTokenBalance,
    postTokenBalance: postTokenBalance,
  };
}

export function getTokenSender(
  preTokenBalances: TokenBalance[],
  token: string,
  tokenRecipient: string | undefined,
  postTokenBalances: TokenBalance[],
): string | null {
  for (const postBalance of postTokenBalances) {
    if (!postBalance.uiTokenAmount.uiAmount) {
      continue;
    }

    if (postBalance.mint === token && postBalance.owner !== tokenRecipient) {
      const preBalanceOfSender = preTokenBalances.find(
        (balance) =>
          balance.mint === token && balance.owner === postBalance.owner,
      );

      if (
        preBalanceOfSender &&
        preBalanceOfSender.uiTokenAmount.uiAmount &&
        preBalanceOfSender.owner
      ) {
        if (
          postBalance.uiTokenAmount.uiAmount <
          preBalanceOfSender.uiTokenAmount.uiAmount
        ) {
          return preBalanceOfSender.owner;
        }
      }
    }
  }

  return null;
}
