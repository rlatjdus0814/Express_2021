import { Router } from "express";
import sequelize from "sequelize";
import db from "../models/index.js";

const User = db.User;
const userRouter = Router();

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
    res.status(500).send({
      msg: "서버에 문제 발생"
    });
  }
});

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