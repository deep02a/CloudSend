import { DataTypes } from 'sequelize';
import {sequelize} from '../db/index.js';
import User from './user.models.js'
import File from "./file.models.js";

const FileShares = sequelize.define("FileShares", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    fileId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "files", key: "id" },
        onDelete: "CASCADE",
    },
    senderEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: "users", key: "email" },
    },
    recipientEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: { model: "users", key: "email" },
    },
    encryptedKeyForRecipient: {
        type: DataTypes.TEXT, // Store encrypted file key for the recipient
        allowNull: false,
    },
},{
    tableName: "file_shares",
});


FileShares.belongsTo(File, { foreignKey: "fileId", onDelete: "CASCADE" });
FileShares.belongsTo(User, { foreignKey: "recipientEmail", as: "Recipient" });
FileShares.belongsTo(User, { foreignKey: "senderEmail", as: "Sender" });

File.hasMany(FileShares, { foreignKey: "fileId", onDelete: "CASCADE" });
User.hasMany(FileShares, { foreignKey: "recipientEmail", as: "ReceivedFiles" });
User.hasMany(FileShares, { foreignKey: "senderEmail", as: "SentFiles" });

export default FileShares;
