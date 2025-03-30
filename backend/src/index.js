import dotenv from "dotenv";
import { app } from "./app.js";
import User from "./models/user.models.js";
import Files from "./models/file.models.js";
import FileShares from "./models/fileShares.models.js";
dotenv.config({
    path: './env'
});

import {connectDB} from './db/index.js';

User.sync();
Files.sync({alter:true});
FileShares.sync({alter:true});


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3001,()=>{
        console.log(`listening on ${process.env.PORT || 3001}`);
    });
})
.catch((err)=>{
    console.error('Error connecting to the database:', err);
});
