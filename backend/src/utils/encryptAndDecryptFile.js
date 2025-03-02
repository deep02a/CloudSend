import crypto from 'crypto';

const generateSalt=()=> {
    return crypto.randomBytes(16).toString('hex');
}
const deriveKey=(password, salt)=>{
    return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256');
}
const generateIv=()=>{
    return crypto.randomBytes(16).toString('hex');
}

const encrypt = async(data,key,iv) =>{
    const cipher = crypto.createCipheriv('aes-256-cbc', key,iv);
    let chunks = [];
    const encryptedData = await new Promise((resolve, reject) => {
        cipher.on('data', (chunk) => chunks.push(chunk));
        cipher.on('end', () => resolve(Buffer.concat(chunks)));
        cipher.on('error', (err) => reject(err));
            
            try {
                cipher.write(data);
                cipher.end();
            } catch (err) {
                reject(err);
            }
        });
        return encryptedData ;
    };


const decrypt = async(ciphertext, key,iv,salt) =>{
    const decipher = crypto.createDecipher('aes-256-cbc', key,iv);
    const decrypted = await new Promise((resolve, reject) => {
        let chunks = [];
        decipher.on('data', (chunk) => chunks.push(chunk));
        decipher.on('end', () => resolve(Buffer.concat(chunks)));
        decipher.on('error', (err) => reject(err));
        try {
            decipher.write(ciphertext);
            decipher.end();
        } catch (error) {
            reject(err);
        }
    });
    return decrypted;
}

export {generateSalt, deriveKey, encrypt, decrypt,generateIv}
