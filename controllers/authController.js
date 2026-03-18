const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken')
const {User} = require('../models')
const asyncHandler = require('../utils/asyncHandler')


const login = asyncHandler( async(req, res)=>{
    const {email, password} = req.body;
    const user= await User.findOne({where : {email}})
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
    
})

const register =asyncHandler( async (req, res)=>{
 const{name, email, password} = req.body;
   
    const existingUser = await User.findOne({ where: {email}})
    if(existingUser){
        return res.status(400).json({msg: "Email already exists"})
    }
    const role="member"
    const hash = await bcrypt.hash(password, 10)

    const newUser = await User.create({ name, email, password: hash, role})

    
    res.status(201).json({
        msg: "User created successfully", 
        user: {
            id: newUser.id,
            name: newUser.name,
            role: newUser.role
        }
    });
})

module.exports= {login, register}