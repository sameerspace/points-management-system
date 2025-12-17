import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiHealthCheck } from './app/decorators/health-check.decorator';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @ApiHealthCheck()
  getHello(): string {
    return this.appService.getHello();
  }
}
