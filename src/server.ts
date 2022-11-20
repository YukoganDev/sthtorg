import express from 'express';

import { config } from './config';

const app = express();

app.use('/', (req, res) => {
    res.send('Hello world');
});

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
})