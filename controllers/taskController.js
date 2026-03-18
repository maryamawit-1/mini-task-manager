
const asyncHandler = require('../utils/asyncHandler')
const {Task, User} = require('../models')
const createTask = asyncHandler( async (req, res)=>{
    const creatorId = req.user.id

    const {
        title, 
        description, 
        status, 
        priority, 
        assignedUserId, 
        dueDate
    }= req.body


    const task = await Task.create({
        title, 
        description, 
        status, 
        priority, 
        assigned_user_id: assignedUserId, 
        creator_id: creatorId, 
        due_date: dueDate}) 

    res.status(201).json({
        msg: "task created",
        task
    })

})


const getTasks = asyncHandler(async(req, res)=>{
 
        const{ page= 1, limit= 5, priority, status, assignedUserId, creatorId, dueBefore, dueAfter} = req.query
        
        const whereClause ={}
        if(status) whereClause.status = status
        if(priority) whereClause.priority = priority
        if(assignedUserId) whereClause.assignedUserId = assignedUserId
        if(creatorId) whereClause.creatorId = creatorId

        if(dueBefore || dueAfter){
            whereClause.dueDate= {};
            if(dueBefore) whereClause.dueDate[Op.lte] = dueBefore
            if(dueAfter) whereClause.dueDate[Op.gte] = dueAfter
        }

        const offset= (page -1)* limit

        const {count, rows} = await Task.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset),
            attributes: ['id', 'title', 'description', 'status', 'priority'],
            include:[
                {model: User, as: 'assignee', attributes: ['id', 'name']},
                {model: User, as: 'creator', attributes: ['id', 'name']}
            ],
            order: [['createdAt', 'DESC']]
        }) 

        return res.status(200).json({
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count/ limit),
            totalResults:count,
            results: rows
        });
 
})

const getTaskById = asyncHandler(async (req, res)=>{
    const id= Number(req.params.id);
   
    const task = await Task.findByPk(id, {
        attributes: ['id', 'title', 'description', 'status', 'priority'],
        include: [
            {model: User, as: 'assignee', attributes: ['id', 'name']},
            {model: User, as: 'creator', attributes: ['id', 'name']}
        ]
    })
    if(!task){
        return res.status(404).json({msg: "task not found"});
    }
    return res.status(200).json(task)
} 
) 


const updateTask = asyncHandler( async (req, res)=>{
    const id= Number(req.params.id);
    const currentUserId=  req.user.id
    const { title, description, status, priority, dueDate, newAssignedUserId } = req.body;

    const task= await Task.findByPk(id)
     if(!task){
        return res.status(404).json({msg: "Task not found"});
    }
    const isCreator= task.creator_id === req.user.id;
    const isAdmin = req.user.role === "admin"
    const isAssignedUser= currentUserId === task.assigned_user_id

    if(isCreator || isAdmin){
        const updateData ={}
        let reassigned= false;
            
        if(title !== undefined) updateData.title = title
        if(description !== undefined) updateData.description = description
        if(priority !== undefined) updateData.priority = priotiry
        if(dueDate !== undefined) updateData.dueDate = dueDate

        if(newAssignedUserId !== undefined && newAssignedUserId !==task.assignedUserId){
            const newUser= await User.findByPk(newAssignedUserId)
            if(!newUser){
                return res.status(404).json({ msg: "Assigned user not found" });
                }

            updateData.assignedUserId = newAssignedUserId
            updateData.status = 'todo'
            reassigned = true;
        }
        if(status !== undefined && !reassigned) 
            updateData.status = status
            
        await task.update(updateData)
            
       
    }else if(isAssignedUser){
        const requestFields = Object.keys(req.body);

        const isOnlyStatus = requestFields.length === 1 && requestFields[0] === "status"

        if(!isOnlyStatus){
            return res.status(403).json({
                msg: "Assigned user can only update staus"
            })
        }

        if (status === undefined) {
             return res.status(400).json({msg: "Status is required" });
    }

        await Task.update({status})

            }
    else{
        return res.status(403).json({msg: "can't update task"})
    }
 
    const updatedTask= await Task.findByPk(id,{
        attributes: ['id', 'title', 'description', 'status', 'priority'],
        include: [
            {model: User, as: 'assignee', attributes: ['id', 'name']},
            {model: User, as: 'creator', attributes: ['id', 'name']}
        ]
    }
    )
    res.status(200).json({
        msg: "Task updated successfully",
        task: updatedTask
    });
    
})

const deleteTask = asyncHandler( async (req, res)=>{
    const id= Number(req.params.id);
    const currentUserId=  req.user.id;
    const task = await Task.findByPk(id)
    if(!task){
        return res.status(404).json({msg: "task not found"})
    }
    const isAdmin = req.user.role === "admin"
    const isCreator= task.creator_id === currentUserId;
    if(!isCreator && !isAdmin){
        return res.status(403).json({msg: "Not authorized to delete this task"})
    }

    await task.destroy();

    return res.status(200).json({msg: "task deleted"})
})




module.exports= {createTask, getTasks, getTaskById, updateTask, deleteTask}