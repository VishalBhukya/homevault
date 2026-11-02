import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

export interface StoredFile {
  url: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED = /^(image\/(jpeg|png|gif|webp|heic)|application\/pdf|text\/plain|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/;

/**
 * Saves uploads to Cloudinary when CLOUDINARY_URL is set (production),
 * otherwise to ./uploads on local disk (served at /uploads).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly useCloudinary = Boolean(process.env.CLOUDINARY_URL);
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // The cloudinary SDK reads CLOUDINARY_URL from the environment automatically.
    this.logger.log(`File storage: ${this.useCloudinary ? 'Cloudinary' : `local disk (${this.uploadDir})`}`);
  }

  async save(file: Express.Multer.File | undefined): Promise<StoredFile> {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED.test(file.mimetype)) throw new BadRequestException(`File type ${file.mimetype} is not supported`);

    const base = { fileName: file.originalname, mimeType: file.mimetype, size: file.size };
    if (this.useCloudinary) {
      const url = await new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'homevault', resource_type: 'auto' }, (err, result) =>
            err || !result ? reject(err ?? new Error('Upload failed')) : resolve(result.secure_url),
          )
          .end(file.buffer);
      });
      return { ...base, url };
    }

    await mkdir(this.uploadDir, { recursive: true });
    const name = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(this.uploadDir, name), file.buffer);
    const publicUrl = (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`).replace(/\/$/, '');
    return { ...base, url: `${publicUrl}/uploads/${name}` };
  }
}
