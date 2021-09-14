import express from "express";
import sequelize from "sequelize";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";

const app = express();
const seq = new sequelize('express', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql'
});
//const seq = new sequelize("mysql://root@localhost:3306/express");

seq.authenticate() //sequelize객체와 db 연결 테스트
  .then(() => {
    console.log('db 연결성공')
  })
  .catch((err) => {
    console.error('db 연결실패:' + err)
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //파싱해서 넣어주기 위해서는 미들웨어가 필요함
app.use("/users", userRouter);
app.use("/boards", boardRouter);

app.listen(3001); // 3001 포트
