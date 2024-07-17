require("dotenv").config();

// 미들웨어로 부터 정리된 데이터를 NoSql(몽고 디비)에 저장하는 코드
const {Op} = require('sequelize');
const express = require('express');
const MissingPerson = require('../maria/missing');
const Message = require('../mongo/message');
const messageParsingRouter = express.Router();
const {getMessageInfo} = require('../middlewares/index');

const openai = require('openai')
const dalle = new openai.OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const deepl = require('deepl-node')
const translator = new deepl.Translator(process.env.DEEPL_API_KEY)


// GET 요청 처리
messageParsingRouter.get('/getMessageParsing', getMessageInfo, async (req, res) => {
    try {
        let new_missing_details = [];
      
        
        const missingPersonMessages = res.locals.missingPersonMessages; // api로 부터 받아온 데이터


        // 유지 된 데이터를 중복 하지 않게 저장하는 코드

        const messagesToCreate = await Promise.all(missingPersonMessages.map(async (missingPersonMessage) => {
            const detailsWithAge = `${missingPersonMessage.age}세, ${missingPersonMessage.gender}성, ${missingPersonMessage.details}`;
            const existingMessage = await Message.findOne({
                name: missingPersonMessage.name,
                age: missingPersonMessage.age
            });




            if (!existingMessage) {
                await Message.create({
                    sent_time: missingPersonMessage.sent_time,
                    name: missingPersonMessage.name,
                    age: missingPersonMessage.age,
                    details: detailsWithAge
                });

                new_missing_details.push(detailsWithAge)

            } 
        }));

        // 이미지 생성 코드

        let new_missing = new_missing_details.length
        while (new_missing > 0) {
            const prompt = await translator.translateText(new_missing_details.shift(), 'ko', 'en-US')
            
            console.log(prompt.text)

            const response = await dalle.images.generate({
                model: "dall-e-3",
                prompt: `${prompt.text}, korean, asian, whole body, highquality, reality, only people, without additional elements, one's front view, Appearance from behind, two scenes`,
                n: 1,
                size: "1024x1024",
            });
            image_url = response.data[0].url;
        
            console.log(image_url)

            new_missing--
        }


   ///// -------------------------------------------------------------- 위 코드 아래코드 순서 중요
        
         // MongoDB에서 모든 메시지를 조회
         const allMessages = await Message.find();
         //각 메시지에 대해 MariaDB에서 해당 인물이 존재하는지 확인
         for (const message of allMessages) {

             const missingPerson = await MissingPerson.findOne({
                where : {
                     name: message.name,
                     [Op.or] : [
                        { ageNow: message.age },
                        { pastAge: message.age }
                     ]
                },
                 
             });
            
             
             // 논리적으로 삭제되었지만 삭제 포함 조회 시 존재하면 삭제 (논리적으로만 삭제된 경우 삭제)
             if (!missingPerson) {
                 await Message.collection.deleteOne({_id : message._id });
             }
            
             
         }

        res.json(messagesToCreate.filter(message => message !== null));
    } catch (err) {
        console.error(err);
        res.status(500).json('Nosql 작업 도중 에러 발생');
    }
});

module.exports = messageParsingRouter;