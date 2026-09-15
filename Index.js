const express = require('express');
const bodyParser = require ("body-parser");
const swaggerUi = require ("swagger-ui-express");
const swaggerDoc = require ("./openapi.json");
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

  if (NewTask.title || NewTask.done) {
    if (NewTask.title != undefined) {
      if (typeof (NewTask.title) === "string") {
        OldTask.title = NewTask.title;
      } else {
        JsonError.error = "Incorrectly formatted title field.";
        return res.status (400).send (JsonError);
      }
    }

    if (NewTask.done != undefined) {
      if (typeof (NewTask.done) === "boolean") {
        OldTask.done = NewTask.done;
      } else {
        JsonError.error = "Incorrectly formatted 'done' field.";
        return res.status (400).send (JsonError);
      }
    }

    if (!OldTask) {
      res.status (404).send ("Task " + req.params.id + " does not exist.");
    } else if (JsonError.error == undefined) {
      res.send (OldTask);
    }
  } else {
    JsonError.error = "Fields to edit are missing.";
    return res.status (400).send (JsonError);
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

app.use ("/docs", swaggerUi.serve, swaggerUi.setup (swaggerDoc));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});