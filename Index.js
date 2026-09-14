const express = require('express');
const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});