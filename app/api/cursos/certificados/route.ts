import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !validateUserId(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await executeSecureQuery(
            supabaseBackend.from('certificates').select('*').eq('userid', userId).order('created_at', { ascending: false }),
            'GET /cursos/certificados - list',
            userId
        );

        if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

        const rows = Array.isArray(result.data) ? result.data : [];

        // For each row, try to generate a signed URL for the preview if available
        const mappedPromises = rows.map(async (r: any) => {
            let previewUrl: string | null = null;
            try {
                if (r.preview_path) {
                    const { data: urlData, error: urlErr } = await supabaseBackend.storage.from('certificates').createSignedUrl(r.preview_path, 60 * 60);
                    if (!urlErr && urlData?.signedURL) previewUrl = urlData.signedURL;
                }
            } catch (e) {
                // ignore preview generation error
            }

            return {
                id: r.id,
                userId: r.userid,
                courseName: r.course_name,
                duration: r.duration,
                description: r.description,
                startDate: r.start_date,
                endDate: r.end_date,
                institution: r.institution,
                fileName: r.file_name,
                storagePath: r.storage_path,
                fileMime: r.file_mime,
                previewUrl,
                createdAt: r.created_at,
                updatedAt: r.updated_at,
            };
        });

        const mapped = await Promise.all(mappedPromises);

        return NextResponse.json(mapped);
    } catch (err) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Use native request.formData() to parse multipart uploads

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !validateUserId(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Accept JSON (metadata + pre-uploaded filePath) or multipart/form-data
        const contentType = request.headers.get('content-type') || '';
        let fields: any = {};
        let fileBuffer: Buffer | null = null;
        let originalFileName = '';
        let mimeType = '';
        let previewBuffer: Buffer | null = null;
        let previewOriginalName = '';
        let previewMime = '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            fields = body;
            // Expect fields.storagePath to exist if file already uploaded to storage
        } else if (contentType.includes('multipart/form-data')) {
            // Use native formData parsing
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
              // files will have arrayBuffer() method
              if (value && typeof (value as any).arrayBuffer === 'function') {
                    const buf = await (value as any).arrayBuffer();
                    // differentiate preview vs main file
                    if (key === 'preview') {
                        previewBuffer = Buffer.from(buf);
                        previewOriginalName = (value as any).name || 'preview.png';
                        previewMime = (value as any).type || 'image/png';
                    } else {
                        fileBuffer = Buffer.from(buf);
                        // file name and mime
                        originalFileName = (value as any).name || key || '';
                        mimeType = (value as any).type || 'application/octet-stream';
                    }
                } else {
                    fields[key] = value;
                }
            }
        } else {
            // try parse as json
            try {
                fields = await request.json();
            } catch (e) {
                return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
            }
        }

        const {
            courseName,
            duration,
            description,
            startDate,
            endDate,
            institution,
            storagePath,
        } = fields;

        if (!courseName) {
            return NextResponse.json({ error: 'Campo obrigatório: courseName' }, { status: 400 });
        }

        // handle file upload to supabase storage if provided as buffer
        let finalStoragePath = storagePath || null;
        let finalPreviewPath: string | null = null;
        if (fileBuffer) {
            // create a safe filename using uuid and preserve extension
            const extMatch = originalFileName ? originalFileName.match(/(\.[a-zA-Z0-9]+)(?:\?.*)?$/) : null;
            const ext = extMatch ? extMatch[1] : '';
            const safeName = `${crypto.randomUUID()}${ext}`;
            const destPath = `certificates/${userId}/${safeName}`;

            // Ensure bucket exists (attempt to create if missing). Using service role client so this should work.
                    try {
                        // createBucket may fail if permissions missing or bucket exists; ignore errors gracefully
                        if (typeof (supabaseBackend.storage as any).createBucket === 'function') {
                            try {
                                await (supabaseBackend.storage as any).createBucket('certificates', { public: false });
                            } catch (e) {
                                // ignore inner error but log for debugging
                                console.warn('createBucket inner warning:', e instanceof Error ? e.message : e);
                            }
                        }
                    } catch (e) {
                        // log but continue — upload will show the real error if bucket truly missing
                        console.warn('createBucket warning:', e instanceof Error ? e.message : e);
                    }

            const upload = await supabaseBackend.storage.from('certificates').upload(destPath, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });
            if (upload.error) {
                console.error('Supabase upload error:', upload.error.message);
                return NextResponse.json({ error: upload.error.message }, { status: 500 });
            }
            finalStoragePath = upload.data?.path || destPath;
        }

        // upload preview if available
        if (previewBuffer) {
            const extMatch = previewOriginalName ? previewOriginalName.match(/(\.[a-zA-Z0-9]+)(?:\?.*)?$/) : null;
            const ext = extMatch ? extMatch[1] : '.png';
            const safeName = `${crypto.randomUUID()}${ext}`;
            const previewDest = `certificates/${userId}/previews/${safeName}`;
            const previewUpload = await supabaseBackend.storage.from('certificates').upload(previewDest, previewBuffer, {
                contentType: previewMime || 'image/png',
                upsert: false,
            });
            if (previewUpload.error) {
                console.error('Supabase preview upload error:', previewUpload.error.message);
            } else {
                finalPreviewPath = previewUpload.data?.path || previewDest;
            }
        }

        if (!finalStoragePath) {
            return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
        }

        const dbObj: any = {
            id: crypto.randomUUID(),
            userid: userId,
            course_name: courseName,
            duration: duration || null,
            description: description || null,
            start_date: startDate || null,
            end_date: endDate || null,
            institution: institution || null,
            file_name: originalFileName || (finalStoragePath ? finalStoragePath.split('/').pop() : null),
            storage_path: finalStoragePath,
            preview_path: finalPreviewPath || null,
            preview_mime: previewMime || null,
            file_mime: mimeType || null,
        };

        const result = await executeSecureQuery(
            supabaseBackend.from('certificates').insert([dbObj]).select().maybeSingle(),
            'POST /cursos/certificados - create',
            userId
        );

        if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

        const r = result.data as any;
        const mapped = {
            id: r.id,
            userId: r.userid,
            courseName: r.course_name,
            duration: r.duration,
            description: r.description,
            startDate: r.start_date,
            endDate: r.end_date,
            institution: r.institution,
            fileName: r.file_name,
            storagePath: r.storage_path,
            fileMime: r.file_mime,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
        };

        return NextResponse.json(mapped, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
