// Utilitário para migrar vagas entre usuários
// Use apenas se necessário - CUIDADO!

import { prisma } from '@/lib/prisma'

export async function migrateJobsToNewUser(oldUserId: string, newUserId: string) {
  try {
    console.log(`🔄 Migrando vagas de ${oldUserId} para ${newUserId}`)
    
    const result = await prisma.job.updateMany({
      where: { userId: oldUserId },
      data: { userId: newUserId }
    })
    
    console.log(`✅ Migradas ${result.count} vagas`)
    return result.count
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
  }
}

// Como usar (apenas em emergência):
// await migrateJobsToNewUser('user_old_id', 'user_new_id')