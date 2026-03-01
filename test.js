const pool= require('./db');

async function getAllUsers(){
    try{
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM users');
        connection.release();
        return rows;
    }catch(error){
        console.error('DB Error: ', error);
        throw error;
    }
}
getAllUsers().then(results=> console.log(results))