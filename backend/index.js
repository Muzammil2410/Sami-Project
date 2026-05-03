import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { app as firebaseApp } from './firebase.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic route to verify backend is running
app.get('/', (req, res) => {
  res.send('Backend is running and Firebase config is initialized!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
