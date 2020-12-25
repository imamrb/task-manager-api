const express = require('express')
const Task = require('../models/task.js')
const authMiddleWare = require('../middleware/authMiddleWare.js')

const taskRouter = new express.Router()

taskRouter
  .post('/tasks', authMiddleWare, async (req, res) => {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    })

    try {
      await task.save()
      res.status(201).send(task)
    } catch (e) {
      res.status(400).send(e)
    }
  })

  // GET tasks?completed=true
  // GET tasks?limi=3&skip=2
  // GET tasks?sortBy=createdAt:desc
  .get('/tasks', authMiddleWare, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
      match.completed = req.query.completed === 'true'
    }
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':') //GET tasks?sortBy=createdAt:desc
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
      // const tasks = await Task.find({owner: req.user._id})
      await req.user.populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort
        }
      }).execPopulate()
      res.send(req.user.tasks)
    } catch (error) {
      res.status(500).send(error)
    }
  })

  .get('/tasks/:taskId', authMiddleWare, async (req, res) => {

    try {
      const task = await Task.findOne({ _id: req.params.taskId , owner: req.user._id })
      if (!task) {
        return res.status(404).send({ error: 'Task not found' })
      }
      res.send(task)
    } catch (error) {
      res.status(500).send(error)
    }
  })

  .patch('/tasks/:taskId',authMiddleWare, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(404).send({ error: 'Invalid updates!' })
    }

    try {
      const task = await Task.findOne({ _id: req.params.taskId, owner: req.user._id })
      if (!task) {
        res.status(404).send('Task not found')
      }
      updates.forEach((update) => (task[update] = req.body[update]))
      await task.save()
      res.send(task)
    } catch (error) {
      res.status(500).send(error)
    }
  })

  .delete('/tasks/:taskId', authMiddleWare, async (req, res) => {
    try {
      const task = await Task.findOneAndDelete({ _id: req.params.taskId, owner: req.user._id })
      if (!task) {
        return res.status(404).send('Task not found')
      }
      res.send(task)
    } catch (error) {
      res.status(500).send(error.message)
    }
  })

module.exports = taskRouter
