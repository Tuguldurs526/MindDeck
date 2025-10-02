import express from 'express'
import dotenv from 'dotenv'
import connectDB from "./config/db.ts";

dotenv.config()

const app = express();
const PORT = 3000;

connectDB()

app.get('/',(req,res)=>{
    res.json({messsage:"Hello "});
})

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}...`);
})

