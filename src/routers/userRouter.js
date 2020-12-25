const express = require('express')
const User = require('../models/user.js')
const authMiddleWare = require('../middleware/authMiddleWare.js')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../email/account.js')
const userRouter = express.Router()

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a valid image file.'))
    }
    cb(undefined, true) //rejected, resolved
  },
})

userRouter
  .get('/users', async (req, res) => {
    const users = await User.find({})
    res.send(users)
  })

  .get('/users/me', authMiddleWare, async (req, res) => {
    res.send(req.user)
  })

  .post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
      await user.save()
      sendWelcomeEmail(user.name, user.email)
      const token = await user.generateAuthToken()

      res.status(201).send({ user, token })
    } catch (e) {
      res.status(400).send(e)
    }
  })

  .post('/users/login', async (req, res) => {
    try {
      const user = await User.findByCredentials(req.body.email, req.body.password)

      const token = await user.generateAuthToken()

      res.send({ user, token }) //user.toJSON() is called before JSON.stringify(user)
    } catch (error) {
      //console.log(error.message)
      res.status(400).send({ error: error.message })
    }
  })

  .post('/users/logout', authMiddleWare, async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((e) => e.token !== req.token)

      await req.user.save()

      res.send('Logged Out')
    } catch (error) {
      res.status(500).send(error)
    }
  })

  .post('/users/logoutAll', authMiddleWare, async (req, res) => {
    try {
      req.user.tokens = []

      await req.user.save()

      res.send('Logged Out of all sessions..')
    } catch (error) {
      res.status(500).send(error)
    }
  })

  .patch('/users/me', authMiddleWare, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(404).send({ error: 'Invalid updates!' })
    }
    try {
      const user = req.user //await User.findById(req.params.userId)
      updates.forEach((update) => (user[update] = req.body[update]))
      await user.save()

      res.send(user)
    } catch (error) {
      res.status(400).send(error)
    }
  })

  .delete('/users/me', authMiddleWare, async (req, res) => {
    try {
      await req.user.remove() //User.findByIdAndDelete(req.user._id)
      sendCancelationEmail(req.user.name, req.user.email)
      res.send(req.user) //we get the user  middleware
    } catch (error) {
      res.status(500).send(error)
    }
  })
  
  .post(
    '/users/me/avatar',
    authMiddleWare,
    upload.single('avatar'),
    async (req, res) => {
      //req.user.avatar = req.file.buffer
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer()
      req.user.avatar = buffer
      await req.user.save()
      res.send('Avatar upload successful')
    },
    (error, req, res, next) => {
      res.status(400).send({ error: error.message })
    }
  )
  .delete('/users/me/avatar', authMiddleWare, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send('Avatar Deletion Successful!')
  })
  .get('/users/me/avatar', authMiddleWare, async (req, res) => {
    try {
      const user = await User.findById(req.user._id)

      if (!user || !user.avatar) {
        throw new Error()
      }
      res.set('Content-Type', 'image/png')
      res.send(user.avatar)
    } catch (error) {
      res.status(404).send(error.message)
    }
  })

module.exports = userRouter
