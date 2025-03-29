import { DataTypes } from 'sequelize';
import {sequelize} from '../db/index.js';
import User from './user.models.js'

const Files = sequelize.define('files', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, 
        allowNull: false,
        primaryKey: true
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    iv: {
        type: DataTypes.STRING(43),
        allowNull: false
    },
    s3Key:{
        type: DataTypes.STRING,
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

Files.belongsTo(User, { foreignKey: 'userEmail', targetKey: 'email' });
User.hasMany(Files, { foreignKey: 'userEmail', sourceKey: 'email' });

export default Files;