const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid, v4, validate } = require('uuid');

const app = express();
const repositories = [];

app.use(express.json());
app.use(cors());

app.use('/repositories/:id', validateRepositoryId, validateRepositoryIndex);

function validateRepositoryId(request, response, next) {
  const { id } = request.params;
  
  if (!isUuid(id)) return response.status(400).json({ error: "Invalid repository ID." })

  return next();
}

function validateRepositoryIndex(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({ message: "Repository not found" })
  }

  request.data = { repositoryIndex }
  return next();
}


app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: v4(),
    title,
    url,
    techs,
    likes: 0,
  }
  repositories.push(repository);
  return response.status(201).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { title, url, techs } = request.body;
  const { repositoryIndex } = request.data

  const repository = repositories[repositoryIndex];
  repository.title = title;
  repository.url = url;
  repository.techs = techs;
  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { repositoryIndex } = request.data

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { repositoryIndex } = request.data
  
  const repository = repositories[repositoryIndex];
  repository.likes++

  return response.status(200).json(repository);
});

module.exports = app;
