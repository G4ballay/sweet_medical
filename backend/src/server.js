import 'dotenv/config';
process.env.TZ = "UTC";
import http from 'http';
import app from "./app.js";
import { connectDB } from "./utils/database.utils.js";
import { initSocket } from "./socket/index.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

await connectDB();

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
});