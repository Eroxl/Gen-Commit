import express from 'express';
import dotenv from 'dotenv';

import routes from './routes';

// -=- Setup dotenv -=-
dotenv.config();

// -=- Setup express -=-
const app = express();
const port = 8000;

// -=- Setup ExpressJS Body Parser -=-
app.use(express.json());

// -=- Add API Routes -=-
app.use('/', routes);

// -=- Start The Express Server -=-
app.listen(port);
