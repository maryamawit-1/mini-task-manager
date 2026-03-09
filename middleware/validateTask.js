
const pool= require('../db')


const validateTask = async(req, res, next)=>{

    const data= req.body
    const errors=[]

    const allowedProperites= ["low", "medium", "high"]
    const allowedStatuses= ["todo", "in-progress", "done"]

    if(!data.title) errors.push("Title is required");
    if(!data.description) errors.push("Description is required");

    if(!allowedProperites.includes(data.priority)){
        errors.push("Priority must be low, medium, or high")
    }

    if(!allowedStatuses.includes(data.status)){
        errors.push("Status must be todo, in-progress, or done")
    }
    const assignedUserId = Number(data.assignedUserId);
    const creatorId = req.user.id;
    let connection;
    try {
        connection= await pool.getConnection();
      const [rows]= await connection.query('select id from users where id= ?', [assignedUserId])
      const[users]= await connection.query('select id from users where id= ?', [creatorId])
        if (isNaN(assignedUserId)) {
            errors.push("assignedUserId must be a number");
        }else if(rows.length === 0){
            errors.push("Assigned user does not exist");}
        if (isNaN(creatorId)) {
            errors.push("creatorId must be a number");
        }else if(users.length === 0){
            errors.push("creator does not exits")
        }
        if (errors.length > 0) {
            return res.status(400).json({ errors })
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