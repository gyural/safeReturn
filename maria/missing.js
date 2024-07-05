// 실종자 정보 테이블

const Sequelize = require('sequelize');

class Missing extends Sequelize.Model{ 
    static initiate(sequelize){
        Missing.init({
            occurDate : {
                type : Sequelize.DATEONLY,
                allowNull : false,
            }, // 발생일자

            wearing : {
                type : Sequelize.STRING,
                allowNull : true,

            },// 착의사항

            ageNow : {
                type : Sequelize.INTEGER,
                allowNull : false,
            }, // 현재나이

            pastAge : {
                type : Sequelize.INTEGER,
                allowNull : false,
            } ,// 당시나이

            targetClass : {
                type: Sequelize.ENUM('18세 미만 아동', '지적 장애인', '치매 질환자', '기타'),
                allowNull : true,
            }, // 대상구분

            gender: {
                type : Sequelize.ENUM('남자','여자'),
                allowNull : false,
            }, // 성별

            occurPlace : {
                type : Sequelize.STRING,
                allowNull : false,
            }, //발생 장소

            name : {
                type : Sequelize.STRING,
                allowNull : false,
            }, // 실종자 이름
            imgSource : {
                type : Sequelize.STRING,
                allowNull : true,
            }, // 실종자 이미지


            

        },
    {
        sequelize,
        timestamps : true,
        underscored : false,
        modelName : 'Missing',
        tableName : 'missings',
        paranoid : true,
        charset : 'utf8mb4',
        collate : 'utf8mb4_general_ci',

    }
        )
    }



    
    static associate(db){
       
        db.Missing.hasMany(db.Report,{foreignKey : 'missingId'});
        
    }
}
module.exports = Missing;