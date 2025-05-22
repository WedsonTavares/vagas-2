import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Vaga from '@/models/Vaga';
import mongoose from 'mongoose';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().length(24).regex(/^[0-9a-fA-F]{24}$/)
});

export async function GET(req: Request, { params }: any) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  await connectDB();

  try {
    const vaga = await Vaga.findById(id);
    if (!vaga) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }
    return NextResponse.json(vaga);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar vaga' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  const { id } = params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  await connectDB();

  try {
    const body = await req.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Dados inválidos para atualização' }, { status: 400 });
    }

    const vagaAtualizada = await Vaga.findByIdAndUpdate(id, body, { new: true });
    if (!vagaAtualizada) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }
    return NextResponse.json(vagaAtualizada);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar vaga' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  const { id } = params;

  const validation = paramsSchema.safeParse({ id });
  if (!validation.success) {
    return NextResponse.json({ error: 'ID inválido (formato)' }, { status: 400 });
  }

  const token = req.headers.get('authorization');
  if (token !== process.env.DELETE_TOKEN) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  await connectDB();

  try {
    const vagaRemovida = await Vaga.findByIdAndDelete(id);
    if (!vagaRemovida) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Vaga deletada com sucesso' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar vaga' }, { status: 500 });
  }
}