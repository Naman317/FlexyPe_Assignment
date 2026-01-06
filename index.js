const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/database');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });   
const app = express();
app.use(cors());
// Connect to database
connectDB();




app.use(express.json({ extended: false }));




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
