const express = require("express");
const axios = require("axios");
const app = express();
const HOST = "localhost";
const PORT = 5000;
app.use(express.json());

app.get("/fakeapi", (req, res, next) => {
  res.send("Hello From fake api server");
});

// GET /api/users - Fetch a list of users
app.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "Bemin Dawoud", email: "bemin@yahoo.com" },
    { id: 2, name: "Ben Crane", email: "ben@yahoo.com" },
  ]);
});

// GET /api/users/:id - Fetch a specific user by ID
app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, name: "Bemin Dawoud", email: "bemin@yahoo.com" });
});

// POST /api/users - Create a new user
app.post("/users", (req, res) => {
  const { name, email } = req.body;
  res.status(201).json({ id: 3, name, email });
});

// PUT /api/users/:id - Update a user by ID
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  res.json({ id, name, email });
});

// DELETE /api/users/:id - Delete a user by ID
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  res.status(204).send(); // No content to send back
});

// GET /api/posts - Fetch a list of posts
app.get("/posts", (req, res) => {
  res.json([
    { id: 1, title: "Post 1", content: "This is the first post" },
    { id: 2, title: "Post 2", content: "This is the second post" },
  ]);
});

// GET /api/posts/:id - Fetch a specific post by ID
app.get("/posts/:id", (req, res) => {
  const { id } = req.params;
  res.json({ id, title: "Post 1", content: "This is the first post" });
});

// POST /api/posts - Create a new post
app.post("/posts", (req, res) => {
  const { title, content } = req.body;
  console.log(req.body);
  res.status(201).json({ id: 3, title: title, content: content });
});

app.listen(PORT, () => {
  axios({
    method: "POST",
    url: "http://localhost:3000/register",
    headers: "Content-Type: application/json",
    data: {
      apiName: "api",
      protocol: "http",
      host: HOST,
      port: PORT,
    },
  })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  console.log(`Fake API Server is listening on Port ${PORT}`);
});
