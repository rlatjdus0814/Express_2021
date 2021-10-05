import db from "./src/models/index.js";
import faker from "faker";
import bcrypt from "bcrypt";

faker.locale = "ko";
const { User, Board } = db;

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const user_sync = async () => {
  try {
    await User.sync({ force: true }); //동기화한 설계도
    for (let i = 0; i < 100; i++) {
      const hashpwd = await bcrypt.hash("test1234", 5); //비밀번호 bcrypt화
      await User.create({ //한 번에 한 유저를 생성하기 위해 await 사용
        name: faker.name.lastName() + faker.name.firstName(),
        age: getRandomInt(15, 50),
        password: hashpwd
      });
    }
  } catch (err) {
    console.log(err)
  }
}

const board_sync = async () => {
  try {
    await Board.sync({ force: true }); //기존 테이블 삭제 후 새 테이블 생성
    for (let i = 0; i < 100; i++) {
      await Board.create({
        title: faker.lorem.sentence(1),
        content: faker.lorem.sentence(10),
        userId: getRandomInt(1, 100)
      })
    }
  } catch (error) {
    console.log(error)
  }
}

await user_sync();
await board_sync();