// Script para testar API localmente
async function testAPI() {
  try {
    console.log('🔍 Testando API local...')
    
    // Teste da API local
    const response = await fetch('http://localhost:3000/api/jobs', {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 Status:', response.status)
    console.log('📋 Headers:', Object.fromEntries(response.headers))
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Dados recebidos:', data.length, 'vagas')
    } else {
      const error = await response.text()
      console.log('❌ Erro:', error)
    }
    
  } catch (error) {
    console.error('❌ Erro de requisição:', error)
  }
}

testAPI()