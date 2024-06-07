import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { isSolanaAddress } from './shared/utils/addresses';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/token/:address')
  async getToken(@Param('address') address: string) {
    if (!address || !isSolanaAddress(address)) {
      throw new HttpException('Invalid token address', 400);
    }

    return await this.appService.getToken(address);
  }
}
