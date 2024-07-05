const express = require('express');
const MissingPerson = require('../maria/missing');
const TmpMissingPerson = require('../maria/tmpMissing');
const axios = require('axios');
const moment = require('moment-timezone');
const dotenv = require('dotenv');
const getMissingRouter = express.Router();
dotenv.config();

function convertTargetClass(apiValue) {
    switch (apiValue) {
        case '010':
            return '18세 미만 아동';
        case '060':
            return '지적 장애인';
        case '070':
            return '치매 질환자';
        default:
            return '기타';
    }
}



async function fetchAndStoreMissingPersons() {
    const esntlId = process.env.SECRET_ID;
    const authKey = process.env.SECRET_KEY;
    const rowSize = "99"; // 한 번에 가져올 최대 데이터 행 수
    let pageNum = 1; // 시작 페이지

    const writngTrgetDscds = ["010", "060", "070"];
    const sexdstnDscd = "";
    const nm = "";
    const detailDate1 = "";
    const detailDate2 = "";
    const age1 = "";
    const age2 = "";
    const occrAdres = "";
    const xmlUseYN = "";

    try {

        await TmpMissingPerson.destroy({ truncate: true });
        let result = null;
        

        while (true) {
            let params = new URLSearchParams();
            params.append('esntlId', esntlId);
            params.append('authKey', authKey);
            params.append('rowSize', rowSize);
            params.append('page', pageNum.toString());

            writngTrgetDscds.forEach(dscd => params.append('writngTrgetDscds', dscd));

            params.append('sexdstnDscd', sexdstnDscd);
            params.append('nm', nm);
            params.append('detailDate1', detailDate1);
            params.append('detailDate2', detailDate2);
            params.append('age1', age1);
            params.append('age2', age2);
            params.append('occrAdres', occrAdres);
            params.append('xmlUseYN', xmlUseYN);

            const response = await axios.post('https://www.safe182.go.kr/api/lcm/findChildList.do', params);
            result = response.data;

            // API에서 더 이상 데이터가 없으면 종료
            if (result.list.length === 0) {
                break;
            }

            // tmpMissingPerson 테이블에 저장
            await Promise.all(result.list.map(async item => {
                await TmpMissingPerson.findOrCreate({
                    where: { name: item.nm, occurDate: moment.tz(item.occrde, 'YYYYMMDD', 'Asia/Seoul').toDate() },
                    defaults: {
                        wearing: item.alldressingDscd,
                        ageNow: item.ageNow,
                        pastAge: item.age,
                        targetClass: convertTargetClass(item.writngTrgetDscd),
                        gender: item.sexdstnDscd,
                        occurPlace: item.occrAdres,
                        imgSource: `https://www.safe182.go.kr/api/lcm/imgView.do?msspsnIdntfccd=${item.msspsnIdntfccd}`,
                    }
                });
            }));

            pageNum++; // 다음 페이지로 이동
        }

        // 데이터베이스 갱신
        await updateDatabase();
        console.log('데이터 베이스 갱신 완료');

    } catch (error) {
        console.error('Error in fetchAndStoreMissingPersons:', error);
    }
}

// 데이터베이스 갱신 함수
async function updateDatabase() {
    try {
        const tmpPersons = await TmpMissingPerson.findAll();
        const currentPersons = await MissingPerson.findAll({
            where : {deletedAt : null},
        });

        // Map을 사용하여 key 값으로 비교하기 쉽게 만듦
        const tmpPersonMap = new Map();
        tmpPersons.forEach(person => {
            const key = `${person.name}_${moment(person.occurDate).format('YYYYMMDD')}`;
            tmpPersonMap.set(key, person);
        });

        const currentPersonMap = new Map();
        currentPersons.forEach(person => {
            const key = `${person.name}_${moment(person.occurDate).format('YYYYMMDD')}`;
            currentPersonMap.set(key, person);
        });

        // 추가할 데이터와 삭제할 데이터 배열 생성
        const toBeInserted = [];
        const toBeDeleted = [];

        tmpPersons.forEach(person => {
            const key = `${person.name}_${moment(person.occurDate).format('YYYYMMDD')}`;
            if (!currentPersonMap.has(key)) {
                toBeInserted.push(person);
            }
        });

        currentPersons.forEach(person => {
            const key = `${person.name}_${moment(person.occurDate).format('YYYYMMDD')}`;
            if (!tmpPersonMap.has(key)) {
                toBeDeleted.push(person);
            }
        });

        // 삭제 수행
        if (toBeDeleted.length > 0) {
            await Promise.all(toBeDeleted.map(async person => {
                await MissingPerson.destroy({ where: { id: person.id }}); // 물리적 삭제
            }));
        }

        // 추가 수행
        if (toBeInserted.length > 0) {
            await Promise.all(toBeInserted.map(async person => {
                await MissingPerson.create({
                    name: person.name,
                    occurDate: person.occurDate,
                    wearing: person.wearing,
                    ageNow: person.ageNow,
                    pastAge: person.pastAge,
                    targetClass: person.targetClass,
                    gender: person.gender,
                    occurPlace: person.occurPlace,
                    imgSource: person.imgSource,
                    
                });
            }));
        }

    } catch (error) {
        console.error('Error in updateDatabase:', error);
    }
}





// GET 요청 처리, // 시스템에 의해 불러오기
getMissingRouter.get('/getMissingInfo', async (req, res) => {
    try {
        await fetchAndStoreMissingPersons();
        console.log('데이터 불러오기 완료!!');
        res.status(200).send('데이터를 성공적으로 가져왔습니다.');
    } catch (error) {
        console.error('Error in GET /:', error);
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});



module.exports = getMissingRouter;

