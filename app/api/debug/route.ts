import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Rota de debug para testar banco em produção
export async function GET() {
  try {
    console.log('🔍 Debug: Testando banco...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conexão OK')
    
    // Contar vagas
    const count = await prisma.job.count()
    console.log(`📊 Total vagas: ${count}`)
    
    // Listar algumas vagas
    const jobs = await prisma.job.findMany({
      take: 5,
      select: { id: true, title: true, company: true, userId: true }
    })
    
    return NextResponse.json({
      status: 'success',
      count,
      sampleJobs: jobs,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro debug:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}