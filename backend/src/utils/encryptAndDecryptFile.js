import crypto from "crypto";
import fs from "fs";
import path from "path";
import { pipeline } from "stream";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);


//const generateSalt=()=> {
//    return crypto.randomBytes(16).toString('hex');
//}
//const deriveKey=(password, salt)=>{
//    return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256');
//}
const generateIv = () => {
    return crypto.randomBytes(16); 
};

const encrypt = async (filePath, key, iv) => {
    const encryptedFilePath = `${filePath}.enc`; // Append .enc to indicate encryption
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    try {
        await pipelineAsync(
            fs.createReadStream(filePath),  
            cipher,                         
            fs.createWriteStream(encryptedFilePath) 
        );

        await fs.promises.unlink(filePath); // Remove the original file after encryption
        return encryptedFilePath;
    } catch (error) {
        throw new Error(`Encryption failed: ${error.message}`);
    }
};



const decryptBuffer = (encryptedBuffer, key, iv) => {
    try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error.message);
        throw new Error("Invalid password, IV, or corrupted data");
    }
};


export { encrypt, decryptBuffer,generateIv}
