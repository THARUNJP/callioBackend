import express from 'express';
import cors from 'cors';
import rout from './router/router.js';
import {createServer} from "http"
import { initSocket } from './service/socket.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // your frontend URL
  credentials: true,               // allow cookies / auth headers
}));

app.use(cookieParser())
// Parse JSON bodies
app.use(express.json());

// Basic route
app.use('/', rout);

const server = createServer(app)

initSocket(server)
// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
