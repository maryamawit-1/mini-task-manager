const express = require("express")
const router = express.Router()
const  {login, register} = require("../controllers/authController")
const{loginSchema, registerSchema} = require('../validators/authValidator')

const validateRequest = require('../middleware/validateRequest')

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Returns token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200: 
 *         description: token
 *         content: 
 *           application/json:
 *             schema: 
 *               $ref: '#/components/schemas/AuthResponse'
 *  
 */
router.post("/login", validateRequest(loginSchema, "body"), login)


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201: 
 *         description: user created
 */
router.post("/register", validateRequest(registerSchema, "body"),register)

module.exports = router