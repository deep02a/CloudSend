import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
    path: './env'
});

import connectDB from './db/index.js';



connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`listening on ${process.env.PORT || 3000}`);
    });
})
.catch((err)=>{
    console.error('Error connecting to the database:', err);
});