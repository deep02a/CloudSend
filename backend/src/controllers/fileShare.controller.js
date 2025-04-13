import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import File from "../models/file.models.js";
import FileShares from "../models/fileShares.models.js";
import crypto from "crypto";
//import { s3 } from "../config/aws.js";
//import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
//import { GetObjectCommand } from "@aws-sdk/client-s3";
import { get_SignedUrl } from "../utils/awsS3.js";
import { v4 as uuidv4 } from 'uuid';
import e from "express";

const decryptStoredEncryptionKey = (encryptedKey) => {
    const [ivHex, encryptedHex] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(encryptedHex, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(process.env.MASTER_KEY, "hex"), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    
    return decrypted.toString("hex").slice(0, 64);
};

const encryptKeyForRecipient = (fileKey, iv, recipientKey) => {
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(recipientKey, "hex"), Buffer.from(iv, "hex"));
    const encrypted = Buffer.concat([cipher.update(fileKey, "hex"), cipher.final()]);
    return encrypted.toString("hex");
};

const decryptKeyForRecipient = (encryptedKey, recipientKey) => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(recipientKey, "hex"), Buffer.alloc(16, 0));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedKey, "hex")), decipher.final()]);
    return decrypted.toString("hex");
};

const shareFile = asyncHandler(async (req, res) => {
    const { fileId, recipientEmail } = req.body;
    const senderEmail = req.user.email;

    const file = await File.findOne({ where: { id: fileId, userEmail: senderEmail } });
    if (!file) throw new ApiError(404, "File not found or unauthorized");

    const recipient = await User.findOne({ where: { email: recipientEmail } });
    if (!recipient) throw new ApiError(404, "Recipient not found");

    if (!recipient.encryptionKey) throw new ApiError(500, "Recipient encryption key is missing in the database");
    
    const senderKeyDecrypted = req.user.getDecryptedKey();
    const recipientEncryptionKey = decryptStoredEncryptionKey(recipient.encryptionKey);
    
    const existingShare = await FileShares.findOne({ where: { fileId, recipientEmail } });
    if (existingShare) throw new ApiError(400, "File already shared with this recipient");

    const encryptedKeyForRecipient = encryptKeyForRecipient(senderKeyDecrypted, file.iv, recipientEncryptionKey);

    await FileShares.create({ id: uuidv4(), fileId, senderEmail, recipientEmail, encryptedKeyForRecipient });
    res.status(200).json(new ApiResponse(200, {}, "File shared successfully"));
});

const getdownloadFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    if (!fileId) {
        throw new ApiError(400, "File ID is required");
    }
    const recipientEmail = req.user.email;

    const fileShare = await FileShares.findOne({ where: { fileId, recipientEmail } });
    if (!fileShare) throw new ApiError(403, "Unauthorized to access this file");

    const file = await File.findOne({ where: { id: fileId } });
    if (!file) throw new ApiError(404, "File not found");

    const recipientEncryptionKey = decryptStoredEncryptionKey(req.user.encryptionKey);
    const decryptedKey = decryptKeyForRecipient(fileShare.encryptedKeyForRecipient, recipientEncryptionKey);

    //const s3Params = { Bucket: process.env.S3_BUCKET_NAME, Key: file.s3Key };
    //const command = new GetObjectCommand(s3Params);
    //const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const signedUrl = await get_SignedUrl(file.s3Key);
    if (!signedUrl) throw new ApiError(500, "Failed to generate download URL");

    res.status(200).json(new ApiResponse(200, { signedUrl, decryptionKey: decryptedKey, iv: file.iv }, "Download URL generated"));
});

const getSharedFiles = asyncHandler(async (req, res) => {
    const userEmail = req.user.email;
  
    const sharedEntries = await FileShares.findAll({
      where: { recipientEmail: userEmail },
      include: [
        { model: File, attributes: ['id', 'originalName', 'size', 'iv', 's3Key'] },
        { model: User, as: 'Sender', attributes: ['email'] }
      ]
    });
    console.log(sharedEntries);
  
    const files = sharedEntries.map(entry => ({
      fileId: entry.fileId,
      originalName: entry.file?.originalName,
      size: entry.file?.size,
      iv: entry.file?.iv,
      s3Key: entry.file?.s3Key,
      encryptedKeyForRecipient: entry.encryptedKeyForRecipient,
      senderEmail: entry.senderEmail
    }));
     
    if(!files){
      throw new ApiError(error);
    }

    if(!files.length) {
      return res.status(404).json(new ApiResponse(404, {}, "No shared files found"));
    }

    res.status(200).json({ files });
  });

export { shareFile, getdownloadFile,getSharedFiles };
