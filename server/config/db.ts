import mongoose from 'mongoose'

const connectDB = async ()=>{
    try{
        const mongoURI = process.env.MONGO_URI

        if(!mongoURI){
            throw Error('URI not defined in env');
        }
        
        await mongoose.connect(mongoURI);
        console.log('Successfully connected to DB...');
    }
    catch(err:any){
        console.error(err.message);
        process.exit(1)
    }
};

export default connectDB;