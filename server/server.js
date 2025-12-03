require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const teamRoutes = require('./routes/teamRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/contents', contentRoutes);
app.use('/teams', teamRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Content Manager API Running...');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});