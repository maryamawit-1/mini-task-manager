const router= require('express').Router();
const {createTask, getTasks,getTaskById, updateTask, deleteTask}= require("../controllers/taskController");
const {authenticate, authorize} = require('../middleware/authMiddleware')
const validateTask = require('../middleware/validateTask')


router.post('/', authenticate ,validateTask, createTask)


router.get("/", authenticate ,getTasks)

router.get("/:id", authenticate,getTaskById)

router.put('/:id', authenticate,updateTask)


router.delete('/:id',authenticate, deleteTask )
module.exports= router
