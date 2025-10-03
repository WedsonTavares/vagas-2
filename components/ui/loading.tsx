import React from 'react'

interface LoadingProps {
  message?: string
}

/**
 * Componente de Loading padronizado
 * 
 * Usado em:
 * - Transições de página
 * - Carregamento de dados
 * - Estados de loading
 * 
 * Por que assim?
 * - Mantém consistência visual em toda aplicação
 * - Sem containers extras que criem caixas visuais
 * - Animação centralizada e responsiva no centro do espaço disponível
 */
const Loading = ({ message = "Carregando..." }: LoadingProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)]"></div>
      <p className="mt-4 text-[color:var(--color-muted-foreground)]">{message}</p>
    </div>
  )
}

export default Loading