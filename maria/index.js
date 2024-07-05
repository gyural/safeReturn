const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};
const Missing = require('./missing');
const TmpMissing = require('./tmpMissing');
const Report = require('./report');


const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    operatorsAliases: false,
    timezone: '+09:00',
    port: '32091', 
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Missing = Missing;
db.TmpMissing = TmpMissing;
db.Report = Report;



TmpMissing.initiate(sequelize);
Missing.initiate(sequelize);
Report.initiate(sequelize);

TmpMissing.associate(db);
Missing.associate(db);
Report.associate(db);


module.exports = db;
