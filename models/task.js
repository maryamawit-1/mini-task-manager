const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Task extends Model {
    static associate(models) {
        Task.belongsTo(models.User, {foreignKey: 'assigned_user_id', as: 'assignee'})
        Task.belongsTo(models.User, { foreignKey: 'creator_id', as: 'creator'})
    }
  }

  Task.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('todo', 'in-progress', 'done'),
      allowNull: false,
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    assigned_user_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    creator_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    due_date: {
      type: DataTypes.DATEONLY, 
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
    underscored: true, 
});

  return Task;
};