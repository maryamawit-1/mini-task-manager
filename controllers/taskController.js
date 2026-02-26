const tasks = require('../tasks');
const users= require('../users')
function validateTask(data, users){
    const errors=[];

    const allowedProperites= ["low", "medium", "high"];
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
    const creatorId = Number(data.creatorId);
    if (isNaN(assignedUserId)) {
    errors.push("assignedUserId must be a number");
    }else if(!users.find(u=> u.id === assignedUserId)){
    errors.push("Assigned user does not exist");
  }

  if (isNaN(creatorId)) {
    errors.push("creatorId must be a number");
  }else if(!users.find(u=>u.id === creatorId)){
    errors.push("creator does not exits")
  }
 return errors;
}
const createTask = (req, res)=>{
    const {title, description, status, priority, assignedUserId, creatorId, dueDate}= req.body
    const createdAt = new Date().toISOString();
    const newId= tasks.length? Math.max(...tasks.map(t=>t.id)) +1 : 1;
    const errors = validateTask(req.body, users);
   
    if(errors.length>0){
     return res.status(400).json({errors})
    }
    
    const task={
        "id": newId,
        title,
        description,
        status,
        priority,
        assignedUserId: Number(assignedUserId),
        creatorId: Number(creatorId),
        dueDate,
        createdAt,
        updatedAt: null
    }

    tasks.push(task);
    res.status(201).json({
        msg: "task created successfully",
        task
    })
}

const deleteTask= (req, res)=>{
    const id= Number(req.params.id);

    const currentUserId= Number(req.header('currentUserId'));

    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});
    const index= tasks.findIndex(t=>t.id === id);

    if(index === -1){
        return res.status(404).json({msg: "task not found"})
    }
    const task= tasks[index];
    const user= users.find(u=>u.id == currentUserId);
    
    if (!user)
        return res.status(404).json({ msg: "User not found" });


    if(currentUserId !== task.creatorId && user.role !== "admin"){
        return res.status(403).json({msg: "not priviledged"})
    }
    const deletedTask= tasks.splice(index, 1);
    return res.status(200).json({
     msg: "task deleted",
     deletedTask
    })
}
const updateTask = (req, res)=>{
    const id= Number(req.params.id);
    if(!id || isNaN(id) || id<= 0)
            return res.status(400).json({msg: "incorrect input"});

    const {title, description, status, priority, dueDate, newAssignedUserId}= req.body;
    const allowedStatuses= ["todo", "in-progress", "done"]
    if(status !== undefined && !allowedStatuses.includes(status)){
        return res.status(400).json({msg: "Status must be todo, in-progress, or done"})
    }
    const currentUserId= Number(req.header('currentUserId'))
    const task= tasks.find(t=> t.id== id);
    

    if(!task)
        return res.status(404).json({msg: "Task not found"});
    
    const user= users.find(u=>u.id == currentUserId);

    if (!user)
        return res.status(404).json({ msg: "User not found" });

    
    const isAssignedUser = currentUserId === task.assignedUserId 
    
    
    if(task.creatorId === currentUserId || user.role ==="admin" ){
       
        let reassigned = false;
        if(newAssignedUserId!== undefined && newAssignedUserId !== task.assignedUserId){
            const newUser = users.find(u => u.id === newAssignedUserId);
    
            if(!newUser){
                return res.status(404).json({ msg: "Assigned user not found" });
            }
            task.assignedUserId = newAssignedUserId;
            task.status= "todo";
            reassigned= true;
            
        }
        if (status !== undefined && !reassigned) task.status = status; 
        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;
       
        task.updatedAt = new Date().toISOString();
        return res.status(200).json(task)
    }
    else if(isAssignedUser){
        const requestFields = Object.keys(req.body);

        const isOnlyStatus = requestFields.length === 1 && requestFields[0] === "status"

        if(!isOnlyStatus){
            return res.status(403).json({
                msg: "Assigned user can only update staus"
            })
        }
        task.status = status;
        task.updatedAt = new Date().toISOString();
        return res.status(200).json(task)
    }
    else{
        return res.status(403).json({msg: "can't update task"})
    }
    
}

const getTasks= (req, res)=>{
    res.status(200).json(tasks);
}
const getTaskById = (req, res)=>{
    const id= Number(req.params.id);

    if(!id || isNaN(id) || id<= 0)
            return res.status(400).json({msg: "incorrect input"});


    const task= tasks.find(t=>t.id === id);

    
    if(!task){
        return res.status(404).json({msg: "task not found"});
    }
    res.status(200).json(task)
}


module.exports= {createTask, getTasks, getTaskById, updateTask, deleteTask}