import pg from 'pg';
const {Pool}=pg;


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

const connectDB = async()=>{
    try {
        const connectionInstance=await pool.connect();
        console.log(`Connected to PostgreSQL database,DB_NAME:${process.env.DB_NAME}`);
    } catch (err) {
        console.error('Error connecting to PostgreSQL database', err.stack);
        process.exit(1);
    }
}
  
  
  export default connectDB;