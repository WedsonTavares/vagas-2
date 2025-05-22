import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {

  throw new Error('Defina a variável MONGODB_URI no arquivo .env.local');
}

export const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGODB_URI);
};

