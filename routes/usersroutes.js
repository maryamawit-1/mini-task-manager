const router=require('express').Router();
const {authenticate, authorize} = require('../middleware/authMiddleware')

const {createUser, getAllUsers, getUserById, updateUser, deleteUser }= require("../controllers/userController")
const {userSchema , updateUserSchema} = require('../validators/userValidator')
const validateRequest= require('../middleware/validateRequest')
const userIdSchema= require('../validators/commonValidator')


router.post('/',authenticate, authorize("admin"),validateRequest(userSchema, "body") ,createUser);
router.get('/', authenticate ,getAllUsers)
router.get('/:id', authenticate ,validateRequest(userIdSchema, "params"),getUserById)
router.put('/:id', authenticate, authorize("admin"),validateRequest(userIdSchema, "params"), validateRequest(updateUserSchema, "body"), updateUser)
router.delete('/:id', authenticate, authorize("admin"),validateRequest(userIdSchema, "params"),deleteUser)
module.exports= router;