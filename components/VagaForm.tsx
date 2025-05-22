'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Vaga } from '../types/vaga';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

interface VagaFormProps {
  vaga?: Vaga;
  onSuccess: () => void;
}

type VagaFormData = Omit<Vaga, '_id'>;

export default function VagaForm({ vaga, onSuccess }: VagaFormProps) {
  const form = useForm<VagaFormData>({
    defaultValues: {
      nome: vaga?.nome || '',
      descricao: vaga?.descricao || '',
      empresa: vaga?.empresa || '',
      link: vaga?.link || '',
      dataInscricao: vaga?.dataInscricao?.slice(0, 10) || '',
      status: vaga?.status || 'Inscrito',
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function onSubmit(data: VagaFormData) {
    setLoading(true);
    setError('');

    try {
      const method = vaga?._id ? 'PUT' : 'POST';
      const url = vaga?._id ? `/api/vagas/${vaga._id}` : '/api/vagas';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erro ao salvar vaga.');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg mx-auto p-6 bg-white rounded-md shadow-md"
        noValidate
      >
        {error && <p className="mb-4 text-sm text-red-600 font-semibold">{error}</p>}

        <FormField
          control={form.control}
          name="nome"
          rules={{ required: 'Nome da vaga é obrigatório.' }}
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>Nome da Vaga</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Desenvolvedor Frontend" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="empresa"
          rules={{ required: 'Empresa é obrigatória.' }}
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da empresa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="link"
          rules={{
            required: 'Link da vaga é obrigatório.',
            pattern: {
              value: /^https?:\/\/.+/,
              message: 'Digite uma URL válida.',
            },
          }}
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>Link da vaga</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          rules={{ required: 'Descrição é obrigatória.' }}
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>Descrição da Vaga</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Detalhes da vaga" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataInscricao"
          rules={{ required: 'Data de inscrição é obrigatória.' }}
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>Data de Inscrição</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          rules={{ required: 'Status é obrigatório.' }}
          render={({ field }) => (
            <FormItem className="mb-8">
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inscrito">Inscrito</SelectItem>
                    <SelectItem value="Entrevista">Entrevista</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (vaga ? 'Atualizando...' : 'Salvando...') : vaga ? 'Atualizar' : 'Criar'}
        </Button>
      </form>
    </Form>
  );
}
