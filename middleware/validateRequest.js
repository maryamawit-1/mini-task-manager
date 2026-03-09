const validateRequest = (schema, property= "body")=> {
    return (req, res, next)=>{
        const {error}= schema.validate(req[property], {abortEarly: false})

        if(error){
            const errors= error.details.map(e => e.message)

            return res.status(400).json({
                errors
            })
        }
        next()
    }
}

module.exports = validateRequest