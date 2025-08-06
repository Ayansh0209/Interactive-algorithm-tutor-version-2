const express = require('express');
const cors = require('cors');

const pythonRoutes = require('./routes/python');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/python', pythonRoutes);

// Future expansion (e.g.)
// const cppRoutes = require('./routes/cpp');
// app.use('/api/cpp', cppRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running at http://localhost:${PORT}`);
});
