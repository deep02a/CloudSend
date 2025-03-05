import {Sequelize} from 'sequelize'

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
    }
)

const connectDB = async()=>{
    try {
        const connectionInstance=await sequelize.authenticate();
        console.log(`Connected to PostgreSQL database,DB_NAME:${process.env.DB_NAME}`);
    } catch (err) {
        console.error('Error connecting to PostgreSQL database', err.stack);
        process.exit(1);
    }
}
  
  
  export {sequelize, connectDB};