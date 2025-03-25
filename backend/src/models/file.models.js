import { DataTypes } from 'sequelize';
import {sequelize} from '../db/index.js';

const Files = sequelize.define('files', {
    
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    encryptionKey: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    iv: {
        type: DataTypes.STRING(43),
        allowNull: false
    },
    userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'users',
            key: 'email'
        }
    }
},{
    tableName: 'files',
});

const File = sequelize.models.files;
const User = sequelize.models.users;

File.belongsTo(User, { foreignKey: 'email' });
User.hasMany(File);

export default Files;