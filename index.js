require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const requestLogger = require('./src/middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const routes = require('./src/routes');
const ReservationService = require('./src/services/ReservationService');
const logger = require('./src/utils/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

connectDB().then(() => {
  logger.info('Database connection established');
}).catch((error) => {
  logger.error('Failed to connect to database', { error: error.message });
  process.exit(1);
});

routes(app);
// clean up
setInterval(async () => {
  try {
    const cleaned = await ReservationService.cleanupExpiredReservations();
    if (cleaned > 0) {
      logger.info('Expired reservations cleaned up', { count: cleaned });
    }
  } catch (error) {
    logger.error('Error in cleanup job', { error: error.message });
  }
}, 60000); 


app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
