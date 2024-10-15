const express = require('express')
const app = express()
const PORT = 3001
app.use(express.json())

// GET /api/users - Fetch a list of users
app.get('/api/users', (req, res) => {
    res.json([
        { id: 1, name: 'Bemin Dawoud', email: 'bemin@yahoo.com' },
        { id: 2, name: 'Ben Crane', email: 'ben@yahoo.com' },
    ]);
});

// GET /api/users/:id - Fetch a specific user by ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    res.json({ id, name: 'Bemin Dawoud', email: 'bemin@yahoo.com' });
});

// POST /api/users - Create a new user
app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    res.status(201).json({ id: 3, name, email });
});

// PUT /api/users/:id - Update a user by ID
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    res.json({ id, name, email });
});

// DELETE /api/users/:id - Delete a user by ID
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    res.status(204).send(); // No content to send back
});

// GET /api/posts - Fetch a list of posts
app.get('/api/posts', (req, res) => {
    res.json([
        { id: 1, title: 'Post 1', content: 'This is the first post' },
        { id: 2, title: 'Post 2', content: 'This is the second post' },
    ]);
});

// GET /api/posts/:id - Fetch a specific post by ID
app.get('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    res.json({ id, title: 'Post 1', content: 'This is the first post' });
});

// POST /api/posts - Create a new post
app.post('/api/posts', (req, res) => {
    const { title, content } = req.body;
    res.status(201).json({ id: 3, title, content });
});


app.listen(PORT, ()=>{
    console.log(`Fake API Server is listening on Port ${PORT}`)
})