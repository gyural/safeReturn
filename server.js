const express = require('express');
const path = require('path');
const morgan = require('morgan');
const server = express();
const {sequelize} = require('./maria');
const dotenv = require('dotenv');
const cron = require('node-cron');
dotenv.config();



// 서버 설정
server.set('port', process.env.PORT || 8008);
server.use(express.json());
server.use(express.urlencoded({extended : true}));
server.use(express.static(path.join(__dirname,'public'))); 
server.use(morgan('dev'));



// 라우터 모듈
const getMissingRouter = require('./routes/MissingPerson');




sequelize.sync({force : false})
.then(()=>{
    console.log('마리아 디비 연결 성공 (연결 포트 : 외부 서버)');
})
.catch((err=>{
    console.error(err);
}));




cron.schedule('*/7 * * * *', async () => {
    try {
        console.log('Sending request to /getMissingRouter');
        await axios.get('http://localhost:8008/missingApi/getMissingInfo');
        console.log('경찰청 실종자 정보 업데이트 완료',new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
    } catch (err) {
        console.error('ERROR ! : 경찰청 실종자 업데이트 중 오류 발생:', err);
    }
});


// 실종자 정보 가져오는 api 호출 get // URI : missingApi/getMissingInfo
server.use('/missingApi', getMissingRouter); 



server.listen(server.get('port'), () => {
    console.log(`Server is running on port`, server.get('port'));
});
