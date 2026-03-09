const joi= require('joi')

const taskIdSchema = joi.object({
    id: joi.number().integer().positive().required()
})

module.exports = taskIdSchema