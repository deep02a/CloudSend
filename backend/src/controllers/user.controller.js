import {generateSalt, deriveKey, encrypt, decrypt,generateIv} from '../utils/encryptAndDecryptFile.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import { uploadToS3 } from '../utils/awsS3.js';

const uploadFile = asyncHandler(async(req, res)=>{
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded!' });
    }
    const filename = req.body.username+"/"+req.file.originalname;
    const {password} = req.body;
        
    // Generate encryption key using the provided password
    const salt = generateSalt();
    const key = deriveKey(password,salt);
    const iv = generateIv();
        
    // Encrypt the uploaded file data
    const encryptedData = await encrypt(req.file.buffer, key,iv);

        
    // Upload the encrypted data to S3
    await uploadToS3(encryptedData,filename,req.file.mimetype);
        
    return res.status(200).json({
        message: 'File uploaded successfully!',
        filename: originalname,
    })
})

const downloadFile = asyncHandler(async(req, res)=>{
    try {
        const filename = req.params.filename;
        const password = req.query.password;
        
        // Download the encrypted file from S3
        const encryptedData = await downloadFromS3(filename);
        
        // Decrypt the downloaded data using the provided key
        const decryptedData = await decryptFile(encryptedData, password);
        
        return { data: decryptedData };
    } catch (error) {
        throw new Error('Failed to download file');
    }

});

export { uploadFile, downloadFile };