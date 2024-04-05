const express = require('express');

const feedRoutes = require('./routes/feed');

const bodyParser = require('body-parser');
const mongoose  = require('mongoose');
const MONGODB_URI = "mongodb+srv://clumpiness:r1fbR7A327xczldH@cluster0.qcwuzp2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRoutes);

mongoose.connect(MONGODB_URI)
    .then(result => {
        app.listen('8080', () => console.log('server started at 8080'));
    })
    .catch(err => console.log(err));
