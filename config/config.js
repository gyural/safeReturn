const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    "development": {
      "username": "root",
      "password": process.env.DB_PW,
      "database": "safeReturn",
      "host": "svc.sel5.cloudtype.app",
      // host.docker.internal // in docker
      "dialect": "mariadb"
    },
    "test": {
      "username": "sample",
      "password": "sample",
      "database": "database_test",
      "host": "127.0.0.1",
      "dialect": "mariadb"
    },
    "production": {
      "username": "sample",
      "password": "sample",
      "database": "database_production",
      "host": "127.0.0.1",
      "dialect": "mariadb"
    }
  }
  