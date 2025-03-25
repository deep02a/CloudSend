import {generateSalt, deriveKey, encrypt, decrypt,generateIv} from '../utils/encryptAndDecryptFile.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import { uploadToS3 } from '../utils/awsS3.js';
import Files from '../models/file.models.js';

const uploadFile = asyncHandler(async(req, res)=>{
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded!' });
    }

    const s3Key=`users/${req.user.email}/${req.file.originalname}`;
    const {password} = req.body;
        
    // Generate encryption key using the provided password
    const salt = generateSalt();
    const key = deriveKey(password,salt);
    const iv = generateIv();
        
    // Encrypt the uploaded file data
    const encryptedData = await encrypt(req.file.buffer, key,iv);

        
    // Upload the encrypted data to S3
    await uploadToS3(encryptedData,s3Key,req.file.mimetype);

    const newFile = Files.build({
        originalName: req.file.originalname,
        size: req.file.size,
        encryptionKey: key.toString('hex'),
        iv: iv.toString('hex'),
        userEmail:req.user.email,
        email:req.user.email
    });
    console.log(req.user);
    await newFile.save();

    if (!newFile) {
        return res.status(500).json({ error: 'Failed to save metadata to database' });
    }
        
    return res.status(200).json({
        message: 'File uploaded successfully!',
        filename: req.file.originalname,
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

export { uploadFile, downloadFile, };