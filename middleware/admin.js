const users = require('../users')
function requireAdmin(req, res, next){
    const currentUser= users.find(u=>u.id == req.header('currentUserId'));
    if(!currentUser || currentUser.role !== "admin"){
        return res.status(403).json({msg: "Admin only"})
    }
    req.currentUser= currentUser
    next();
}

module.exports= {requireAdmin};