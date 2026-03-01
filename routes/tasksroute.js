const router= require('express').Router();
const {createTask, getTasks,getTaskById, updateTask, deleteTask}= require("../controllers/taskController");
const { requireAdmin } = require('../middleware/admin');

router.post('/', createTask)


router.get("/", getTasks)

router.get("/:id", getTaskById)

router.put('/:id', updateTask)


router.delete('/:id',deleteTask )
module.exports= router