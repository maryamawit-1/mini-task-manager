const {Model, DataTypes} = require('sequelize')

module.exports = (sequelize) =>{
    class User extends Model {
        static associate(models){
            User.hasMany(models.Task, { foreignKey: 'assigned_user_id'})
            User.hasMany(models.Task, { foreignKey: 'creator_id'})
        }
    }

    User.init({
        id:{
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name:{
            type: DataTypes.STRING(100),
            allowNull: false
        },
        role:{
            type: DataTypes.ENUM('admin', 'member'),
            allowNull: false,
            defaultValue: 'member'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },{
         sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
    })

    return User
}