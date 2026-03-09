const express = require("express")
const router = express.Router()
const  {login, register} = require("../controllers/authController")
const{loginSchema, registerSchema} = require('../validators/authValidator')

const validateRequest = require('../middleware/validateRequest')
router.post("/login", validateRequest(loginSchema, "body"), login)
router.post("/register", validateRequest(registerSchema, "body"),register)

module.exports = router