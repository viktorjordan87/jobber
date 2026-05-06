import { BadRequestException, Injectable } from "@nestjs/common";

@Injectable()
export class UploadsService {  


    generateUniqueFileName(fieldName: string) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        return `${fieldName}-${uniqueSuffix}.json`;
    }

    fileValidation(file) {
        if (file.mimetype !== 'application/json') {
            throw new BadRequestException('Invalid file type. Only JSON files are allowed.');
        }
        return file;
    }

    uploadFile(file) { 
        return {
            message: 'File uploaded successfully',
            filename: file.filename, 
        }
    }
}