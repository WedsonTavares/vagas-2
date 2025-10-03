'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createJob } from '@/lib/api'
import { CreateJobData, JobType, JobMode, JobStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

const AddJobPage = () => {
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.company) {
      addToast({
        type: 'warning',
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o título e a empresa da vaga.'
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      await createJob(formData)
      addToast({
        type: 'success',
        title: 'Vaga criada com sucesso!',
        description: `A vaga "${formData.title}" foi adicionada à sua lista de candidaturas.`
      })
      router.push('/dashboard/jobs')
    } catch (error: any) {
      console.error('Erro ao criar vaga:', error)
      
      // Verificar se é erro de URL duplicada
      if (error.message === 'Você já se candidatou a essa vaga') {
        addToast({
          type: 'error',
          title: 'Vaga já cadastrada',
          description: 'Você já se candidatou a essa vaga. Verifique a URL informada.'
        })
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao criar vaga',
          description: 'Não foi possível criar a vaga. Verifique os dados e tente novamente.'
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[color:var(--color-primary)]">Adicionar Nova Vaga</h1>
        <p className="text-[color:var(--color-muted-foreground)] mt-2">
          Preencha as informações da vaga para manter seu processo de candidaturas organizado
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[color:var(--color-card-foreground)]">
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Ex: Desenvolvedor Frontend React"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Empresa *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Ex: Tech Company LTDA"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Localização
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <label htmlFor="salary" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Salário
              </label>
              <input
                type="text"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Ex: R$ 8.000 - R$ 12.000"
              />
            </div>
          </div>
        </div>

        {/* Configurações da Vaga */}
        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[color:var(--color-card-foreground)]">
            Configurações
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Tipo de Contrato
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
              >
                <option value={JobType.FULL_TIME}>Tempo Integral</option>
                <option value={JobType.PART_TIME}>Meio Período</option>
                <option value={JobType.CONTRACT}>Contrato</option>
                <option value={JobType.INTERNSHIP}>Estágio</option>
                <option value={JobType.FREELANCE}>Freelancer</option>
              </select>
            </div>

            <div>
              <label htmlFor="mode" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Modalidade
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
              >
                <option value={JobMode.REMOTE}>Remoto</option>
                <option value={JobMode.HYBRID}>Híbrido</option>
                <option value={JobMode.ONSITE}>Presencial</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
              >
                <option value={JobStatus.APPLIED}>Candidatura Enviada</option>
                <option value={JobStatus.TEST_PENDING}>Teste Pendente</option>
                <option value={JobStatus.TEST_COMPLETED}>Teste Concluído</option>
                <option value={JobStatus.INTERVIEW}>Em Entrevista</option>
                <option value={JobStatus.ACCEPTED}>Aceito</option>
                <option value={JobStatus.REJECTED}>Rejeitado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Detalhes da Vaga */}
        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[color:var(--color-card-foreground)]">
            Detalhes da Vaga
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Descrição da Vaga
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Descreva as responsabilidades e atividades da vaga..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Requisitos
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Liste os requisitos técnicos e experiências necessárias..."
              />
            </div>

            <div>
              <label htmlFor="benefits" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Benefícios
              </label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="Ex: Vale alimentação, plano de saúde, home office..."
              />
            </div>
          </div>
        </div>

        {/* Informações de Candidatura */}
        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h2 className="text-xl font-semibold mb-4 text-[color:var(--color-card-foreground)]">
            Informações de Candidatura
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="applicationUrl" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                URL da Vaga
              </label>
              <input
                type="url"
                id="applicationUrl"
                name="applicationUrl"
                value={formData.applicationUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="https://empresa.com/vagas/123"
              />
            </div>

            <div>
              <label htmlFor="applicationEmail" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
                Email de Contato
              </label>
              <input
                type="email"
                id="applicationEmail"
                name="applicationEmail"
                value={formData.applicationEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                placeholder="contato@empresa.com"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium mb-2 text-[color:var(--color-primary)]">
              Anotações Pessoais
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
              placeholder="Adicione observações, contatos feitos, próximos passos..."
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-4 pt-6 border-t border-[color:var(--color-border)]">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 md:flex-none bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Vaga'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/jobs')}
            className="flex-1 md:flex-none"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}

export default AddJobPage