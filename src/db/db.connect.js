import mongoose from 'mongoose';

export const dbConnect = () => {
  try {
    const uri = process.env.DB_CLUSTER;

    return mongoose.connect(uri, {
      dbName: 'test',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch {
    console.log('Error connecting to Database');
  }
};
