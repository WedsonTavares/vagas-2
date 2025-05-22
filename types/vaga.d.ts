export interface Vaga {
  _id?: string;
  nome: string;
  descricao: string;
  empresa: string;
  link: string;
  dataInscricao: string;
  status: 'Inscrito' | 'Entrevista' | 'Rejeitado' | 'Contratado';
}


