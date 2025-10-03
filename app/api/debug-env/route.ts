import { NextResponse } from 'next/server';

// Teste de conexão sem Prisma para debug
export async function GET() {
  try {
    console.log('🔍 Testando variáveis de ambiente...')
    
    const databaseUrl = process.env.DATABASE_URL
    const nextPublicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const clerkPublishable = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const clerkSecret = process.env.CLERK_SECRET_KEY
    
    console.log('DATABASE_URL existe:', !!databaseUrl)
    console.log('DATABASE_URL length:', databaseUrl?.length)
    console.log('DATABASE_URL preview:', databaseUrl?.substring(0, 80) + '...')
    
    // Verificar se tem aspas
    const hasQuotes = databaseUrl?.startsWith('"') && databaseUrl?.endsWith('"')
    console.log('DATABASE_URL tem aspas:', hasQuotes)
    
    // Verificar se as URLs batem
    const supabaseUrlInDb = databaseUrl?.includes('aajbwnllgqxlolyqdcwe.supabase.co')
    const publicUrlCorrect = nextPublicSupabaseUrl === 'https://aajbwnllgqxlolyqdcwe.supabase.co'
    
    return NextResponse.json({
      status: 'debug',
      variables: {
        hasDatabaseUrl: !!databaseUrl,
        hasSupabaseUrl: !!nextPublicSupabaseUrl,
        hasClerkPublishable: !!clerkPublishable,
        hasClerkSecret: !!clerkSecret
      },
      databaseUrl: {
        hasQuotes,
        urlLength: databaseUrl?.length,
        urlPreview: databaseUrl?.substring(0, 80) + '...',
        containsSupabaseHost: supabaseUrlInDb
      },
      supabaseUrl: {
        value: nextPublicSupabaseUrl,
        isCorrect: publicUrlCorrect
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro debug env:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}