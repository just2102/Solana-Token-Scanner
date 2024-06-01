import { LatestTx, Pair } from './app.types';

export type ScreenerResponse = {
  schemaVersion: string;
  pairs: Pair[] | null;
};

export class GetTokenResponseDto {
  liquidity: number;
  latestBuyTx: LatestTx | null;

  constructor(liquidity: number, latestBuyTx: LatestTx | null) {
    this.liquidity = liquidity;

    this.latestBuyTx = latestBuyTx;
  }
}
