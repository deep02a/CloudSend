import { S3Client,PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ 
    region: "ap-south-1",
    credentials:{
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    } 
});
const uploadToS3 = async(fileBuffer,filename,mimetype)=>{
    const command = new PutObjectCommand({
        Bucket: 'project.encryptedfiles',
        Body: fileBuffer,
        Key: filename,
        ContentType:mimetype,
    })
    const upload = await send(s3Client,command);
    return upload;
}
export {uploadToS3}