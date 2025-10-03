import { Job } from '@/types'
import { Button } from '@/components/ui/button'

interface JobEditModalProps {
  isOpen: boolean
  editingJob: Job | null
  editFormData: Partial<Job>
  onFormDataChange: (data: Partial<Job>) => void
  onSave: () => void
  onCancel: () => void
}

export default function JobEditModal({
  isOpen,
  editingJob,
  editFormData,
  onFormDataChange,
  onSave,
  onCancel
}: JobEditModalProps) {
  if (!isOpen || !editingJob) return null

  const handleInputChange = (field: keyof Job, value: string) => {
    onFormDataChange({ ...editFormData, [field]: value })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[color:var(--color-background)] rounded-2xl shadow-2xl border border-[color:var(--color-border)]/20 max-w-3xl w-full max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-[color:var(--color-primary)]/5 to-[color:var(--color-primary)]/10 p-6 border-b border-[color:var(--color-border)]/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[color:var(--color-primary)]/10 flex items-center justify-center">
                <span className="text-lg">✏️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[color:var(--color-primary)]">
                  Editar Vaga
                </h2>
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  Atualize as informações da vaga
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full bg-[color:var(--color-muted)]/10 hover:bg-[color:var(--color-muted)]/20 transition-colors flex items-center justify-center text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
            >
              ×
            </button>
          </div>
        </div>

        {/* Conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <form className="space-y-8">
            {/* Informações Básicas */}
            <div className="bg-[color:var(--color-muted)]/5 rounded-xl p-6 border border-[color:var(--color-border)]/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-xs text-blue-600 dark:text-blue-400">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">Informações Básicas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Título da Vaga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                    placeholder="Ex: Desenvolvedor Frontend React"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                    placeholder="Ex: Tech Company LTDA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Localização
                  </label>
                  <input
                    type="text"
                    value={editFormData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Salário
                  </label>
                  <input
                    type="text"
                    value={editFormData.salary || ''}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                    placeholder="Ex: R$ 8.000 - R$ 12.000"
                  />
                </div>
              </div>
            </div>

            {/* Detalhes da Vaga */}
            <div className="bg-[color:var(--color-muted)]/5 rounded-xl p-6 border border-[color:var(--color-border)]/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-xs text-green-600 dark:text-green-400">📝</span>
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">Detalhes da Vaga</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Descrição da Vaga
                  </label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all resize-y"
                    placeholder="Descreva as responsabilidades e atividades da vaga..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Requisitos
                  </label>
                  <textarea
                    value={editFormData.requirements || ''}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all resize-y"
                    placeholder="Liste os requisitos técnicos e experiências necessárias..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Benefícios
                  </label>
                  <textarea
                    value={editFormData.benefits || ''}
                    onChange={(e) => handleInputChange('benefits', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all resize-y"
                    placeholder="Ex: Vale alimentação, plano de saúde, home office..."
                  />
                </div>
              </div>
            </div>

            {/* Informações de Candidatura */}
            <div className="bg-[color:var(--color-muted)]/5 rounded-xl p-6 border border-[color:var(--color-border)]/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <span className="text-xs text-purple-600 dark:text-purple-400">🔗</span>
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">Informações de Candidatura</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    URL da Vaga
                  </label>
                  <input
                    type="url"
                    value={editFormData.applicationUrl || ''}
                    onChange={(e) => handleInputChange('applicationUrl', e.target.value)}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                    placeholder="https://empresa.com/vagas/123"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[color:var(--color-foreground)]">
                    Email de Contato
                  </label>
                  <input
                    type="email"
                    value={editFormData.applicationEmail || ''}
                    onChange={(e) => handleInputChange('applicationEmail', e.target.value)}
                    className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all"
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </div>

            {/* Anotações Pessoais */}
            <div className="bg-[color:var(--color-muted)]/5 rounded-xl p-6 border border-[color:var(--color-border)]/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <span className="text-xs text-orange-600 dark:text-orange-400">📌</span>
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--color-primary)]">Anotações Pessoais</h3>
              </div>
              <div className="space-y-2">
                <textarea
                  value={editFormData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-background)] text-[color:var(--color-foreground)] focus:ring-2 focus:ring-[color:var(--color-primary)]/20 focus:border-[color:var(--color-primary)] transition-all resize-y"
                  placeholder="Suas anotações pessoais sobre esta vaga..."
                />
              </div>
            </div>
          </form>
          </div>
        </div>

        {/* Footer com botões - sempre visível */}
        <div className="flex-shrink-0 bg-[color:var(--color-muted)]/5 px-6 py-4 border-t border-[color:var(--color-border)]/20">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onSave}
              className="flex-1 bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-primary)]/90 text-[color:var(--color-primary-foreground)] hover:from-[color:var(--color-primary)]/90 hover:to-[color:var(--color-primary)]/80 transition-all duration-200 shadow-lg hover:shadow-xl font-medium py-3"
            >
              <span className="mr-2">💾</span>
              Salvar Alterações
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-[color:var(--color-border)] hover:bg-[color:var(--color-muted)]/10 transition-all duration-200 font-medium py-3"
            >
              <span className="mr-2">❌</span>
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}