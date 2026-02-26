const express= require('express');
const app= express();

const useroutes= require('./routes/usersroutes')
const tasksroute= require('./routes/tasksroute')
app.use(express.json())
app.use("/users", useroutes);
app.use("/tasks", tasksroute)
app.listen(3000, ()=>{
    console.log("server is running on port 3000")
});