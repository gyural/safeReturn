const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const server = express();
dotenv.config();


server.set('port', process.env.PORT || 8008);
server.use(express.json());
server.use(express.urlencoded({extended : true}));
server.use(express.static(path.join(__dirname,'public'))); 
server.use(morgan('dev'));





server.listen(server.get('port'), () => {
    console.log(`Server is running on port`, server.get('port'));
});
