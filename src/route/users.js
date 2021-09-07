import { Router } from "express";
import _ from "lodash";
import faker from "faker";
faker.locale = "ko";

const userRouter = Router();

let users = [{
  id: 1,
  name: "홍길동",
  age: 21
}, {
  id: 2,
  name: "가나다",
  age: 21
}, {
  id: 3,
  name: "김철수",
  age: 21
}, {
  id: 4,
  name: "김영희",
  age: 21
}, {
  id: 5,
  name: "라바마",
  age: 21
}];

//전체 조회
userRouter.get("/", (req, res) => {
  res.send({
    count: users.length,
    users
  });
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
userRouter.post("/", (req, res) => {
  const createUser = req.body;
  const check_user = _.find(users, ["id", createUser.id]); //find로 객체 체크

  let result; //변수 생성해서 메세지 출력
  if (!check_user && createUser.id && createUser.name && createUser.age) { //예외처리
    users.push(createUser);
    result = `${createUser.name}님을 생성했습니다.`
  } else {
    result = '입력 요청값이 잘못되었습니다.'
  }
  res.status(201).send({ //res.send는 한 번만  201: Created
    result
  });
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