const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi= require('swagger-ui-express')
const path= require('path')

const options={
  definition: {
    openapi: '3.0.0',
    info:{
      title: "Mini Task manager API",
      version: '1.0.0',
      description: "API documentation for my Task Manager",
    },
    servers: [
      {
        url: "http://localhost:3000"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    
      schemas:{
        RegisterInput: {
          type: 'object',
          required: ['name','email', 'password'],
          properties: {
            name: {type: 'string', example: 'John Doe'},
            email: {type: 'string', example: 'john@example.com'},
            password: {type: 'string', example: 'password123'},
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {type: 'string', example: 'elsa@yahoo.com'},
            password: {type: 'string', example: 'elsa'},
          },
        
        },
        AuthResponse:{
          type: 'object',
          properties: {
            message: { type: 'string'},
            token: {type: 'string'}
          }
        },
        Task: {
          type: 'object',
          required: ['title', 'status', 'priority', 'description', 'dueDate'],
          properties: {
            title: { type: 'string'},
            description: {type: 'string'},
            status: {
              type: 'string',
              description: 'the current progress of the task',
              enum: ['todo', 'in-progress', 'done'],
              },
            priority: {
              type: 'string',
              description: 'the importance of the task',
              enum: ['low', 'medium', 'high'],
            },
            assignedUserId:{
              type: 'integer',
              description: 'the ID of the user assigned to do the task'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'the deadline for the task',
            },

          },
        },
        User: {
          type: 'object',
          required: ['name', 'email', 'role', 'password'],
          properties: {
            name: {type: 'string'},
            email: {type: 'string'},
            role: {
              type: 'string',
              enum: ['admin', 'member']
          },
            password: {type: 'string'}
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js')],
}

const swaggerSpec = swaggerJsdoc(options)

const swaggerDocs = (app, port)=>{
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`swagger docs available at http://localhost:${port}/api-docs`)
}
module.exports = {swaggerDocs}