const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
})


  
// const task = new Task(
//   {
//     description: 'Check out courseera'
//   }
// )


// task.save()
//   .then((result) => console.log(result))
//   .catch((err) => console.log(err))