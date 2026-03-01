const tasks = require('../tasks');
const users= require('../users')
const pool= require('../db')

async function createUser(req, res){
    const{name, role, email, password} = req.body;
    if(!name || !role ||!email || !password){
        return res.status(400).json({msg: "All fields are required" })
    }

    const allowedRoles= ["admin", "member"];
    if(!allowedRoles.includes(role)){
        return res.status(400).json({msg: "incorrect value for role"})
    }
    let connection;
    try{
        connection= await pool.getConnection();
        const [existing]= await connection.query('select id from users where email =? ', [email])
        if(existing.length>0){
            connection.release();
            return res.stataus(400).json({msg: "Email already exists"})
        }
        const [result]= await connection.query('insert into users (name, role, email, password) values(?, ?, ?, ?)', [name, role, email, password])
        connection.release();
        const user= {id: result.insertId,
                name,
                role
            };
    
        res.status(201).json({
            msg: "User created successfully", user 
            });
    }catch(error){
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }
    
    
    
}

async function getUserById (req, res){
    const id= Number(req.params.id);

    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});

    let connection;
    try{
        connection= await pool.getConnection();
        const[rows]= await connection.query('select id, name, role from users where id= ?', [id]);
        if(rows.length === 0){
            return res.status(404).json({msg: "user not found"});
        }
        res.status(200).json(rows[0]);
    }catch(error){
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }    
}

async function getAllUsers (req, res){
    let connection;
    try{
        connection= await pool.getConnection();
        const[rows] = await connection.query('select id, name, role from users')
        res.status(200).json(rows);
    }catch(err){
        console.error(err);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    } 
}

async function updateUser (req, res){
    const id= Number(req.params.id);
    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});

    const{name, role, email, password} = req.body;
    const allowedRoles= ["admin", "member"];
    if(role && !allowedRoles.includes(role)){
        return res.status(400).json({ msg: "Invalid role" });
    }
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows]= await connection.query('select id from users where id= ?', [id])

        if(rows.length === 0){
            return res.status(404).json({msg: "user not found"});
        }
        const updates=[];
        const values=[];
        if(name !== undefined){
            updates.push("name= ?");
            values.push(name);
        }
       
        if(role !== undefined){
            updates.push("role= ?");
            values.push(role)
        }
        if(email !== undefined){
            updates.push("email= ?")
            values.push(email)
        }
        if(password !== undefined){
            // const bcrypt = require("bcrypt");
            // const hashed = await bcrypt.hash(password, 10);
            updates.push("password = ?");
            values.push(password);
        }
        if(updates.length=== 0){
            return res.status(400).json({ msg: "No fields to update" });
        }
        values.push(id);
        const sql= `update users set ${updates.join(", ")} where id= ?`;
        await connection.query(sql, values);
        const [updatedRows]= await connection.query('select id, name, role, email from users where id= ?' , [id]);
        res.status(200).json({msg:"user updated successfully", 
            user: updatedRows[0]
        })
        
        
    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }

}

async function deleteUser (req, res){
    const id= Number(req.params.id);
    const currentUserId= req.header('currentUserId');
    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});

    if (currentUserId.id === id) {
        return res.status(400).json({ msg: "admin cannot delete himself" });
    }

    let connection;
    try {
        connection = await pool.getConnection()
        const[users]= await connection.query('select id from users where id= ?', [id])
        if(users.length === 0){
            return res.status(404).json({msg: "user not found"})
        }
        const[tasks]= await connection.query('select id from tasks where assigned_user_id = ?', [id])
        if(tasks.length !== 0){
            return res.status(400).json({
            msg: "Cannot delete user. User is assigned to active tasks"
        })
        }
    
        await connection.query('update tasks set creator_id = ? where creator_id = ?', [currentUserId, id])
        const[result]= await connection.query('delete from users where id= ?', [id])

        if(result.affectedRows === 0){
            return res.status(400).json({msg: "no product found with that id"})
        }
        res.status(200).json({msg: "User deleted successfully"})

    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }
}
module.exports={createUser, getAllUsers, getUserById, updateUser, deleteUser}
