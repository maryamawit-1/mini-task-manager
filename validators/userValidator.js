const joi = require('joi')

const userSchema= joi.object({
    name: joi.string().min(2).max(255).required(),
    role: joi.string().valid("admin", "member").required(),
    email: joi.string().email().required(),
    password: joi.string().min(8).required()
})

const updateUserSchema= joi.object({
    name: joi.string().min(2).max(255).optional(),
    role: joi.string().valid("admin", "member").optional(),
    email: joi.string().email().optional(),
    password: joi.string().min(8).optional()
})

module.exports= {userSchema, updateUserSchema}