const app = require('./app');
const connectDB = require('./configs/db.config');
const { seedSystemFrameworkTemplates } = require('./services/seed.service');
const { startJobProcessor } = require('./services/jobProcessor.service');

const PORT = process.env.PORT || 5000;

async function main() {
  await connectDB();
  await seedSystemFrameworkTemplates();
  startJobProcessor();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
