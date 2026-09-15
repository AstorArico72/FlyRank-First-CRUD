const express = require('express');
const bodyParser = require ("body-parser");
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

app.post("/tasks", bodyParser.json (), (req, res) => {
  let NewTask = {};
  let JsonError = {};
  if (req.body.title && typeof (req.body.title) == 'string') {
    let LastId = TasksList.sort ((a, b) => b.id - a.id) [0].id;
    NewTask.id = ++LastId;
    NewTask.done = false;
    NewTask.title = req.body.title;
    TasksList.push (NewTask);
    res.status (201).send (NewTask);
  } else {
    if (req.body.title) {
      JsonError.error = "Title field is incorrectly formatted.";
    } else {
      JsonError.error = "Title field is missing.";
    }
    res.status (400).send (JsonError);
  }
});

app.put ("/tasks/:id", bodyParser.json (), (req, res) => {
  let OldTask = TasksList.find (task => task.id == req.params.id);
  let NewTask = req.body;
  let JsonError = {};

  if (NewTask.title && typeof (NewTask.title) == "string") {
    OldTask.title = NewTask.title;
  } else if (NewTask.title) {
    JsonError.error = "Incorrectly formatted title field.";
  }

  if (NewTask.done && typeof (NewTask.done) == "boolean") {
    OldTask.done = NewTask.done;
  } else if (NewTask.done) {
    JsonError.error = "Incorrectly formatted 'done' field.";
  }

  if (!NewTask.title && !NewTask.done) {
    JsonError.error = "Fields to edit are missing.";
  }

  if (!OldTask) {
    res.status (404).send ("Task " + req.params.id + " does not exist.");
  } else if (JsonError.error) {
    res.status (400).send (JsonError);
  } else {
    res.send (OldTask);
  }
});

app.delete ("/tasks/:id", (req, res) => {
  let FoundTask = TasksList.find (task => task.id == req.params.id);

  if (!FoundTask) {
    res.status (404).send ("Task " + req.params.id + " does not exist.");
  } else {
    let FoundTaskIndex = TasksList.findIndex (task => task.id == req.params.id);
    TasksList.splice (FoundTaskIndex, 1);
    res.status (204).send ();
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});