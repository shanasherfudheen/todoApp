const express = require('express')
const mongoose = require('mongoose')
const Project = require('./models/Project')

const app = express()

//Middleware
app.use(express.json())

//Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/projectDB', {
  serverSelectionTimeoutMS: 5000, // Increase timeout for server selection
  socketTimeoutMS: 45000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

  //Routes
  app.get('/projects', async (req, res) => {
    try {
      const projects = await Project.find();
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.post('/projects', async (req, res) => {
    const project = new Project({
      title: req.body.title,
      todos: req.body.todos
    });
  
    try {
      const newProject = await project.save();
      res.status(201).json(newProject);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

