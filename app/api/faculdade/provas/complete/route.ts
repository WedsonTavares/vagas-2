import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import fs from 'fs';
import path from 'path';
import {
  supabaseBackend,
  validateUserId,
  executeSecureQuery,
} from '@/lib/supabase-backend';

type Body = {
  id: string;
  grade?: number | null;
  professor?: string | null;
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as Body;
    const { id, grade, professor } = body;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    // Fetch exam to ensure it belongs to user
    const examRes = await executeSecureQuery(
      supabaseBackend.from('exams').select('*').eq('id', id).eq('userid', userId).maybeSingle(),
      'POST /faculdade/provas/complete - fetch exam',
      userId
    );

    if (examRes.error) {
      return NextResponse.json({ error: examRes.error.message }, { status: 500 });
    }

    if (!examRes.data) {
      return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
    }

    const exam = examRes.data as any;
    const materiaName = exam.materia as string;

    // Only update local JSON if this is a Prova AV (notes === 'Prova AV' case-insensitive)
    const notesValue = exam.notes ?? '';
    const isProvaAV = String(notesValue).trim().toLowerCase() === 'prova av';

    if (!isProvaAV) {
      // just delete the exam and return
      const delRes = await executeSecureQuery(
        supabaseBackend.from('exams').delete().eq('id', id).eq('userid', userId),
        'POST /faculdade/provas/complete - delete exam (no json update)',
        userId
      );

      if (delRes.error) {
        return NextResponse.json({ error: delRes.error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, updatedMateria: false, skippedUpdate: true });
    }

    // Proceed updating local JSON for Prova AV
    try {
      const dataPath = path.resolve(process.cwd(), 'data', 'materias.json');
      const fileRaw = fs.readFileSync(dataPath, 'utf8');
      const materias = JSON.parse(fileRaw) as any[];

      // find by nome (case-insensitive) or codigo match
      const idx = materias.findIndex(m => {
        if (!m) return false;
        if (m.nome && materiaName && m.nome.toString().toLowerCase() === materiaName.toString().toLowerCase()) return true;
        if (m.codigo && materiaName && m.codigo.toString().toLowerCase() === materiaName.toString().toLowerCase()) return true;
        return false;
      });

      let updated = false;
      if (idx !== -1) {
        const target = materias[idx];
        if (grade !== undefined && grade !== null) target.grau = Number(grade);
        if (professor) target.professor = professor;
        target.status = 'concluido';
        target.situacao = 'AP';
        materias[idx] = target;
        fs.writeFileSync(dataPath, JSON.stringify(materias, null, 2), 'utf8');
        updated = true;
      }

      // Delete exam from DB
      const delRes = await executeSecureQuery(
        supabaseBackend.from('exams').delete().eq('id', id).eq('userid', userId),
        'POST /faculdade/provas/complete - delete exam',
        userId
      );

      if (delRes.error) {
        return NextResponse.json({ error: delRes.error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, updatedMateria: updated, skippedUpdate: false });
    } catch (err) {
      // still try to delete exam even if JSON update failed
      await executeSecureQuery(
        supabaseBackend.from('exams').delete().eq('id', id).eq('userid', userId),
        'POST /faculdade/provas/complete - delete exam fallback',
        userId
      );
      return NextResponse.json({ success: true, warning: 'Could not update materias.json' });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
