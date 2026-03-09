const router= require('express').Router();
const {createTask, getTasks,getTaskById, updateTask, deleteTask}= require("../controllers/taskController");
const {authenticate, authorize} = require('../middleware/authMiddleware')
const validateTask = require('../middleware/validateTask')
const validateRequest = require("../middleware/validateRequest")
const {taskSchema, updateTaskSchema} = require("../validators/taskValidator")
const taskIdSchema = require('../validators/commonValidator')

router.post('/',authenticate,
                validateRequest(taskSchema, "body"),
                validateTask,
                createTask)


router.get("/", authenticate ,getTasks)

router.get("/:id", authenticate,validateRequest(taskIdSchema, "params"),getTaskById)

router.put('/:id', authenticate,validateRequest(taskIdSchema, "params"), validateRequest(updateTaskSchema, "body"),updateTask)


router.delete('/:id',authenticate, validateRequest(taskIdSchema, "params"),deleteTask )
module.exports= router
