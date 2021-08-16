
const express = require('express');
const path = require('path');

const indexRouter = require('./routes/indexRoute');
const escrowRouter = require('./routes/escrowRoute');


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'web')));

app.use('/', indexRouter);
app.use('/escrow', escrowRouter);



app.use(express.json());
app.listen(3000);

module.exports = app;
