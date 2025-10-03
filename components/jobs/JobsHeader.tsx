import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface JobsHeaderProps {
  totalJobs: number
  filteredJobs: number
  searchTerm: string
}

const JobsHeader: React.FC<JobsHeaderProps> = ({ totalJobs, filteredJobs, searchTerm }) => {
  const router = useRouter()

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--color-primary)]">Minhas Vagas</h1>
        <p className="text-[color:var(--color-muted-foreground)] mt-2">
          {searchTerm ? (
            <>
              {filteredJobs} de {totalJobs} vaga{totalJobs !== 1 ? 's' : ''} 
              {filteredJobs !== totalJobs && (
                <span className="text-[color:var(--color-primary)]">
                  (filtrada{filteredJobs !== 1 ? 's' : ''})
                </span>
              )}
            </>
          ) : (
            `${totalJobs} vaga${totalJobs !== 1 ? 's' : ''} encontrada${totalJobs !== 1 ? 's' : ''}`
          )}
        </p>
      </div>
      <Button
        onClick={() => router.push('/dashboard/add-job')}
        className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
      >
        + Nova Vaga
      </Button>
    </div>
  )
}

export default JobsHeader