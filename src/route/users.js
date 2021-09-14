import { Router } from "express";
import _ from "lodash";
import sequelize from "sequelize";
import faker from "faker";
faker.locale = "ko";

const seq = new sequelize('express', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql'
});

const check_sequelize_auth = async () => {
  try {
    await seq.authenticate();
    console.log('db 연결성공');
  } catch (err) {
    console.error('db 연결실패:' + err);
  }
}
check_sequelize_auth();

const User = seq.define("user", { //유저 설계도
  name: {
    type: sequelize.STRING,
    allowNull: false
  },
  age: {
    type: sequelize.INTEGER,
    allowNull: false
  }
});

const user_sync = async () => {
  try {
    await User.sync({ force: true }); //동기화한 설계도
    for (let i = 0; i < 100; i++) {
      await User.create({ //한 번에 한 유저를 생성하기 위해 await 사용
        name: faker.name.lastName() + faker.name.firstName(),
        age: getRandomInt(15, 50)
      });
    }
  } catch (err) {
    console.log(err)
  }
}
user_sync();

const userRouter = Router();

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

let users = [];
// for (let i = 1; i < 10000; i += 1) {
//   users.push({
//     id: 1,
//     name: faker.name.lastName() + faker.name.firstName(),
//     age: getRandomInt(15, 50),
//   })
// }

console.log("준비됨")

//전체 조회
userRouter.get("/", async (req, res) => {
  try {
    let { name, age } = req.query;
    const { Op } = sequelize;
    const findUserQuery = {
      attributes: ['name', 'age'],
    }
    let result;

    if (name && age) {
      findUserQuery['where'] = { name: { [Op.substring]: name }, age }
    } else if (name) {
      findUserQuery['where'] = { name: { [Op.substring]: name } }
    } else if (age) {
      findUserQuery['where'] = { age }
    }

    result = await User.findAll(findUserQuery);
    res.status(200).send({
      count: result.length,
      result
    })
  } catch (err) {
    console.log(err)
    res.status(500).send("서버에 문제가 발생")
  }
});

//한 명의 유저 조회
userRouter.get("/:id", (req, res) => {
  const findUser = _.find(users, { id: parseInt(req.params.id) });
  let msg;
  if (findUser) {
    msg = "정상적으로 조회되었습니다.";
    res.status(200).send({ //200: OK
      msg,
      findUser
    });
  } else {
    msg = "해당 아이디를 가진 유저가 없습니다.";
    res.status(400).send({
      msg,
      findUser
    });
  }

});

//유저 생성
userRouter.post("/", async (req, res) => {
  try {
    const { name, age } = req.body;
    if (!name || !age) {
      res.status(400).send({
        msg: "입력요청값이 잘못되었습니다."
      });
    }
    const result = await User.create({ name, age }); // {name: name, age: age}
    res.status(201).send({
      msg: `id ${result.id}, ${result.name} 유저가 생성되었습니다.`
    });
  } catch (err) {
    console.log(err);
    res.status(201).send({
      msg: "서버에 문제 발생"
    });
  }
});

//name 변경
userRouter.put("/:id", (req, res) => {
  //findIndex 사용
  //users 안에서 현재 요청이 들어온 :id 값이 같은 애가 있는지 확인 -> 있으면 index 값 리턴, 없으면 -1을 리턴
  const find_user_index = _.findIndex(users, ["id", parseInt(req.params.id)]);
  let result;
  if (find_user_index !== -1) { //-1이 아니면 users안에 :id와 동일한 ID를 가진 객체 존재
    //users[0] = { id: 1, name: "홍길동", age: 22 }
    users[find_user_index].name = req.body.name;
    result = "성공적으로 수정되었습니다.";
    res.status(200).send({
      result
    });
  } else {
    result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
    res.status(400).send({
      result
    });
  }

  // map 사용
  // const check_user = _.find(users, ["id", parseInt(req.params.id)]);
  // let result;
  // if (check_user) {
  //   users = users.map((entry) => {
  //     if (entry.id === parseInt(req.params.id)) {
  //       entry.name = req.body.name;
  //     }
  //     return entry;
  //   });
  //   result = "성공적으로 수정되었습니다.";
  //   res.status(200).send({
  //     result
  //   });
  // } else {
  //   result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
  //   res.status(400).send({
  //     result
  //   });
  // }
});

//user 지우기
userRouter.delete("/:id", (req, res) => {
  // lodash의 find 메소드를 이용 -> 요청이 들어온 :id 값을 가진 users안의 객체 체크
  const check_user = _.find(users, ["id", parseInt(req.params.id)]);
  let result;
  if (check_user) {
    //reject 메소드를 이용해 해당 id를 가진 유저 삭제
    users = _.reject(users, ["id", parseInt(req.params.id)]);
    result = "성공적으로 삭제되었습니다.";
    res.status(200).send({
      result
    });
  } else {
    result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
    res.status(400).send({
      result
    });
  }
});

export default userRouter;