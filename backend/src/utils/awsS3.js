import { S3Client,PutObjectCommand,GetObjectCommand, HeadObjectCommand,} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const checkIfFileExists = async (s3Key) => {
    try {
        const command = {
            Bucket: 'project.encryptedfiles',
            Key: s3Key
        };
        await s3Client.send(new HeadObjectCommand(command)); // Checks if file exists
        return true;
    } catch (error) {
        console.error("File does not exist or access denied:", error);
        return false;
    }
};


const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];

        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", (error) => {
            console.error("Stream error:", error);
            reject(new Error(`Failed to convert stream to buffer: ${error.message}`));
        });
    });
};


const getFromS3 = async (s3Key) => {
    const params = {
        Bucket: 'project.encryptedfiles',
        Key: s3Key
    };

    try {
        console.log(`Checking if file exists in S3: ${s3Key}`);
        if (!(await checkIfFileExists(s3Key))) {
            throw new Error(`File not found: ${s3Key}`);
        }

        console.log("Downloading file from S3...");
        const command = new GetObjectCommand(params);
        const { Body } = await s3Client.send(command);

        console.log("Converting stream to buffer...");
        const buffer = await streamToBuffer(Body);

        console.log(`File ${s3Key} downloaded successfully.`);
        return buffer;
    } catch (error) {
        console.error(`Error downloading file from S3 [${s3Key}]:`, error.message);
        throw new Error(`Failed to download file: ${error.message}`);
    }
};


const get_SignedUrl = async (s3key) => {
    try {
        const command = new GetObjectCommand({
            Bucket: 'project.encryptedfiles',
            Key: s3key
        });
        
        const signedUrl = await getSignedUrl(s3Client, command, { 
            expiresIn: 3600 
        });
        
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw error; 
    }
};

export {uploadToS3,getFromS3,get_SignedUrl}