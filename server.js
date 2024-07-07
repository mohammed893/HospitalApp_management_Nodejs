const http = require('http');
const app = require('./app');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
// const { pool } = require('./configs/DataBase_conf');
// const { startCronJobs } = require('./Cron Jobs/index');
// const { initializeSocket } = require('./sockets/socket.controller');
const mongoose = require('mongoose');

async function startServer() {
  // await pool.connect().then(
  //   () => { console.log('Connected to PostgreSQL database'); }
  // ).catch((err) => {
  //   console.error('Error connecting to PostgreSQL:', err.stack);
  //   process.exit(1);
  // });
  // startCronJobs();//Initialize CronJob
  // await initializeSocket();//init Socket
  await mongoose
    .connect('mongodb+srv://omarsaad08:5RCr7kLbTk1cwiUE@cluster0.lubh9dn.mongodb.net/tumora?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => {
      console.log('MongoDB connected :)')
    })
    .catch((e) => console.log(`error: ${e}`));
  server.listen(PORT, () => {
    console.log(`Listening on Port ${PORT} !`);
  });
}

startServer();