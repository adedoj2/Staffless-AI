const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/chat', chatRoutes);

app.get('/', (req, res) => res.send({ status: 'ok' }));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`backend-api listening on ${port}`);
});
