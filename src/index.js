import express from "express";
import userRouter from "./route/users.js";
import boardRouter from "./route/boards.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //파싱해서 넣어주기 위해서는 미들웨어가 필요함
app.use("/users", userRouter);
app.use("/boards", boardRouter);

app.listen(3001); // 3001 포트
