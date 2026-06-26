import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from 'crypto';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getUploadUrl = async (fileType) => {
  // Generamos un nombre único para evitar colisiones
  const fileName = `properties/${crypto.randomUUID()}.${fileType.split('/')[1]}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
  });

  // La URL expira en 60 segundos por seguridad
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  
  return {
    uploadUrl: signedUrl,
    fileKey: fileName // Esto es lo que guardarás en Supabase
  };
};