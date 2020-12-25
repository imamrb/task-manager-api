const express = require('express')
require('./db/mongoose.js')
const taskRouter = require('./routers/taskRouter.js')
const userRouter = require('./routers/userRouter.js')

const app = express()

const port = process.env.PORT

// app.use((req, res, next) => {
//   res.status(503).send('Site is under maintenance! Please check back later!')   //Maintenance mode only
// })

app.use(express.json()) //parse incoming json to object
app.use(userRouter)
app.use(taskRouter)

app.get('', (req, res, next) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end(`<html><body><h1>Task Manager App</h1></body></html>`)
})

app.listen(port, () => {
  console.log('Server listening on port ' + port)
})

// const myfunction = async () => {
//   const token = jwt.sign({ _id: 'abc124' }, 'thisisnodejs', { expiresIn: '1 sec' })
  
//   const data = jwt.verify(token, 'thisisnodejs')
//   console.log(data)
// }

// myfunction()