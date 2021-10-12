import dotenv from 'dotenv';
import Sequelize from 'sequelize';
import User from './user.js';
import Board from './board.js';
import Permission from './permission.js';

dotenv.config();

const { DATABASE, DATABASE_HOST, USER_NAME, PASSWORD } = process.env;
const sequelize = new Sequelize(DATABASE, USER_NAME, PASSWORD, {
  host: DATABASE_HOST,
  dialect: 'mysql',
  //logging: 'false'
});

sequelize.authenticate().then(() => {
  console.log("연결 성공");
}).catch(err => {
  console.log("연결 실패: ", err);
});

const db = {
  User: User(sequelize, Sequelize.DataTypes),
  Board: Board(sequelize, Sequelize.DataTypes),
  Permission: Permission(sequelize, Sequelize.DataTypes)
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

Object.keys(db) //["User", "Board", "Permission"]
  .forEach((modelName) => { //modelName -> "User", "Board", "Permission"
    if (db[modelName].associate) { //db.User.assoicate or db["User"].associate
      db[modelName].associate(db); //assoicate에 할당한 함수 실행
    }
  });

export default db;