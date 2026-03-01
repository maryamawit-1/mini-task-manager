const users = require('../users')
const pool= require('../db')

async function requireAdmin(req, res, next){
    const currentUserId= req.header('currentUserId');
    try{
        if(!currentUserId){
            return res.status(401).json({msg: "User ID missing"})
        }
        const connection = await pool.getConnection();
        const[rows] =await connection.query('select id, role from users where id = ?', [currentUserId]);
        if(rows.length === 0 || rows[0].role != "admin"){
            return res.status(403).json({msg: "Admin only"})
        }

        req.currentUser= rows[0];
        next();
    }catch(error){
        console.error(error)
        res.status(500).json({msg: "server error"})    
    }
}
// function requireAdmin(req, res, next){
//     const currentUser= users.find(u=>u.id == req.header('currentUserId'));
//     if(!currentUser || currentUser.role !== "admin"){
//         return res.status(403).json({msg: "Admin only"})
//     }
//     req.currentUser= currentUser
//     next();
// }



module.exports= {requireAdmin};