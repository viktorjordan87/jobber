import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MultipartFile } from '@fastify/multipart';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOAD_FILE_PATH } from './upload.const';

@Injectable()
export class UploadsService {
  generateUniqueFileName(fieldName: string) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${fieldName}-${uniqueSuffix}.json`;
  }

  fileValidation(file?: MultipartFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    if (file.mimetype !== 'application/json') {
      throw new BadRequestException(
        'Invalid file type. Only JSON files are allowed.',
      );
    }

    return file;
  }

  async uploadFile(file?: MultipartFile) {
    const validFile = this.fileValidation(file);
    const buffer = await validFile.toBuffer();
    const filename = this.generateUniqueFileName(validFile.fieldname || 'file');
    const path = join(UPLOAD_FILE_PATH, filename);

    try {
      await mkdir(UPLOAD_FILE_PATH, { recursive: true });
      await writeFile(path, buffer);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error saving uploaded file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return {
      message: 'File uploaded successfully',
      filename,
    };
  }
}