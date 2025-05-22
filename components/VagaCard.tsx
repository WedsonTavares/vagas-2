'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Vaga } from '../types/vaga';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import React from 'react';

interface VagaCardProps {
  vaga: Vaga;
  onDeleted: () => void;
}

export default function VagaCard({ vaga, onDeleted }: VagaCardProps) {
  const [expandido, setExpandido] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vagas/${id}`, {
        method: 'DELETE',
        headers: {
          'authorization': '99028461'
        }
      });

      if (!res.ok) throw new Error('Erro ao excluir');

      setMensagem('Vaga excluída com sucesso!');

      setTimeout(() => {
        setMensagem('');
        onDeleted(); 
      }, 1000);

    } catch (err) {
      setMensagem('Erro ao excluir vaga.');
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const statusColor = () => {
    switch (vaga.status) {
      case 'Contratado':
        return 'text-green-700';
      case 'Rejeitado':
        return 'text-red-700';
      case 'Entrevista':
        return 'text-yellow-700';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card className="mb-4 cursor-pointer" onClick={() => setExpandido(!expandido)}>
      <CardHeader className="flex justify-between items-start">
        <div>
          <h2 className="text-gray-900 text-lg font-semibold">{vaga.nome}</h2>
          <p className="text-gray-600 text-sm mt-0.5">{vaga.empresa}</p>
          <p className="text-gray-600 text-sm mt-0.5">
            {new Date(vaga.dataInscricao).toLocaleDateString('pt-BR')}
          </p>
          <p className={`text-sm font-medium mt-1 ${statusColor()}`}>Status: {vaga.status}</p>
        </div>
        <div className="text-gray-500 text-xl mt-1">
          {expandido ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </CardHeader>

      <AnimatePresence>
        {expandido && (
          <motion.div
            key="expandido"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mensagem de sucesso ou erro */}
            {mensagem && (
              <div className="mb-2 p-2 bg-green-100 text-green-800 rounded text-sm font-medium">
                {mensagem}
              </div>
            )}

            <CardContent className="text-gray-700 text-sm border-t border-gray-300 pt-4">
              <p>{vaga.descricao}</p>
              <CardFooter className="flex gap-6 mt-4">
                <Link
                  href={`/vagas/editar/${vaga._id}`}
                  className="text-blue-700 hover:text-blue-900 font-semibold transition-colors"
                >
                  Editar
                </Link>
                <Button
                  variant="link"
                  className="text-red-700 hover:text-red-900 font-semibold p-0"
                  onClick={() => vaga._id && handleDelete(vaga._id)}
                  type="button"
                >
                  Excluir
                </Button>
              </CardFooter>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
