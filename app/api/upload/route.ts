import { NextResponse } from 'next/server';
import { generatePresignedUrl } from '@/lib/aws/presigned-url';

export async function POST(request: Request) {
    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
        return NextResponse.json({ error: 'File name and file type are required.' }, { status: 400 });
    }

    const allowedFileTypes = ['image/jpeg', 'image/png'];
    if (!allowedFileTypes.includes(fileType)) {
        return NextResponse.json({ error: 'Invalid file type. Only JPEG and PNG are allowed.' }, { status: 400 });
    }

    try {
        const presignedUrl = await generatePresignedUrl(fileName, fileType);
        return NextResponse.json({ presignedUrl });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate presigned URL.' }, { status: 500 });
    }
}