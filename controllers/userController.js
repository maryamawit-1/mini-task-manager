
const bcrypt= require('bcrypt');
const jwt= require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')
const {User, Task} = require('../models')

const createUser = asyncHandler (async (req, res)=>{

    const{name, role, email, password} = req.body;

    const existing = await User.findOne({where: {email}})
    
    if(existing){
        return res.status(400).json({msg: "Email already exists"})
    }
    const hash = await bcrypt.hash(password, 10)
    const newUser = await User.create({
        name,
        role,
        email,
        password: hash
    })
   
    
    res.status(201).json({
        msg: "User created successfully", 
        user : {
            id: newUser.id,
            name: newUser.name,
            role: newUser.role
        }
    });
    
})


const getUserById = asyncHandler( async (req, res)=>{
    const id= Number(req.params.id);

    const user = await User.findByPk(id, {
        attributes: ['id', 'name', 'role', 'email']
    })
    if(!user){
        return res.status(404).json({msg: "user not found"});
    }
    res.status(200).json(user);
   
})


const getAllUsers = asyncHandler(async (req, res)=>{
    const{limit = 5, page =1, role } = req.query

    const pageNum = Number(page);
    const limitNum = Number(limit)
    const offset = (pageNum-1) * limitNum

    const whereClause = {}
    
    if(role) whereClause.role = role

    const {count, rows} = await User.findAndCountAll({
        where: whereClause,
        limit: limitNum,
        offset: offset,
        attributes: ['id', 'name', 'role', 'email'],
        order: [['name', 'ASC']]
    })

    res.status(200).json({
        page: Number(page),
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
        totalResults: count,
        results: rows
    });

})


const updateUser = asyncHandler(async (req, res)=>{
    const id= Number(req.params.id);

    const{name, role, email, password} = req.body;

    const user= await User.findByPk(id)
        
    if(!user){
        return res.status(404).json({msg: "user not found"});
    }

    const updateData ={}

    const updates=[];
    const values=[];
    if(name !== undefined) updateData.name = name
    if(role !== undefined) updateData.role = role
    if(email !== undefined) updateData.email =  email
    if(password !== undefined){
        updateData.password = await bcrypt.hash(password, 10)
    }
    
    if(Object.keys(updateData).length=== 0){
        return res.status(400).json({ msg: "No fields to update" });
    }
    
    await user.update(updateData)
        res.status(200).json({msg:"user updated successfully", 
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email
            }
        })
        

})

const deleteUser = asyncHandler( async (req, res)=>{
const id= Number(req.params.id);
    const currentUserId= req.user.id;
    if (currentUserId === id) {
        return res.status(400).json({ msg: "admin cannot delete himself" });
    }

    const user = await User.findByPk(id)
    if(!user){
        return res.status(404).json({msg: "user not found"})
    }
    const taskAssinged = await Task.findOne({ where: { assigned_user_id: id}})

    if(taskAssinged){
        return res.status(400).json({
        msg: "Cannot delete user. User is assigned to active tasks"})
    }

    await Task.update(
        {creatorId: currentUserId},
        {where: {creatorId: id}})
    await user.destroy()

     res.status(200).json({ msg: "User deleted successfully" })
})

module.exports={createUser, getAllUsers, getUserById, updateUser, deleteUser}
