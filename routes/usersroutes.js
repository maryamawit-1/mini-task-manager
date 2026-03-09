const router=require('express').Router();
const {authenticate, authorize} = require('../middleware/authMiddleware')

const {createUser, getAllUsers, getUserById, updateUser, deleteUser }= require("../controllers/userController")

router.post('/',authenticate, authorize("admin"), createUser);
router.get('/', authenticate ,getAllUsers)
router.get('/:id', authenticate ,getUserById)
router.put('/:id', authenticate, authorize("admin"), updateUser)
router.delete('/:id', authenticate, authorize("admin"),deleteUser)
module.exports= router;