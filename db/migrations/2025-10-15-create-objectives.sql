-- Migration: Create objectives and objective_checklists tables with automatic progress calculation and optional history
-- Execute this in Supabase SQL editor or via your migration tool

-- ==============================
-- 1️⃣ TABELA PRINCIPAL: OBJECTIVES
-- ==============================
CREATE TABLE IF NOT EXISTS public.objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId text NOT NULL,
  name text NOT NULL,
  startDate timestamptz,
  endDate timestamptz,
  status text CHECK (status IN ('concluido', 'em_andamento', 'futuro')) NOT NULL DEFAULT 'futuro',
  progress numeric DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_objectives_userid ON public.objectives (userId);
CREATE INDEX IF NOT EXISTS idx_objectives_status ON public.objectives (status);
CREATE INDEX IF NOT EXISTS idx_objectives_startdate ON public.objectives (startDate);
CREATE INDEX IF NOT EXISTS idx_objectives_enddate ON public.objectives (endDate);

-- ==============================
-- 2️⃣ TABELA DE CHECKLISTS: OBJECTIVE_CHECKLISTS
-- ==============================
CREATE TABLE IF NOT EXISTS public.objective_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objectiveId uuid REFERENCES public.objectives(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  completed boolean NOT NULL DEFAULT false,
  orderIndex integer DEFAULT 0,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checklists_objectiveid ON public.objective_checklists (objectiveId);
CREATE INDEX IF NOT EXISTS idx_checklists_completed ON public.objective_checklists (completed);
CREATE INDEX IF NOT EXISTS idx_checklists_orderindex ON public.objective_checklists (orderIndex);

-- ==============================
-- 3️⃣ TABELA DE HISTÓRICO (OPCIONAL)
-- ==============================
CREATE TABLE IF NOT EXISTS public.objective_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objectiveId uuid REFERENCES public.objectives(id) ON DELETE CASCADE,
  action text NOT NULL, -- ex: 'created', 'updated', 'checklist_completed', 'deleted'
  details text,
  createdAt timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_objectiveid ON public.objective_history (objectiveId);
CREATE INDEX IF NOT EXISTS idx_history_action ON public.objective_history (action);

-- ==============================
-- 4️⃣ FUNÇÃO PARA ATUALIZAR O PROGRESSO DO OBJETIVO
-- ==============================
CREATE OR REPLACE FUNCTION public.update_objective_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_tasks INTEGER;
  completed_tasks INTEGER;
  new_progress NUMERIC;
BEGIN
  -- Conta o total e o número de tarefas concluídas
  SELECT COUNT(*), COUNT(*) FILTER (WHERE completed)
  INTO total_tasks, completed_tasks
  FROM public.objective_checklists
  WHERE objectiveId = NEW.objectiveId;

  -- Calcula o progresso
  IF total_tasks = 0 THEN
    new_progress := 0;
  ELSE
    new_progress := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100, 2);
  END IF;

  -- Atualiza o progresso do objetivo
  UPDATE public.objectives
  SET 
    progress = new_progress,
    status = CASE 
      WHEN new_progress = 100 THEN 'concluido'
      WHEN new_progress > 0 THEN 'em_andamento'
      ELSE 'futuro'
    END,
    updatedAt = now()
  WHERE id = NEW.objectiveId;

  -- (Opcional) Adiciona histórico
  INSERT INTO public.objective_history (objectiveId, action, details)
  VALUES (NEW.objectiveId, 'progress_updated', CONCAT('Progress set to ', new_progress, '%'));

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- 5️⃣ TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ==============================
-- Após INSERT
CREATE TRIGGER trg_update_progress_after_insert
AFTER INSERT ON public.objective_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_objective_progress();

-- Após UPDATE
CREATE TRIGGER trg_update_progress_after_update
AFTER UPDATE ON public.objective_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_objective_progress();

-- Após DELETE
CREATE TRIGGER trg_update_progress_after_delete
AFTER DELETE ON public.objective_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_objective_progress();

-- ==============================
-- 6️⃣ DICAS DE USO
-- ==============================
-- - Histórico é opcional, mas útil para auditoria e analytics.
-- - Índices extras facilitam filtros por data, ordem e ação.
-- - O modelo suporta expansão futura (subtarefas, tags, etc).
-- - O front pode exibir barra de progresso, checklist interativo e histórico de ações.
