import React from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface JobsSearchAndEmptyProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  hasJobs: boolean
  filteredJobsCount: number
}

const JobsSearchAndEmpty: React.FC<JobsSearchAndEmptyProps> = ({ 
  searchTerm, 
  setSearchTerm, 
  hasJobs, 
  filteredJobsCount 
}) => {
  const router = useRouter()

  return (
    <>
      {/* Barra de Pesquisa */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[color:var(--color-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome da vaga ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-[color:var(--color-border)] rounded-md leading-5 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] placeholder-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] transition-colors"
            />
          </div>
          
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar
            </Button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pesquisando por: <strong>"{searchTerm}"</strong>
            </span>
          </div>
        )}
      </div>

      {/* Estado Vazio - só mostra quando não há vagas OU quando a pesquisa não retorna resultados */}
      {filteredJobsCount === 0 && (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">{searchTerm ? '🔍' : '📋'}</div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
            {searchTerm ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga cadastrada'}
          </h3>
          <p className="text-[color:var(--color-muted-foreground)] mb-6">
            {searchTerm ? (
              <>
                Não encontramos vagas que correspondam à pesquisa 
                <strong>"{searchTerm}"</strong>.
                <br />Tente usar outros termos ou limpe o filtro.
              </>
            ) : (
              'Comece adicionando sua primeira vaga para acompanhar suas candidaturas'
            )}
          </p>
          {searchTerm ? (
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="mr-3"
            >
              🔍 Limpar Pesquisa
            </Button>
          ) : null}
          <Button
            onClick={() => router.push('/dashboard/add-job')}
            className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
          >
            + {searchTerm ? 'Adicionar Nova Vaga' : 'Adicionar Primeira Vaga'}
          </Button>
        </div>
      )}
    </>
  )
}

export default JobsSearchAndEmpty