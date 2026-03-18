
const {User}= require('../models')
const asyncHandler = require('../utils/asyncHandler')

const validateTask =  asyncHandler(async(req, res, next)=>{

    const {assignedUserId} = req.body;

    if(!assignedUserId) return next()
    
    const user = await User.findByPk(assignedUserId, {attributes: ['id']})

     if (!user) {
            return res.status(400).json({
                msg: "Assigned user does not exist"
            })
        }   

        next()
})
module.exports = validateTask