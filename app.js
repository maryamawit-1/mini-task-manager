const express= require('express');
const errorHandler = require('./middleware/errorMiddleware')
const app= express();

const useroutes= require('./routes/usersroutes')
const tasksroute= require('./routes/tasksroute')
const authroute= require('./routes/authroute')
const notFound = require('./middleware/notFoundMiddleware')
app.use(express.json())

app.use("/users", useroutes);
app.use("/tasks", tasksroute)
app.use("/auth", authroute)

app.use(notFound) 

app.use(errorHandler)

app.listen(3000, ()=>{
    console.log("server is running on port 3000")
});  