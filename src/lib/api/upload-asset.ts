'use client';

interface PresignOk {
    ok: true;
    data: { upload_url: string; download_url: string; object_key: string };
}
interface PresignErr {
    ok: false;
    message: string;
}

export async function uploadViaPresign(
    file: File,
    getPresigned: (filename: string, contentType: string, fileSize: number) => Promise<PresignOk | PresignErr>
): Promise<string> {
    const dot = file.name.lastIndexOf('.');
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
    const base =
        file.name
            .slice(0, dot >= 0 ? dot : undefined)
            .replace(/[^a-zA-Z0-9-_]/g, '-')
            .slice(0, 40) || 'image';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}${ext}`;

    const res = await getPresigned(uniqueName, file.type, file.size);
    if (!res.ok) {
        console.error('[upload] presigned URL request failed', res);
        throw new Error(res.message);
    }

    const upload = await fetch(res.data.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
    });
    if (!upload.ok) {
        console.error('[upload] PUT to storage failed', { status: upload.status, key: res.data.object_key });
        throw new Error(`Upload failed (${upload.status})`);
    }

    return res.data.download_url;
}
