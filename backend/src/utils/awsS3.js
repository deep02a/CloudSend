import { S3Client,PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";

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
    const upload = await  s3Client.send(command);
    return upload;
}

const streamToBuffer = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
};

const getFromS3 = async(filename)  =>{
    const command = new GetObjectCommand({
        Bucket: 'project.encryptedfiles',
        Key: filename,
    })
    const data = await s3Client.send(command);
    if (!data.Body) throw new Error("File not found");

    return await streamToBuffer(data.Body);
}
export {uploadToS3,getFromS3}