import db from "./src/models/index.js";
import faker from "faker";
import bcrypt from "bcrypt";

faker.locale = "ko";
const { User, Board, Permission } = db;

const userCount = 100;
const boardCount = userCount * 0.3 * 365;

const permissions = [{
  title: "전체 관리자", level: 0, desc: "관리자 권한",
}, {
  title: "게시판 관리자", level: 1, desc: "게시판 관리자 권한",
}, {
  title: "사용자 관리자", level: 3, desc: "사용자 관리자 권한",
}, {
  title: "일반 사용자", level: 4, desc: "일반 사용자 권한",
}, {
  title: "게스트", level: 5, desc: "게스트 권한",
}]

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const permission_sync = async () => {
  try {
    for (let i = 0; i < permissions.length; i++) {
      const { title, level, desc } = permission[i];
      await User.create({ title, level, desc });
    }
  } catch (error) {
    console.log(error)
  }
}

const user_sync = async () => {
  try {
    for (let i = 0; i < userCount; i++) {
      const hashpwd = await bcrypt.hash("test1234", 5); //비밀번호 bcrypt화
      await User.create({ //한 번에 한 유저를 생성하기 위해 await 사용
        name: faker.name.lastName() + faker.name.firstName(),
        age: getRandomInt(15, 50),
        password: hashpwd,
        permissionId: getRandomInt(1, 5),
      });
      if (i % 100 === 0) console.log(`${i}/${usercount}`)
    }
  } catch (err) {
    console.log(err)
  }
}

const board_sync = async () => {
  try {
    for (let i = 0; i < boardCount; i++) {
      await Board.create({
        title: faker.lorem.sentence(1),
        content: faker.lorem.sentence(10),
        userId: getRandomInt(1, userCount)
      });
      if (i % 100 === 0) console.log(`${i}/${boardcount}`)
    }
  } catch (error) {
    console.log(error)
  }
}

db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { raw: true }).then(async () => {
  db.sequelize.sync({ force: true });
  await permission_sync();
  console.log("퍼미션 생성 완료");
  await user_sync();
  console.log("유저 생성 완료");
  await board_sync();
  console.log("게시글 생성 완료");
  process.exit();
})
