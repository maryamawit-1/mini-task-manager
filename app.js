const express= require('express');
const {swaggerDocs} = require('./utils/swagger')
const errorHandler = require('./middleware/errorMiddleware')
const notFound = require('./middleware/notFoundMiddleware')
const apiLimiter = require('./middleware/rateLimiter')

const useroutes= require('./routes/usersroutes')
const tasksroute= require('./routes/tasksroute')
const authroute= require('./routes/authroute')

const app= express();
const PORT = process.env.PORT || 3000


swaggerDocs(app, PORT)

app.use(express.json())
app.use(apiLimiter)


app.use("/users", useroutes);
app.use("/tasks", tasksroute)
app.use("/auth", authroute)

app.use(notFound) 
app.use(errorHandler)


app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`)
});  