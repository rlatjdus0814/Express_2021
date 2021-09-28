import { Router } from "express";
import _ from "lodash";
import sequelize from "sequelize";
import faker from "faker";
import bcrypt from "bcrypt";
faker.locale = "ko";

const seq = new sequelize('express', 'root', '1234', {
  host: 'localhost',
  dialect: 'mysql',
  logging: true,
});

const check_sequelize_auth = async () => { //시퀄라이즈 연동 확인
  try {
    await seq.authenticate();
    console.log('db 연결성공');
  } catch (err) {
    console.error('db 연결실패:' + err);
  }
}
check_sequelize_auth();

const User = seq.define("user", { //유저 테이블 정의
  name: {
    type: sequelize.STRING,
    allowNull: false
  },
  age: {
    type: sequelize.INTEGER,
    allowNull: false
  }
});

const initDb = async () => {
  await User.sync();
}

initDb();

const user_sync = async () => {
  try {
    await User.sync({ force: true }); //동기화한 설계도
    for (let i = 0; i < 1000; i++) {
      const hashpwd = await bcrypt.hash("test1234", 5); //비밀번호 bcrypt화
      User.create({ //한 번에 한 유저를 생성하기 위해 await 사용
        name: faker.name.lastName() + faker.name.firstName(),
        age: getRandomInt(15, 50),
        password: hashpwd
      });
    }
  } catch (err) {
    console.log(err)
  }
}
//user_sync();

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
    // let result_one = await User.findOne({
    //   where: { name }
    // })

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
// userRouter.put("/:id", (req, res) => {
//   const { id } = req.params;
//   const { name, age } = req.body;
//   const { Op } = sequelize;
//   //findIndex 사용
//   //users 안에서 현재 요청이 들어온 :id 값이 같은 애가 있는지 확인 -> 있으면 index 값 리턴, 없으면 -1을 리턴
//   const find_user_index = _.findIndex(users, ["id", parseInt(req.params.id)]);
//   let result;
//   if (find_user_index !== -1) { //-1이 아니면 users안에 :id와 동일한 ID를 가진 객체 존재
//     //users[0] = { id: 1, name: "홍길동", age: 22 }
//     users[find_user_index].name = req.body.name;
//     result = "성공적으로 수정되었습니다.";
//     res.status(200).send({
//       result
//     });
//   } else {
//     result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
//     res.status(400).send({
//       result
//     });
//   }
// });
userRouter.put("/:id", async (req, res) => {
  try {
    const { name, age } = req.body;
    let user = await User.findOne({
      where: {
        id: req.params.id
      }
    })
    if (!user || (!name && !age)) {
      res.status(400).send({ msg: '유저가 존재하지 않거나 입력값이 잘못되었습니다.' });
    }

    if (name) user.name = name;
    if (age) user.age = age;

    await user.save();
    res.status(200).send({
      msg: '유저정보가 정상적으로 수정되었습니다.'
    });
  } catch (error) {
    res.status(500).send({
      msg: '서버에 문제가 발했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

//user 지우기
// userRouter.delete("/:id", (req, res) => {
//   // lodash의 find 메소드를 이용 -> 요청이 들어온 :id 값을 가진 users안의 객체 체크
//   const check_user = _.find(users, ["id", parseInt(req.params.id)]);
//   let result;
//   if (check_user) {
//     //reject 메소드를 이용해 해당 id를 가진 유저 삭제
//     users = _.reject(users, ["id", parseInt(req.params.id)]);
//     result = "성공적으로 삭제되었습니다.";
//     res.status(200).send({
//       result
//     });
//   } else {
//     result = `아이디가 ${req.params.id}인 유저가 존재하지 않습니다.`;
//     res.status(400).send({
//       result
//     });
//   }
// });
userRouter.delete("/:id", async (req, res) => { //auth 체크 + 권한, 본인체크 필수
  try {
    let user = await User.findOne({
      where: {
        id: req.params.id
      }
    })
    if (!user) {
      res.status(400).send({ msg: '유저가 존재하지 않습니다.' });
    }

    await user.destroy();
    res.status(200).send({
      msg: '유저정보가 정상적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).send({
      msg: '서버에 문제가 발했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

userRouter.get("/test/:id", async (req, res) => {
  try {
    const Op = sequelize.Op;
    const userResult = await User.findAll({
      attributes: ['id', 'name', 'age', 'updatedAt'],
      where: {
        [Op.or]: [{
          [Op.and]: {
            name: { [Op.startsWith]: "김" },
            age: { [Op.between]: [20, 29] }
          }
        }, {
          [Op.and]: {
            name: { [Op.startsWith]: "이" },
            age: { [Op.between]: [30, 39] }
          }
        }]
      },
      order: [['age', 'DESC'], ['name', 'ASC']]
    });

    const boardResult = await Board.findAll({
      attributes: ['id', 'title', 'content'],
      // where: {
      //   limit: 100
      // }
    });

    const user = await User.findOne({
      where: { id: req.params.id }
    });

    const board = await Board.findOne({
      where: { id: req.params.id }
    });

    if (!user || !board) {
      res.status(400).send({ msg: '해당 정보가 존재하지 않습니다' });
    }

    // await user.destroy();
    // board.title += "test 타이틀 입니다.";
    // await board.save();

    res.status(200).send({
      board,
      users: {
        count: userResult.length,
        data: userResult
      },
      boards: {
        count: boardResult.length,
        data: boardResult
      }
    });
  } catch (err) {
    console.log(err)
    res.status(500).send({ msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." })
  }
});

export default userRouter;