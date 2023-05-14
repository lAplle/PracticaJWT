const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

const router = require('./routes/router.js');
app.use('/api', router);

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));