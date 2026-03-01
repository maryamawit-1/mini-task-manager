const tasks = require('../tasks');
const users= require('../users')
const pool= require('../db')
async function validateTask(data){
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
        return errors;
    } catch (error) {
        console.error(error);
        return ["Server validation error"];
    }finally{
        if(connection)  connection.release();
    }   
  }


async function createTask (req, res){
    const {
        title, 
        description, 
        status, 
        priority, 
        assignedUserId, 
        creatorId, 
        dueDate
    }= req.body
    const errors = await validateTask(req.body, users);
   
    if(errors.length>0){
     return res.status(400).json({errors})
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        const [rows]= await connection.query('insert into tasks (title, description, status, priority, assigned_user_id, creator_id, due_date) values(?, ?, ?, ?, ?, ?, ?)', [title, description, status, priority, assignedUserId, creatorId, dueDate]);
        res.status(201).json({
        msg: "task created successfully"
    })
    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }
   
}


async function getTasks (req, res){
    let connection;
    try {
        connection = await pool.getConnection();
        const [results]= await connection.query(`
            select 
                t.id, 
                t.title, 
                t.description, 
                t.status, 
                t.priority, 
                u.id AS assigned_user_id, 
                u.name AS assigned_user_name, 
                c.id AS creator_id, 
                c.name AS creator_name 
            from tasks t 
            join users u on t.assigned_user_id =u.id 
            join users c on t.creator_id = c.id`
        );
        return res.status(200).json(results);
    } catch (error) {
         console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }
}
async function getTaskById (req, res){
    const id= Number(req.params.id);

    if(!id || isNaN(id) || id<= 0)
            return res.status(400).json({msg: "incorrect input"});

    let connection
    try {
        connection= await pool.getConnection();
        const [results]= await connection.query(`
            select 
                t.id, 
                t.title, 
                t.description, 
                t.status, 
                t.priority, 
                u.id AS assigned_user_id, 
                u.name AS assigned_user_name, 
                c.id AS creator_id, 
                c.name AS creator_name 
            from tasks t 
            join users u on t.assigned_user_id =u.id 
            join users c on t.creator_id = c.id
            where t.id= ?`, [id]
        );
        if(results.length === 0){
            return res.status(404).json({msg: "task not found"});
        }
        return res.status(200).json(results[0])
    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    }
}

async function updateTask (req, res){
    const id= Number(req.params.id);
    if(!id || isNaN(id) || id<= 0)
            return res.status(400).json({msg: "incorrect input"});

    const {title, description, status, priority, dueDate, newAssignedUserId}= req.body;
    const allowedStatuses= ["todo", "in-progress", "done"]
    if(status !== undefined && !allowedStatuses.includes(status)){
        return res.status(400).json({msg: "Status must be todo, in-progress, or done"})
    }

    const allowedPriority= ["low", "medium", "high"]
    if(priority !== undefined && !allowedPriority.includes(priority)){
        return res.status(400).json({msg: "Status must be low, meduium or high"})
    }
    const currentUserId= Number(req.header('currentUserId'))

    let connection
    try {
        connection = await pool.getConnection();
        const[taskRows]= await connection.query('select id, assigned_user_id, creator_id from tasks where id= ?', [id]);
        if(taskRows.length === 0){
            return res.status(404).json({msg: "Task not found"});
        }
        const task= taskRows[0]
        
        const[userRows]=  await connection.query('select id , role from users where id= ?', [currentUserId]);
        if(userRows.length === 0){
            return res.status(404).json({msg: "User not found"});
        }

        const user = userRows[0];
        const isCreator= task.creator_id === currentUserId;
        const isAdmin = user.role === "admin"
        const isAssignedUser= currentUserId === task.assigned_user_id

        if(isCreator || isAdmin){

            const updates=[];
            const values=[];
            let reassigned= false;
            
            if(title !== undefined){
                updates.push("title= ?")
                values.push(title)
            }
            if(description !== undefined){
                updates.push("description= ?")
                values.push(description)
            }
            if(priority !== undefined){
                updates.push("priority= ?")
                values.push(priority)
            }if(dueDate !== undefined){
                updates.push("due_date= ?")
                values.push(dueDate)
            }if(newAssignedUserId !== undefined && newAssignedUserId !==task.assignedUserId){
                const[newUser] =await connection.query('select id from users where id= ?', [newAssignedUserId])
                if(newUser.length === 0){
                    return res.status(404).json({ msg: "Assigned user not found" });
                }
                await connection.query('update tasks set assigned_user_id= ?, status= todo, where id= ?',[newAssignedUserId, id])
                reassigned = true;
            }
            if(status !== undefined && !reassigned) 
                await connection.query('update tasks set status= ?', [status])
            
            values.push(id)
            const sql =`update tasks set ${updates.join(", ")} where id=?`
            await connection.query(sql, values);
            const [updatedRows]= await connection.query(`
            select 
                t.id, 
                t.title, 
                t.description, 
                t.status, 
                t.priority, 
                u.id AS assigned_user_id, 
                u.name AS assigned_user_name, 
                c.id AS creator_id, 
                c.name AS creator_name 
            from tasks t 
            join users u on t.assigned_user_id =u.id 
            join users c on t.creator_id = c.id
            where t.id= ?`, [id]
        );
        res.status(200).json({msg:"user updated successfully", 
            user: updatedRows[0]
        })
        }else if(isAssignedUser){
            const requestFields = Object.keys(req.body);

            const isOnlyStatus = requestFields.length === 1 && requestFields[0] === "status"

            if(!isOnlyStatus){
                return res.status(403).json({
                    msg: "Assigned user can only update staus"
                })
            }

            if (status === undefined) {
                return res.status(400).json({
                    msg: "Status is required"
                });
    }
            await connection.query('update tasks set status= ? where id= ?', [status, id])
            return res.status(200).json({
                msg: "Status updated successfully"
            });
            }else{
             return res.status(403).json({msg: "can't update task"})
    }

    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    } 
    
}

async function deleteTask (req, res){
    const id= Number(req.params.id);

    const currentUserId= Number(req.header('currentUserId'));

    if(!id || isNaN(id) || id<= 0)
        return res.status(400).json({msg: "incorrect input"});

    if (!currentUserId || isNaN(currentUserId) || currentUserId <= 0) {
        return res.status(400).json({ msg: "Invalid user" });
    }
    let connection;
    try {
        connection= await pool.getConnection();
        const[tasks]= await connection.query('select id, creator_id from tasks where id=? ', [id])

        const[userRows]=  await connection.query('select id , role from users where id= ?', [currentUserId]);
        if(userRows.length === 0){
            return res.status(404).json({msg: "User not found"});
        }
        const user = userRows[0];
        const isAdmin = user.role === "admin"
        if(tasks.length=== 0){
            return res.status(404).json({msg: "task not found"})
        }
        const isCreator= tasks[0].creator_id === currentUserId;
        if(!isCreator && !isAdmin){
            return res.status(403).json({msg: "not priviledged"})
        }
        await connection.query('delete from tasks where id= ?', [id])
        return res.status(200).json({msg: "task deleted"})
    } catch (error) {
        console.error(error);
        res.status(500).json({msg: "server error"})
    }finally{
        if(connection)  connection.release();
    } 

}



module.exports= {createTask, getTasks, getTaskById, updateTask, deleteTask}