const express = require('express');
const app = express();
const port = 3000;

var TasksList = [
  {
    "id": 1,
    "title": "Create a lisk of tasks",
    "done": true
  },
  {
    "id": 2,
    "title": "Get a job",
    "done": false
  },
  {
    "id": 3,
    "title": "Have a degree",
    "done": true
  }
];

app.get('/', (req, res) => {

  let JsonResponse = {
    "name": "Task API",
    "version": "1.0",
    "endpoints": ["/tasks"]
  }
  res.send(JsonResponse);
});

app.get("/health", (req, res) => {
  let JsonResponse = {
    "status": "ok"
  }
  res.send (JsonResponse);
});

app.get("/tasks/:id", (req, res) => {
  let task = TasksList.find (item => item.id == req.params.id);
  let JsonError = {
    "error": "Task " + req.params.id + " not found."
  };
  if (task) {
    res.send (task);
  } else {
    res.status (404).send (JsonError);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});