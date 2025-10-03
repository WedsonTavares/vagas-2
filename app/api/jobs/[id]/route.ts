import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { JobType, JobMode, JobStatus } from '@/types';

// GET /api/jobs/[id] - Buscar vaga por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Atualizar vaga
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      title,
      company,
      location,
      type,
      mode,
      status,
      description,
      requirements,
      salary,
      benefits,
      applicationUrl,
      applicationEmail,
      notes,
      appliedAt,
    } = body;

    // Verificar se a vaga existe e pertence ao usuário
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        ...(title && { title }),
        ...(company && { company }),
        ...(location !== undefined && { location }),
        ...(type && { type }),
        ...(mode && { mode }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(salary !== undefined && { salary }),
        ...(benefits !== undefined && { benefits }),
        ...(applicationUrl !== undefined && { applicationUrl }),
        ...(applicationEmail !== undefined && { applicationEmail }),
        ...(notes !== undefined && { notes }),
        ...(appliedAt !== undefined && { 
          appliedAt: appliedAt ? new Date(appliedAt) : null 
        }),
      },
    });

    console.log(`✅ Job updated successfully: ${id}`);
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('❌ Error updating job:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Deletar vaga
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se a vaga existe e pertence ao usuário
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await prisma.job.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}