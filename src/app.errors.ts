export class FailedToFetchTokenError extends Error {
  constructor(token: string, reason: string) {
    super(`Failed to fetch token ${token} because ${reason}`);
  }
}
