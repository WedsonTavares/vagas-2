import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

export const runtime = 'nodejs';

// Tipagens locais para evitar uso indiscriminado de `any` e deixar o código mais claro.
interface CertificateRow {
    id: string;
    userid: string;
    course_name: string;
    duration?: string | null;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    institution?: string | null;
    file_name?: string | null;
    storage_path?: string | null;
    preview_path?: string | null;
    file_mime?: string | null;
    preview_mime?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

// Lista os certificados do usuário autenticado
export async function GET() {
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

        const rows = Array.isArray(result.data) ? (result.data as CertificateRow[]) : [];

        // Para cada registro, tentamos gerar uma URL assinada para o preview (se existir).
        const mappedPromises = rows.map(async (r) => {
            let previewUrl: string | null = null;
                    try {
                        if (r.preview_path) {
                            const { data: urlData, error: urlErr } = await supabaseBackend.storage.from('certificates').createSignedUrl(r.preview_path, 60 * 60);
                            if (!urlErr && urlData?.signedURL) previewUrl = urlData.signedURL;
                        }
                    } catch {
                        // Erros na geração da URL de preview não impedem o retorno da lista; apenas ignoramos aqui.
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
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// Use native request.formData() para receber uploads multipart
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !validateUserId(userId)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Aceita JSON (metadados + storagePath já existente) ou multipart/form-data
        const contentType = request.headers.get('content-type') || '';
        let fields: Record<string, unknown> = {};
        let fileBuffer: Buffer | null = null;
        let originalFileName = '';
        let mimeType = '';
        let previewBuffer: Buffer | null = null;
        let previewOriginalName = '';
        let previewMime = '';

        if (contentType.includes('application/json')) {
            const body = await request.json();
            fields = body;
        } else if (contentType.includes('multipart/form-data')) {
            // parsing nativo do formData
            const formData = await request.formData();
            for (const [key, value] of formData.entries()) {
                // arquivos possuem arrayBuffer()
                if (value && typeof (value as File | Blob).arrayBuffer === 'function') {
                    const fileValue = value as File | Blob;
                    const buf = await fileValue.arrayBuffer();
                    // diferencia preview do arquivo principal
                    if (key === 'preview') {
                        previewBuffer = Buffer.from(buf);
                        previewOriginalName = (fileValue as File).name || 'preview.png';
                        previewMime = (fileValue as File).type || 'image/png';
                    } else {
                        fileBuffer = Buffer.from(buf);
                        originalFileName = (fileValue as File).name || key || '';
                        mimeType = (fileValue as File).type || 'application/octet-stream';
                    }
                } else {
                    fields[key] = value;
                }
            }
        } else {
            // tenta interpretar como json
            try {
                fields = await request.json();
            } catch {
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
        } = fields as Record<string, string | undefined>;

        if (!courseName) {
            return NextResponse.json({ error: 'Campo obrigatório: courseName' }, { status: 400 });
        }

        // faz upload do arquivo principal caso recebido como buffer
        let finalStoragePath = (storagePath as string) || null;
        let finalPreviewPath: string | null = null;
        if (fileBuffer) {
            const extMatch = originalFileName ? originalFileName.match(/(\.[a-zA-Z0-9]+)(?:\?.*)?$/) : null;
            const ext = extMatch ? extMatch[1] : '';
            const safeName = `${crypto.randomUUID()}${ext}`;
            const destPath = `certificates/${userId}/${safeName}`;

            // tenta garantir que o bucket existe, mas ignora erros de criação (pode já existir)
                    try {
                        // valida se o método createBucket existe no cliente
                        // evita uso de `any` e protege em runtimes diferentes
                        // Em algumas versões do cliente supabase, createBucket pode não existir — protegemos a chamada.
                    if (typeof supabaseBackend.storage?.createBucket === 'function') {
                            try {
                                // criar bucket caso não exista (ignora erro se já existir)
                                // marcamos como privado (public: false)
                                // Em ambientes restritos, essa chamada pode falhar; tratamos abaixo
                                // eslint-disable-next-line no-console
                                await supabaseBackend.storage.createBucket('certificates', { public: false });
                            } catch {
                                // eslint-disable-next-line no-console
                                console.warn('createBucket inner warning');
                            }
                        }
                    } catch {
                        // eslint-disable-next-line no-console
                        console.warn('createBucket warning');
                    }

            const upload = await supabaseBackend.storage.from('certificates').upload(destPath, fileBuffer, {
                contentType: mimeType,
                upsert: false,
            });
                    if (upload.error) {
                        // eslint-disable-next-line no-console
                        console.error('Supabase upload error:', upload.error.message);
                        return NextResponse.json({ error: upload.error.message }, { status: 500 });
                    }
            finalStoragePath = upload.data?.path || destPath;
        }

        // upload do preview (se houver)
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
                        // eslint-disable-next-line no-console
                        console.error('Supabase preview upload error:', previewUpload.error.message);
                    } else {
                        finalPreviewPath = previewUpload.data?.path || previewDest;
                    }
        }

        if (!finalStoragePath) {
            return NextResponse.json({ error: 'Arquivo não fornecido' }, { status: 400 });
        }

        // objeto para inserir no banco — tipado localmente para evitar `any`
        const dbObj = {
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
        } as const;

        const result = await executeSecureQuery(
            supabaseBackend.from('certificates').insert([dbObj]).select().maybeSingle(),
            'POST /cursos/certificados - create',
            userId
        );

        if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

        const r = result.data as CertificateRow;
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
        } catch {
            // eslint-disable-next-line no-console
            console.error('Internal error in certificados route');
            return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
}
