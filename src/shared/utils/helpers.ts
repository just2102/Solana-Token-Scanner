export async function delay(ms: number): Promise<void> {
  console.log('waiting for ' + ms + 'ms');
  return new Promise((resolve) => setTimeout(resolve, ms));
}
