const router=require('express').Router();
const {authenticate, authorize} = require('../middleware/authMiddleware')

const {createUser, getAllUsers, getUserById, updateUser, deleteUser }= require("../controllers/userController")
const {userSchema , updateUserSchema} = require('../validators/userValidator')
const validateRequest= require('../middleware/validateRequest')
const userIdSchema= require('../validators/commonValidator')

/**
 * @swagger
 * /users:
 *   post:
 *     summary: create a new user
 *     tags: [Users]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *        description: User created successfully
 */
router.post('/',authenticate, authorize("admin"),validateRequest(userSchema, "body") ,createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: returns the list of all users
 *     tags: [Users]
 *     security: 
 *       - bearerAuth: []
 *     responses:
 *       200:
 *        description: the list of users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 */
router.get('/', authenticate ,getAllUsers)
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

router.get('/:id', authenticate ,validateRequest(userIdSchema, "params"),getUserById)

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
router.put('/:id', authenticate, authorize("admin"),validateRequest(userIdSchema, "params"), validateRequest(updateUserSchema, "body"), updateUser)


/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted successfully
 *       403:
 *         description: Forbidden - Admin access required
 */

router.delete('/:id', authenticate, authorize("admin"),validateRequest(userIdSchema, "params"),deleteUser)
module.exports= router;