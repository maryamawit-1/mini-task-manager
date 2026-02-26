const router=require('express').Router();

const { requireAdmin}= require('../middleware/admin')

const {createUser, getAllUsers, getUserById, updateUser, deleteUser }= require("../controllers/userController")
/*POST /users
Headers: { "currentUserId": 1 }
Body: { "name": "Alice", "role": "member" } */

router.post('/',requireAdmin, createUser);

router.get('/', getAllUsers)

router.get('/:id', getUserById)
router.put('/:id', requireAdmin, updateUser)

router.delete('/:id', deleteUser)
module.exports= router;