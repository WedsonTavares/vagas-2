import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vaga from '@/models/Vaga';
import { z } from 'zod';

export async function GET() {
  await connectDB();

  try {
    const vagas = await Vaga.find().sort({ dataInscricao: -1 });
    return NextResponse.json(vagas, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar vagas' },
      { status: 500 }
    );
  }
}

const vagaSchema = z.object({
  nome: z.string().min(1, 'Campo obrigatório: nome'),
  descricao: z.string().min(1, 'Campo obrigatório: descricao'),
  empresa: z.string().min(1, 'Campo obrigatório: empresa'),
  link: z.string().url('Campo link deve ser uma URL válida'),
  dataInscricao: z.string().min(1, 'Campo obrigatório: dataInscricao'),
  status: z.string().min(1, 'Campo obrigatório: status'),
});

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();

    const validation = vagaSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        { error: `Campo obrigatório faltando ou inválido: ${firstError.path[0]}` },
        { status: 400 }
      );
    }

    const vagaCriada = await Vaga.create(validation.data);
    return NextResponse.json(vagaCriada, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar vaga.' },
      { status: 500 }
    );
  }
}
