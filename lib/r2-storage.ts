import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID!;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT!;

export const s3Client = new S3Client({
  region: 'auto',
  endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export class R2Storage {
  static async uploadFile(
    file: Buffer,
    fileName: string,
    contentType: string,
    organizationId: string,
    userId: string
  ): Promise<{ url: string; storagePath: string }> {
    const documentId = crypto.randomUUID();
    const storagePath = `${organizationId}/${userId}/${documentId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
      Body: file,
      ContentType: contentType,
      Metadata: {
        organizationId,
        userId,
        documentId,
        uploadedAt: new Date().toISOString(),
      },
    });

    await s3Client.send(command);

    const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${storagePath}`;

    return {
      url: publicUrl,
      storagePath,
    };
  }

  static async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  }

  static async deleteFile(storagePath: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: storagePath,
    });

    await s3Client.send(command);
  }

  static getPublicUrl(storagePath: string): string {
    return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${storagePath}`;
  }

  static validateFileType(contentType: string): boolean {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    return allowedTypes.includes(contentType);
  }

  static validateFileSize(size: number): boolean {
    const maxSize = 100 * 1024 * 1024; // 100MB
    return size <= maxSize;
  }
}
