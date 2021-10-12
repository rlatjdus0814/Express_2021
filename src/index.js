import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";
import db from './models/index.js';

const app = express();

if (process.env.NODE_ENV === "development") {
  db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true })
    .then(() => {
      //기존 테이블은 모두 삭제 후 새로 생성
      //force: true 옵션은 모델 변경 직후에만 작성하고 구 후에는 빼주는게 좋음
      db.sequelize.sync({ force: true }).then(() => {
        console.log("개발환경 sync 끝")
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use("/users", userRouter);
        app.use("/boards", boardRouter);
        app.listen(3001);
      });
    });
} else if (process.env.NODE_ENV === "production") {
  db.sequelize.sync().then(() => {
    console.log("상용환경 sync 끝")
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/users", userRouter);
    app.use("/boards", boardRouter);
    app.listen(3001);
  });
}




