import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.models.js";
import File from "../models/file.models.js";
import FileShares from "../models/fileshares.models.js";
import crypto from "crypto";
import { s3 } from "../config/aws.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const encryptKeyForRecipient = (key, recipientEncryptionKey) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(recipientEncryptionKey, "hex"), iv);
    const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

const decryptKeyForRecipient = (encryptedKey, recipientEncryptionKey) => {
    const [ivHex, encryptedHex] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(encryptedHex, "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(recipientEncryptionKey, "hex"), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    
    return decrypted.toString("utf8");
};

const shareFile = asyncHandler(async (req, res) => {
    const { fileId, recipientEmail } = req.body;
    const senderEmail = req.user.email;

    const file = await File.findOne({ where: { id: fileId, userEmail: senderEmail } });
    if (!file) throw new ApiError(404, "File not found or unauthorized");

    const recipient = await User.findOne({ where: { email: recipientEmail } });
    if (!recipient) throw new ApiError(404, "Recipient not found");

    const encryptedKeyForRecipient = encryptKeyForRecipient(req.user.encryptionKey, recipient.encryptionKey);

    await FileShares.create({ fileId, senderEmail, recipientEmail, encryptedKeyForRecipient });
    res.status(200).json(new ApiResponse(200, {}, "File shared successfully"));
});

const downloadFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const recipientEmail = req.user.email;

    const fileShare = await FileShares.findOne({ where: { fileId, recipientEmail } });
    if (!fileShare) throw new ApiError(403, "Unauthorized to access this file");

    const file = await File.findOne({ where: { id: fileId } });
    if (!file) throw new ApiError(404, "File not found");

    const decryptedKey = decryptKeyForRecipient(fileShare.encryptedKeyForRecipient, req.user.encryptionKey);

    const s3Params = { Bucket: process.env.S3_BUCKET_NAME, Key: file.s3Key };
    const command = new GetObjectCommand(s3Params);
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.status(200).json(new ApiResponse(200, { signedUrl, decryptionKey: decryptedKey }, "Download URL generated"));
});

export { shareFile, downloadFile };
