// Script para testar conexão com Supabase
const { PrismaClient } = require('@prisma/client')

async function testDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('🔍 Testando conexão com Supabase...')
    
    // Teste 1: Conexão básica
    await prisma.$connect()
    console.log('✅ Conexão com banco estabelecida')

    // Teste 2: Query simples
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query teste executada:', result)

    // Teste 3: Verificar tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📋 Tabelas encontradas:', tables)

    // Teste 4: Verificar tabela jobs
    try {
      const jobCount = await prisma.job.count()
      console.log(`📊 Total de vagas no banco: ${jobCount}`)
    } catch (error) {
      console.log('❌ Erro ao contar vagas:', error.message)
    }

  } catch (error) {
    console.error('❌ Erro de conexão:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()