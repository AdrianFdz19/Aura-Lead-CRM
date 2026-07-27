// app/api/upload-url/route.ts
import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from 'crypto';
import { getSession } from '@/lib/auth';

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: Request) {

    // 1. Obtener la sesión de forma segura
    const session = await getSession();

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { fileType, folder } = await req.json();
        const fileKey = `${folder}/${randomUUID()}-${Date.now()}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

        return NextResponse.json({ uploadUrl, fileKey });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}