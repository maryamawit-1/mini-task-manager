const buildTaskQuery= (filters, limit, offset)=>{
    let sql= `select 
                t.id, t.title, t.description, t.status, t.priority, 
                u.id As assigned_user_id, u.name As assigned_user_name,
                c.id As creator_id, c.name AS creator_name
                from tasks t
                join users u on u.id= t.assigned_user_id
                join users c on c.id= t.creator_id
                where 1=1`
    const params= []

    let countSql= `select count(*) as total from tasks t 
                    join users u on t.assigned_user_id = u.id 
                    join users c on c.id = t.creator_id
                    where 1=1`


    const countParams =[]
    if(filters.status){
        sql += " AND t.status= ?"
        params.push(filters.status)
        countSql += " AND t.status= ?"
        countParams.push(filters.status)
    }
    if(filters.priority){
        sql += " AND t.priority= ?"
        params.push(filters.priority)
        countSql += " AND t.priority= ?"
        countParams.push(filters.priority)
    }
    if(filters.assignedUserId){
        sql += " AND t.assigned_user_id= ?"
        params.push(filters.assignedUserId)
    }
    if(filters.creatorId){
        sql += " AND creator_id= ?"
        params.push(filters.creatorId)
        countSql += " AND t.assigned_user_id= ?"
        countParams.push(filters.assignedUserId)
    }
    if(filters.dueBefore){
        sql += " AND due_date <= ?"
        params.push(filters.dueBefore)
        countSql += " AND due_date <= ?"
        countParams.push(filters.dueBefore)
    }
    if(filters.dueAfter){
        sql += " AND due_date >= ?"
        params.push(filters.dueAfter)
        countSql += " AND due_date >= ?"
        countParams.push(filters.dueAfter)
    }

    sql += " limit ? offset ?"
    params.push(limit, offset)
    return {sql, params, countSql, countParams}
}

module.exports = buildTaskQuery