const http = require('http');
const app = require('./app');
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const {pool} = require('./configs/DataBase_conf');
const {startCronJobs} = require('./Cron Jobs/index');

async function startServer() {
  await pool.connect().then(
    () => { console.log('Connected to PostgreSQL database'); }
  ).catch((err) => {
    console.error('Error connecting to PostgreSQL:', err.stack);
    process.exit(1);
  });
  startCronJobs();

  server.listen(PORT, () => {
    console.log(`Listening on Port ${PORT} !`);
  });
}

startServer();