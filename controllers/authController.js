const pool= require('../db')
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')


const login = asyncHandler( async(req, res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({msg: "Please enter both email and password" })
    }
    let connection

    try {
        connection = await pool.getConnection()
        const [rows] = await connection.query('select * from users where email = ?', [email])
        const user= rows[0]
        if (!user) {
        return res.status(401).json({ msg: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const token = jwt.sign({id: user.id, role: user.role}, process.env.JWT_SECRET, {expiresIn: "15m"})
        res.json({
        msg: "Login successful",
        token,
        });
    }finally{
        if(connection)  connection.release();
    }
})

const register =asyncHandler( async (req, res)=>{
 const{name, email, password} = req.body;
    if(!name ||!email || !password){
        return res.status(400).json({msg: "All fields are required" })
    }
   
    const [existing]= await pool.query('select id from users where email =? ', [email])
    
    if(existing.length>0){
        return res.status(400).json({msg: "Email already exists"})
    }
    const role="member"
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

module.exports= {login, register}