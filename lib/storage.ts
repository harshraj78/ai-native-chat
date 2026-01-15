import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageService {
    upload(file: File): Promise<string>;
}

export class LocalStorageService implements StorageService {
    private uploadDir: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async upload(file: File): Promise<string> {
        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = path.join(this.uploadDir, filename);

        await fs.promises.writeFile(filepath, buffer);

        // Return the public URL
        return `/uploads/${filename}`;
    }
}

// Factory to get determining storage provider based on env
export function getStorageService(): StorageService {
    // In future: if (process.env.STORAGE_PROVIDER === 's3') return new S3StorageService();
    return new LocalStorageService();
}

export const storage = getStorageService();
