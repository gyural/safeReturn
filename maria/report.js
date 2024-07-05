// 신고 목록 테이블

const Sequelize = require('sequelize');

class Report extends Sequelize.Model{ 
    static initiate(sequelize){
        Report.init({
            reporter : {
                type : Sequelize.STRING,
                allowNull : false,
            }, // 신고자


            reportPlace : {
                type : Sequelize.STRING,
                allowNull : true,
            }, // 신고자 위치

            reportContent : {
                type : Sequelize.STRING,
                allowNull : true,
            }, // 신고 내용

            missingName : {
                type : Sequelize.STRING,
                allowNull : false,
            } ,// 대상 실종자 이름


            

        },
    {
        sequelize,
        timestamps : true,
        underscored : false,
        modelName : 'Report',
        tableName : 'reports',
        paranoid : true,
        charset : 'utf8mb4',
        collate : 'utf8mb4_general_ci',

    }
        )
    }



    
    static associate(db){
       
        db.Report.belongsTo(db.Missing,{foreignKey : 'missingId', targetKey : 'id'});
        
    }
}
module.exports = Report;