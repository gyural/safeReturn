const express = require('express');
const path = require('path');
const axios = require('axios');
const morgan = require('morgan');
const server = express();
const {sequelize} = require('./maria');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();
const connect = require('./mongo');
connect();
require("dotenv").config();

const port = 3000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/", require("./Routers/imgGenRouter"));


// 서버 설정
server.use(express.json());
server.use(express.urlencoded({extended : true}));
server.use(express.static(path.join(__dirname,'public'))); 
server.use(morgan('dev'));



// 라우터 모듈
const getMissingRouter = require('./routes/MissingPerson');
const messageParsingRouter = require('./routes/MessageParsing');




sequelize.sync({force : false})
.then(()=>{
    console.log('마리아 디비 연결 성공 (연결 포트 : 외부 서버)');
})
.catch((err=>{
    console.error(err);
}));




cron.schedule('*/7 * * * *', async () => {
    try {
        console.log('Sending request to missingApi/getMissingRouter');
        await axios.get('http://localhost:3000/missingApi/getMissingInfo');
        console.log('경찰청 실종자 정보 업데이트 완료',new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
    } catch (err) {
        console.error('ERROR ! : 경찰청 실종자 업데이트 중 오류 발생', err);
    }
});


cron.schedule('*/10 * * * * ', async () => {
    try {
        console.log('Sending request to /messageApi/getMessageParsing');
        await axios.get('http://localhost:3000/messageApi/getMessageParsing');
        console.log('문자메시지 정보 업데이트 완료',new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
    } catch (err) {
        console.error('ERROR ! : 행정안전부 문자메시지 업데이트 중 오류 발생', err);
    }
});




// 실종자 정보 가져오는 api 호출 get // URI : missingApi/getMissingInfo
server.use('/missingApi', getMissingRouter); 

// 실종자 관련 문자메시지 관련 행정안전부 api 호출 미들웨어 // URI : messageApi/getMessageParsing
server.use('/messageApi', messageParsingRouter); 




server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
