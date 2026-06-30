// lib/s3.ts
import { s3Client } from './s3Client'; // Importa la instancia, NO la clase
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getPublicUrl(fileKey: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
  });
  
  // Ahora pasamos la instancia 's3Client'
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}