import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { JUP_TOKEN } from './app.const';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/token')
  async getToken() {
    return await this.appService.getToken(JUP_TOKEN);
  }
}
