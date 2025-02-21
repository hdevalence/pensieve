const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  const storagePath = process.env.STORAGE_PATH || '/you/didnt/set/STORAGE_PATH/env/var';
  // Serve files from a specific directory
  server.use('/api/signal/attachments', express.static(path.join(storagePath, '/attachments.noindex')));

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
