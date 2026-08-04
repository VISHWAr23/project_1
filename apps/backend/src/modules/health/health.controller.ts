import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check API gateway status' })
  check() {
    return {
      status: 'ok',
      service: 'IMS Enterprise API Gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
