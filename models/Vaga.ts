import mongoose from 'mongoose';

const VagaSchema = new mongoose.Schema({
  nome: String,
  descricao: String,
  empresa: String,
  link: String,
  dataInscricao: Date,
  status: {
    type: String,
    enum: ['Inscrito', 'Entrevista', 'Rejeitado', 'Contratado'],
    default: 'Inscrito',
  },
});

export default mongoose.models.Vaga || mongoose.model('Vaga', VagaSchema);
