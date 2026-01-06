const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
app.use(cors())



app.use(express.json({ extended: false }));




const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
