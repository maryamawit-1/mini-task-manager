
const pool= require('../db')


const validateTask = async(req, res, next)=>{

    const {assignedUserId} = req.body;
    
    let connection;
    try {
        connection= await pool.getConnection();
      const [rows]= await connection.query('select id from users where id= ?', [assignedUserId])

      if (rows.length === 0) {
            return res.status(400).json({
                msg: "Assigned user does not exist"
            })
        }   

        next()

        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server validation error" })
    }finally{
        if(connection)  connection.release();
    }   
}

module.exports = validateTask