const joi = require('joi')


const taskSchema = joi.object({
    title: joi.string().min(3).max(255).required(),
    description: joi.string().min(5).required(),
    priority: joi.string()
                 .valid("low", "medium", "high")
                 .required(),
    status: joi.string()
                .valid("todo", "in-progress", "done")
                .required(),
    assignedUserId: joi.number().integer().required(),
    dueDate: joi.date().greater("now").optional().messages({
        "date.greater": "Due date must be in the future"
    })

})

const updateTaskSchema= joi.object({
    title: joi.string().min(3).max(255).optional(),
    description: joi.string().min(5).optional(),
    priority: joi.string().valid("low", "medium", "high").optional(),
    status: joi.string().valid("todo", "in-progress", "done").optional(),
    assignedUserId: joi.number().integer().optional(),
    dueDate: joi.date().greater("now").optional().messages({
            "date.greater": "Due date must be in the future"
        })

})

module.exports = {taskSchema, updateTaskSchema}