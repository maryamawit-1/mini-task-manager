
const pool= require('../db')
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')

const createUser = asyncHandler (async (req, res)=>{

    const{name, role, email, password} = req.body;
    const [existing]= await pool.query('select id from users where email =? ', [email])
    
    if(existing.length>0){
        return res.status(400).json({msg: "Email already exists"})
    }
    const hash = await bcrypt.hash(password, 10)
    const [result]= await pool.query('insert into users (name, role, email, password) values(?, ?, ?, ?)', [name, role, email, hash])
    const user= {id: result.insertId,
                name,
                role
            };
    
    res.status(201).json({
        msg: "User created successfully", user 
    });
    
})


const getUserById = asyncHandler( async (req, res)=>{
    const id= Number(req.params.id);

    const[rows]= await pool.query('select id, name, role from users where id= ?', [id]);
    if(rows.length === 0){
        return res.status(404).json({msg: "user not found"});
    }
    res.status(200).json(rows[0]);
   
})


const getAllUsers = asyncHandler(async (req, res)=>{
    const{limit = 5, page =1, role } = req.query

    const pageNum = Number(page);
    const limitNum = Number(limit)
    const offset = (pageNum-1) * limitNum
    let sql= `select id, name, role from users where 1=1`
    const params =[]
    let countSql = `select count(*) as total from users where 1=1`
    const countParams= []
    
    if(role){
        sql +=" AND role= ?"
        params.push(role)
        countSql += " AND role= ?"
        countParams.push(role)
    }
    sql += " limit ? offset ?"
    params.push(limitNum, offset)
    
    const[[{total}]]=await pool.query(countSql, countParams)
    const totalPages= Math.ceil(total/limitNum)
    const[rows] = await pool.query(sql, params)
    res.status(200).json({
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalResults: total,
        results: rows
    });

})


const updateUser = asyncHandler(async (req, res)=>{
    const id= Number(req.params.id);

    const{name, role, email, password} = req.body;
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
            const hashed= await bcrypt.hash(password, 10)
            updates.push("password = ?");
            values.push(hashed);
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
        
        
    }finally{
        if(connection)  connection.release();
    }

})

const deleteUser = asyncHandler( async (req, res)=>{
const id= Number(req.params.id);
    const currentUserId= req.user.id;
    if (currentUserId === id) {
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

    }finally{
        if(connection)  connection.release();
    }

})

module.exports={createUser, getAllUsers, getUserById, updateUser, deleteUser}
