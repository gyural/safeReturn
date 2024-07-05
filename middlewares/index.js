// 행정안전부 메시지 정보를 가져오는 api 정보를 적절하게 수정할 수 있는 코드.

const axios = require('axios');

// 날짜 형식 변환 함수 (한국시간으로 변환하고 T, Z 제거)
const parseDate = (dateStr) => {
    // 예시: "2024/06/29 20:38:11"
    const parts = dateStr.split(' ');
    if (parts.length !== 2) {
        return null;
    }

    const [datePart, timePart] = parts;
    const [year, month, day] = datePart.split('/');
    const [hour, minute, second] = timePart.split(':');

    // JavaScript의 Date 객체 생성
    const parsedDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

    // 유효성 검사 (예: NaN이면 잘못된 날짜)
    if (isNaN(parsedDate.getTime())) {
        return null;
    }

    // 한국시간 (KST)으로 변환
    const kstDate = new Date(parsedDate.getTime() + (9 * 60 * 60 * 1000)); // UTC + 9시간 (한국 시간)
    const formattedDate = kstDate.toISOString().replace('T', ' ').replace('Z', '');

    return formattedDate;
};

// 핵심 키워드 (실종자 찾기 위함)
const keywords = ["경찰청"];

// 여러 유형의 메시지 중 실종자 메시지를 필터링하고, 필수 정보만 가져오는 함수 (메서드)
const filterAndExtractInfo = (data) => {
    try {
        const rows = data.DisasterMsg[1].row; // 데이터 구조에 맞게 접근
        return rows
            .filter(entry => keywords.some(keyword => entry.msg.includes(keyword)))
            .map(entry => {
                const msg = entry.msg;
                const genderMatch = msg.match(/남|여/);
                const nameMatch = msg.match(/([가-힣]+)(?=\()/);
                const ageMatch = msg.match(/([0-9]+세)/);
                const detailsMatch = msg.match(/-\s*([^\\v\\\r]*)/);
                const createDate = parseDate(entry.create_date);
                if (!createDate) {
                    throw new Error('Invalid date format in the data');
                }

                return {
                    gender : genderMatch,
                    sent_time: createDate,
                    name: nameMatch ? nameMatch[1].replace('씨', '') : '',
                    age: ageMatch ? parseInt(ageMatch[1].replace('세', '')) : '',
                    details: detailsMatch ? detailsMatch[1] : '',
                };
            });

            
    } catch (error) {
        console.error('Error filtering and extracting info:', error);
        return [];
    }
};

exports.getMessageInfo = async (req, res, next) => {
    try {
        const pageNo = 1; // 예시로 페이지 번호와 행 수를 설정합니다.
        const numOfRows = 1000; // 해당 개수의 row 를 가져옴
        const response = await axios.get(`http://apis.data.go.kr/1741000/DisasterMsg3/getDisasterMsg1List`, {
            params: {
                ServiceKey: process.env.MESSAGE_SECRET,
                type: 'json',
                pageNo: pageNo,
                numOfRows: numOfRows
            }
        });
        

        const data = response.data;
        const missingPersonMessages = filterAndExtractInfo(data);

        res.locals.missingPersonMessages = missingPersonMessages;


        next();
    } catch (error) {
        console.error(error);
        res.status(500).send('행정안전부 api 호출 부분 서버 오류');
    }
};
