const tasks = require('../tasks');
const users= require('../users')
const createUser = (req, res)=>{
    const{name, role} = req.body;
    if(!name || !role){
        return res.status(400).json({msg: "Name and role are required" })
    }

    const allowedRoles= ["admin", "member"];
    if(!allowedRoles.includes(role)){
        return res.status(400).json({msg: "incorrect value for role"})
    }
    const newId= users.length? Math.max(...users.map(u=>u.id)) +1 : 1;
    const user= {"id": newId,
                name,
                role
            };
    users.push(user);
    res.status(201).json({
        msg: "User created successfully", user 
    });
}

const getUserById = (req, res)=>{
    const id= Number(req.params.id);

    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});

    const user= users.find(u=>u.id === id);

    if(!user)
        return res.status(404).json({msg: "user not found"});
    res.status(200).json(user);
}
const getAllUsers = (req, res)=>{
    if(!users.length)
        return res.status(200).json([]);
    res.status(200).json(users);
}
const updateUser= (req, res)=>{
    const id= Number(req.params.id);
    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});

    const{name, role} = req.body;
    if(!name || !role){
        return res.status(400).json({msg: "Name and role are required" })
    }
   
    const user= users.find( u=> u.id === id);
    if(!user)
        return res.status(404).json({msg: "user not found"});
    user.name= name;
    user.role= role;
    res.status(200).json(user)
}
const deleteUser = (req, res)=>{
    const id= Number(req.params.id);

    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});


    const currentUser = users.find((u)=> u.id == Number(req.header('currentUserId')))
    if(!currentUser)
        return res.status(401).json({msg: "user not found"});

    if(currentUser.role !== "admin"){
        return res.status(403).json({msg: "can't delete user"})
    }
      
    if (currentUser.id === id) {
        return res.status(400).json({ msg: "admin cannot delete himself" });
    }

    const index= users.findIndex((u)=>u.id == id)
    if(index === -1){
        return res.status(404).json({msg: "user not found"})
    }

    const isAssigned = tasks.some(t=>t.assignedUserId === id)
      
    if(isAssigned){
        return res.status(400).json({
            msg: "Cannot delete user. User is assigned to active tasks"
        })
    }


    tasks.forEach((t)=>{
        if(t.creatorId== id){
            t.creatorId = currentUser.id
            }
    } )
    
    
    const deletedUser= users.splice(index, 1);

    res.status(200).json({msg: "user deleted",
        deletedUser
    })
}
module.exports={createUser, getAllUsers, getUserById, updateUser, deleteUser}
