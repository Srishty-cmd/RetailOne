import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/storesync';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully');
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
