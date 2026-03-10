
const pool= require('../db')
const asyncHandler = require('../utils/asyncHandler')
const buildTaskQuery = require('../utils/taskFilters')
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

    const [result]= await pool.query('insert into tasks (title, description, status, priority, assigned_user_id, creator_id, due_date) values(?, ?, ?, ?, ?, ?, ?)', [title, description, status, priority, assignedUserId, creatorId, dueDate]);

    res.status(201).json({
        msg: "task created",
        taskId: result.insertId
    })

})


const getTasks = asyncHandler(async(req, res)=>{
  let connection;
    try {
        const{ page= 1, limit= 5, priority, status, assignedUserId, creatorId, dueBefore, dueAfter} = req.query
        
        const filters= {status, priority, assignedUserId, creatorId, dueBefore, dueAfter}

        const offset= (page -1)* limit
        const {sql, params, countSql, countParams} = buildTaskQuery(filters, Number(limit), Number(offset))
         
        const [tasks] = await pool.query(sql, params)
        const [[{total}]] = await pool.query(countSql, countParams)
        const totalPages= Math.ceil(total/limit)
        return res.status(200).json({
            page: Number(page),
            limit: Number(limit),
            totalPages,
            totalResults:total,
            results: tasks
        });
    } finally{
        if(connection)  connection.release();
    }
})

const getTaskById = asyncHandler(async (req, res)=>{
    const id= Number(req.params.id);
   
    const [results]= await pool.query(`
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
} 
) 


const updateTask = asyncHandler( async (req, res)=>{
    const id= Number(req.params.id);
    const currentUserId=  req.user.id
    const { title, description, status, priority, dueDate, newAssignedUserId } = req.body;
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
        const isCreator= task.creator_id === req.user.id;
        const isAdmin = user.role === "admin"
        const isAssignedUser= req.user.id === task.assigned_user_id

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
                await connection.query('update tasks set status= ?  where id= ?', [status, id])
            
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

    } finally{
        if(connection)  connection.release();
    } 
    
})

const deleteTask = asyncHandler( async (req, res)=>{
    const id= Number(req.params.id);
    const currentUserId=  req.user.id;

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

})




module.exports= {createTask, getTasks, getTaskById, updateTask, deleteTask}