const router= require('express').Router();
const {createTask, getTasks,getTaskById, updateTask, deleteTask}= require("../controllers/taskController");
const {authenticate, authorize} = require('../middleware/authMiddleware')
const validateTask = require('../middleware/validateTask')
const validateRequest = require("../middleware/validateRequest")
const {taskSchema, updateTaskSchema} = require("../validators/taskValidator")
const taskIdSchema = require('../validators/commonValidator')

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: create a new task
 *     tags: [Tasks]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       201:
 *        description: Task created successfully
 */
router.post('/',authenticate,
                validateRequest(taskSchema, "body"),
                validateTask,
                createTask)

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: returns the list of all users
 *     tags: [Tasks]
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *        description: the list of tasks
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Task'
 */
router.get("/", authenticate ,getTasks)


/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: get task by id
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the task id
 *     responses:
 *       200: 
 *         description: task found
 *         content: 
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: task not found
 * 
 */
router.get("/:id", authenticate,validateRequest(taskIdSchema, "params"),getTaskById)

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: the user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *             required: []
 *     responses:
 *       200:
 *         description: user updated successfully
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: update a task
 *     tags: [Tasks]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: 
 *           type: integer
 *         description: the task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *             required: []
 *     responses:
 *       200:
 *         description: task updated successfully
 *       403:
 *         description: Forbidden - Admin access required
 * 
 */
router.put('/:id', authenticate,validateRequest(taskIdSchema, "params"), validateRequest(updateTaskSchema, "body"),updateTask)

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       403:
 *         description: Forbidden 
 */
router.delete('/:id',authenticate, validateRequest(taskIdSchema, "params"),deleteTask )
module.exports= router
