import { Controller, Post, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {

  constructor(private readonly uploadsService: UploadsService) {}

  @Post('upload')
  async uploadFile(@Req() req: FastifyRequest) {
    await this.uploadsService.fileValidation(req.file());
  }
}