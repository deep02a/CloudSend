import { DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {sequelize} from '../db/index.js';

const MASTER_KEY = process.env.MASTER_KEY;


if (!MASTER_KEY) {
    throw new Error("MASTER_KEY is not defined in environment variables!");
}
// Encrypt User's Encryption Key
////const encryptKey = (key) => {
////    console.log("Encrypting Key:", key); // Debugging
////    const iv = crypto.randomBytes(16);
////    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(MASTER_KEY, "hex"), iv);
////    const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);
////    
////    const result = `${iv.toString("hex")}:${encrypted.toString("hex")}`;
////    console.log("Encrypted Key:", result);
////    return result;
////};

// Decrypt User's Encryption Key
const decryptKey = (encryptedKey) => {
    const [ivHex, encryptedHex] = encryptedKey.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(encryptedHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(MASTER_KEY, "hex"), iv);
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    
    return decrypted.toString("utf8");  // Should return a raw 32-byte binary key
};



const User = sequelize.define('users',{
    username:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
        unique: true,
        lowercase:true
    },
    encryptionKey: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    refreshToken: {
        type: DataTypes.STRING,
    }
},{
    tableName: 'users',
})

User.beforeCreate(async (user, options) => {
    if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

User.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

User.prototype.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

User.prototype.getDecryptedKey = function () {
    return decryptKey(this.encryptionKey);
};

User.prototype.generateAccessToken =  function(){
    return jwt.sign(
        {
            email:this.email,
            username:this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

User.prototype.generateRefreshToken = function(){
    return jwt.sign(
        {
            email:this.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export default User;