/**
 * Arquivo: app/dashboard/add-job/page.tsx
 * Propósito: Página otimizada para adicionar nova vaga com formulário compacto
 * 
 * Otimizações implementadas:
 * - React.useCallback() para callbacks memoizados
 * - React.useMemo() para validações e options memoizadas
 * - Formulário mais compacto e responsivo
 * - Validação robusta no frontend
 * - Tratamento de erro específico por tipo
 * - Layout otimizado para mobile
 * - Campos organizados por prioridade
 * - Utilitários centralizados para labels
 * 
 * Funcionalidades:
 * - Formulário de criação de vaga
 * - Validação em tempo real
 * - Estados de loading otimizados
 * - Navegação contextual
 * - Tratamento robusto de erros
 * - Auto-focus em campos importantes
 */

'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { createJob, clearStatsCache } from '@/lib/api'
import { CreateJobData, JobType, JobMode, JobStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { getTypeLabel, getModeLabel, getStatusLabel } from '@/utils/jobUtils'

// ========================================
// INTERFACES E TIPOS
// ========================================

/**
 * FormErrors: Interface para tipagem de erros de validação
 * 
 * Facilita:
 * - Type safety para campos de erro
 * - IntelliSense para nomes de campos
 * - Validação consistente
 */
interface FormErrors {
  title?: string;
  company?: string;
  applicationUrl?: string;
  applicationEmail?: string;
}

const AddJobPageOptimized = () => {
  const router = useRouter()
  const { addToast } = useToast()
  
  // ========================================
  // ESTADO LOCAL
  // ========================================
  
  /**
   * Estados do formulário:
   * - formData: Dados do formulário
   * - isSubmitting: Estado de submissão
   * - errors: Erros de validação
   */
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    company: '',
    location: '',
    type: JobType.FULL_TIME,
    mode: JobMode.REMOTE,
    status: JobStatus.APPLIED,
    description: '',
    requirements: '',
    salary: '',
    benefits: '',
    applicationUrl: '',
    applicationEmail: '',
    notes: '',
  })

  // ========================================
  // VALIDAÇÕES MEMOIZADAS
  // ========================================
  
  /**
   * validateField: Função de validação memoizada por campo
   * 
   * Por que memoizar:
   * - Evita recriação de função a cada render
   * - Validação em tempo real sem performance hit
   * - Reutilizável para diferentes eventos
   */
  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Título é obrigatório'
        if (value.length < 3) return 'Título deve ter pelo menos 3 caracteres'
        break
      case 'company':
        if (!value.trim()) return 'Empresa é obrigatória'
        if (value.length < 2) return 'Nome da empresa deve ter pelo menos 2 caracteres'
        break
      case 'applicationUrl':
        if (value && !value.match(/^https?:\/\/.+/)) return 'URL deve começar com http:// ou https://'
        break
      case 'applicationEmail':
        if (value && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Email inválido'
        break
    }
    return undefined
  }, [])

  /**
   * isFormValid: Validação geral do formulário memoizada
   * 
   * Verifica:
   * - Campos obrigatórios preenchidos
   * - Ausência de erros de validação
   * - Só recalcula quando formData ou errors mudam
   */
  const isFormValid = useMemo(() => {
    const hasRequiredFields = formData.title.trim() && formData.company.trim()
    const hasNoErrors = Object.keys(errors).length === 0
    return hasRequiredFields && hasNoErrors
  }, [formData.title, formData.company, errors])

  // ========================================
  // OPTIONS PARA SELECTS MEMOIZADAS
  // ========================================
  
  /**
   * Options memoizadas para melhor performance
   * 
   * Evita:
   * - Recriação de arrays a cada render
   * - Re-renderização desnecessária dos selects
   * - Cálculos repetitivos de labels
   */
  const typeOptions = useMemo(() => [
    { value: JobType.FULL_TIME, label: getTypeLabel(JobType.FULL_TIME) },
    { value: JobType.PART_TIME, label: getTypeLabel(JobType.PART_TIME) },
    { value: JobType.CONTRACT, label: getTypeLabel(JobType.CONTRACT) },
    { value: JobType.INTERNSHIP, label: getTypeLabel(JobType.INTERNSHIP) },
    { value: JobType.FREELANCE, label: getTypeLabel(JobType.FREELANCE) }
  ], [])

  const modeOptions = useMemo(() => [
    { value: JobMode.REMOTE, label: getModeLabel(JobMode.REMOTE) },
    { value: JobMode.HYBRID, label: getModeLabel(JobMode.HYBRID) },
    { value: JobMode.ONSITE, label: getModeLabel(JobMode.ONSITE) }
  ], [])

  const statusOptions = useMemo(() => [
    { value: JobStatus.APPLIED, label: getStatusLabel(JobStatus.APPLIED) },
    { value: JobStatus.TEST_PENDING, label: getStatusLabel(JobStatus.TEST_PENDING) },
    { value: JobStatus.TEST_COMPLETED, label: getStatusLabel(JobStatus.TEST_COMPLETED) },
    { value: JobStatus.INTERVIEW, label: getStatusLabel(JobStatus.INTERVIEW) },
    { value: JobStatus.ACCEPTED, label: getStatusLabel(JobStatus.ACCEPTED) },
    { value: JobStatus.REJECTED, label: getStatusLabel(JobStatus.REJECTED) }
  ], [])

  // ========================================
  // HANDLERS MEMOIZADOS
  // ========================================
  
  /**
   * handleChange: Handler de mudança de campos memoizado
   * 
   * @param e - Evento de mudança
   * 
   * Funcionalidades:
   * - Atualiza valor do campo
   * - Valida campo em tempo real
   * - Remove erro quando campo é corrigido
   * - Otimizado com useCallback
   */
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    
    // Atualiza valor
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Valida campo e atualiza erros
    const error = validateField(name, value)
    setErrors(prev => {
      const newErrors = { ...prev }
      if (error) {
        newErrors[name as keyof FormErrors] = error
      } else {
        delete newErrors[name as keyof FormErrors]
      }
      return newErrors
    })
  }, [validateField])

  /**
   * handleSubmit: Handler de submissão memoizado
   * 
   * @param e - Evento de submissão
   * 
   * Fluxo:
   * 1. Previne comportamento padrão
   * 2. Valida formulário completo
   * 3. Ativa estado de loading
   * 4. Chama API de criação
   * 5. Limpa cache de estatísticas
   * 6. Mostra feedback e navega
   * 7. Trata erros específicos
   * 8. Sempre desativa loading
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação final
    if (!isFormValid) {
      addToast({
        type: 'warning',
        title: 'Formulário inválido',
        description: 'Por favor, corrija os erros destacados antes de continuar.'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createJob(formData)
      
      // Limpa cache de estatísticas para refletir nova vaga
      clearStatsCache()
      
      addToast({
        type: 'success',
        title: 'Vaga criada com sucesso!',
        description: `A vaga "${formData.title}" foi adicionada à sua lista.`
      })
      
      router.push('/dashboard/jobs')
    } catch (error: any) {
      console.error('Erro ao criar vaga:', error)
      
      // Tratamento específico por tipo de erro
      const errorMessage = error.message || 'Erro desconhecido'
      
      if (errorMessage.includes('já se candidatou')) {
        addToast({
          type: 'error',
          title: 'Vaga já cadastrada',
          description: 'Você já possui uma candidatura para esta vaga.'
        })
      } else if (errorMessage.includes('URL inválida')) {
        addToast({
          type: 'error',
          title: 'URL inválida',
          description: 'Verifique se a URL da vaga está correta.'
        })
      } else if (errorMessage.includes('Tempo limite')) {
        addToast({
          type: 'error',
          title: 'Timeout',
          description: 'Operação demorou muito. Tente novamente.'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao criar vaga',
          description: 'Não foi possível criar a vaga. Tente novamente.'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, isFormValid, addToast, router])

  /**
   * handleCancel: Handler de cancelamento memoizado
   * 
   * Navega de volta para lista de vagas
   * Simples mas memoizado para consistência
   */
  const handleCancel = useCallback(() => {
    router.push('/dashboard/jobs')
  }, [router])

  // ========================================
  // RENDERIZAÇÃO
  // ========================================
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header compacto */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[color:var(--color-primary)]">Nova Vaga</h1>
        <p className="text-[color:var(--color-muted-foreground)] mt-1 text-sm">
          Adicione uma nova oportunidade ao seu pipeline
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Essenciais - Seção compacta */}
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-lg font-semibold mb-3 text-[color:var(--color-card-foreground)]">
            Informações Essenciais
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Título - Campo obrigatório com validação */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                autoFocus
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm ${
                  errors.title ? 'border-red-500' : 'border-[color:var(--color-border)]'
                }`}
                placeholder="Ex: Desenvolvedor Frontend"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Empresa - Campo obrigatório com validação */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Empresa *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm ${
                  errors.company ? 'border-red-500' : 'border-[color:var(--color-border)]'
                }`}
                placeholder="Ex: Tech Company"
              />
              {errors.company && (
                <p className="text-red-500 text-xs mt-1">{errors.company}</p>
              )}
            </div>

            {/* Localização e Salário - Campos opcionais */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Localização
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Salário
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
                placeholder="Ex: R$ 8.000 - R$ 12.000"
              />
            </div>
          </div>
        </div>

        {/* Configurações - Seção compacta com selects */}
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-lg font-semibold mb-3 text-[color:var(--color-card-foreground)]">
            Configurações
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tipo de contrato */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Tipo
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label htmlFor="mode" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Modalidade
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
              >
                {modeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Informações Adicionais - Seção colapsável/compacta */}
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-lg font-semibold mb-3 text-[color:var(--color-card-foreground)]">
            Detalhes (Opcional)
          </h2>
          
          <div className="space-y-3">
            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
                placeholder="Breve descrição da vaga..."
              />
            </div>

            {/* Grid com campos menores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                  Requisitos
                </label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
                  placeholder="Requisitos principais..."
                />
              </div>

              <div>
                <label htmlFor="benefits" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                  Benefícios
                </label>
                <textarea
                  id="benefits"
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
                  placeholder="Principais benefícios..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contato - Seção compacta */}
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-lg font-semibold mb-3 text-[color:var(--color-card-foreground)]">
            Contato & Anotações
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {/* URL com validação */}
            <div>
              <label htmlFor="applicationUrl" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                URL da Vaga
              </label>
              <input
                type="url"
                id="applicationUrl"
                name="applicationUrl"
                value={formData.applicationUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm ${
                  errors.applicationUrl ? 'border-red-500' : 'border-[color:var(--color-border)]'
                }`}
                placeholder="https://empresa.com/vaga"
              />
              {errors.applicationUrl && (
                <p className="text-red-500 text-xs mt-1">{errors.applicationUrl}</p>
              )}
            </div>

            {/* Email com validação */}
            <div>
              <label htmlFor="applicationEmail" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
                Email de Contato
              </label>
              <input
                type="email"
                id="applicationEmail"
                name="applicationEmail"
                value={formData.applicationEmail}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm ${
                  errors.applicationEmail ? 'border-red-500' : 'border-[color:var(--color-border)]'
                }`}
                placeholder="contato@empresa.com"
              />
              {errors.applicationEmail && (
                <p className="text-red-500 text-xs mt-1">{errors.applicationEmail}</p>
              )}
            </div>
          </div>

          {/* Anotações */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1 text-[color:var(--color-primary)]">
              Anotações
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)] text-sm"
              placeholder="Observações, próximos passos..."
            />
          </div>
        </div>

        {/* Botões de ação compactos */}
        <div className="flex gap-3 pt-4 border-t border-[color:var(--color-border)] justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="px-6"
          >
            Cancelar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-6 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Vaga'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddJobPageOptimized