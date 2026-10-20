const express = require('express');
const bodyParser = require ("body-parser");
const swaggerUi = require ("swagger-ui-express");
const swaggerDoc = require ("./openapi.json");
const Database = require ("better-sqlite3");
const taskDB = new Database ("./Tasks.db");
const app = express();
const port = 3000;

taskDB.pragma ("journal_mode = WAL");

taskDB.prepare (`CREATE TABLE IF NOT EXISTS "Tasks" (
    "ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Title" TEXT NOT NULL,
    "Done" INTEGER DEFAULT 0 NOT NULL
  )`).run ();
  // OMG I'm too used to MySQL I was literally thinking of strict C#-like types.
  // Now that I think of it, this feels like shifting from Java or C# to Python.

var CountRow = taskDB.prepare (`SELECT COUNT(*) AS total FROM "Tasks";`).get ();

if (CountRow.total == 0) {
  taskDB.prepare (`INSERT INTO "Tasks" ("ID", "Title", "Done") VALUES
  (1, 'Get a job', 0),
  (2, 'Create a list of tasks', 1),
  (3, 'Have a degree', 1);`).run ();
}

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
    "endpoints": ["/tasks"],
    "total_tasks": CountRow.total
  }
  
  res.send(JsonResponse);
});

app.get("/health", (req, res) => {
  let JsonResponse = {
    "status": "ok"
  }
  res.send (JsonResponse);
});

app.get ("/tasks", (req, res) => {
  let AllTasks = taskDB.prepare (`SELECT * FROM "Tasks";`).all ();
  let JsonError = {};

  if (AllTasks == undefined) {
    JsonError = "Database is empty.";
    res.status (500).send (JsonError);
  } else {
    res.send (AllTasks);
  }
});

app.get("/tasks/:id", (req, res) => {
  let task = taskDB.prepare (`SELECT * FROM "Tasks" WHERE ID = ?;`).get (req.params.id);
  let JsonError = {};
  if (task == undefined) {
    JsonError = "Task " + req.params.id + " does not exist.";
    res.status (404).send (JsonError);
  } else {
    res.send (task);
  }
});

app.post("/tasks", bodyParser.json (), (req, res) => {
  let NewTask = {};
  let JsonError = {};
  if (req.body.title && typeof (req.body.title) == 'string') {
    NewTask.Done = 0;
    NewTask.Title = req.body.title;
    taskDB.prepare (`INSERT INTO "Tasks" (Title, Done) VALUES (?, ?);`).run (NewTask.Title, NewTask.Done);
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
  let OldTask = taskDB.prepare (`SELECT * FROM "Tasks" WHERE ID = ?;`).get (req.params.id);
  let NewTask = req.body;
  let JsonError = {};
  let UpdateQuery = taskDB.prepare (`UPDATE "Tasks" SET Title = COALESCE (@title, Title), Done = COALESCE (@done, Done) WHERE ID = @id;`);

  if (OldTask == undefined) {
    res.status (404).send ("Task " + req.params.id + " does not exist.");
  } else {
    if (NewTask.title != undefined && typeof (NewTask.title) != "string") {
      JsonError.error = "Incorrectly formatted title field.";
      return res.status (400).send (JsonError);
    }

    if (NewTask.done != undefined) {
      if (typeof (NewTask.done) != "number") {
        JsonError.error = "Incorrectly formatted done field."
        return res.status (400).send (JsonError);
      } else if (NewTask.done > 1 || NewTask.done < 0) {
        JsonError.error = "Done field must be either 0 or 1."
        return res.status (400).send (JsonError);
      }
    }

    if (NewTask.title == undefined && NewTask.done == undefined) {
      JsonError.error = "Fields to edit are missing.";
      res.status (400).send (JsonError);
    }

    if (JsonError.error == undefined) {
      try {
        UpdateQuery.run ({
          title: NewTask.title,
          done: NewTask.done,
          id: req.params.id
        });
        res.send (NewTask);
      } catch (SqliteError) {
        JsonError.error = SqliteError;
        return res.status (500).send (JsonError);
      }
    }
  }
});

app.delete ("/tasks/:id", (req, res) => {
  let FoundTask = taskDB.prepare (`SELECT * FROM "Tasks" WHERE ID = ?;`).get (req.params.id);
  let DeleteQuery = taskDB.prepare (`DELETE FROM "Tasks" WHERE ID = ?;`);
  let JsonError = {};

  if (!FoundTask) {
    JsonError.error = "Task " + req.params.id + " does not exist.";
    res.status (404).send (JsonError);
  } else {
    try {
      DeleteQuery.run (req.params.id);
      res.status (204).send ();
    } catch (SqliteError) {
      JsonError.error = SqliteError;
      return res.status (500).send (JsonError);
    }
  }
});

app.use ("/docs", swaggerUi.serve, swaggerUi.setup (swaggerDoc));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});