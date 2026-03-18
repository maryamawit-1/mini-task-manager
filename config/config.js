require('dotenv').config(); 

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    define: {
      timestamps: true,              
      underscored: true,              
    }
  },
  test: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "task_manager_test",
    host: process.env.DB_HOST,
    dialect: 'mysql',
  },
  production: {
    use_env_variable: 'DATABASE_URL', 
    dialect: 'mysql',
  }
};