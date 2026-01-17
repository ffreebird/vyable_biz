import app from './app';

const port = Number.parseInt(process.env.API_PORT || '3001', 10);

console.log(`Starting Vyable Biz API server on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
};
