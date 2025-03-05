import { DataTypes } from 'sequelize';
import {sequelize} from '../db/index.js';

const User = sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique: true,
        lowercase:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:[false,'password is required']
    },
    refreshToken: {
        type: DataTypes.STRING,
    }
},{
    tableName: 'users',
})


export default User;