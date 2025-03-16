import { DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {sequelize} from '../db/index.js';

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
    password:{
        type:DataTypes.STRING,
        allowNull:[false,'password is required']
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