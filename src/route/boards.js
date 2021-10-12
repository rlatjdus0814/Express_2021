import { Router } from "express";
import db from "../models/index.js";

const { Board, User } = db;
const boardRouter = Router();

//게시글 전체 조회
boardRouter.get("/", async (req, res) => {
  try {
    const boards = await Board.findAll();
    res.status(200).send({
      count: boards.length,
      boards
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({ msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." })
  }
});

boardRouter.get("/:id", async (req, res) => {
  try {
    const findBoard = await Board.findOnd({
      include: [User],
      where: {
        id: req.params.id
      }
    });
    if (findBoard) {
      res.status(200).send({
        findBoard
      });
    } else {
      res.status(400).send({ msg: "해당 id값을 가진 board가 없습니다." })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({ msg: "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요." })
  }
});

//게시글 생성
boardRouter.post("/", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    if (!title) {
      res.status(400).send({
        msg: "입력요청값이 잘못되었습니다."
      });
    }
    const write = await User.findOne({ id: useId });
    if (!write) {
      res.status(400).send({
        msg: '작성자가 존재하지 않습니다.'
      })
    } else {
      const result = await Board.create({
        title: title ? title : null,
        content: content ? content : null,
        userId: userId ? userId : null,
      });
      res.status(201).send({
        msg: `id ${result.id}, ${result.title} 게시글이 생성되었습니다.`
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({
      msg: "서버에 문제 발생"
    });
  }

});

//title 변경
boardRouter.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    let board = await Board.findOne({
      where: {
        id: req.params.id
      }
    })
    if (!board || (!title && !content)) {
      res.status(400).send({ msg: '게시글이 존재하지 않거나 입력값이 잘못되었습니다.' });
    }

    if (title) board.title = title;
    if (content) board.content = content;

    await board.save();
    res.status(200).send({
      msg: '게시글이 정상적으로 수정되었습니다.'
    });
  } catch (error) {
    res.status(500).send({
      msg: '서버에 문제가 발했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

//게시글 지우기
boardRouter.delete("/:id", async (req, res) => {
  try {
    let board = await Board.findOne({
      where: {
        id: req.params.id
      }
    })
    if (!board) {
      res.status(400).send({ msg: '게시글이 존재하지 않습니다.' });
    }

    await board.destroy();
    res.status(200).send({
      msg: '게시글이 정상적으로 삭제되었습니다.'
    });
  } catch (error) {
    res.status(500).send({
      msg: '서버에 문제가 발했습니다. 잠시 후 다시 시도해주세요.'
    });
  }
});

export default boardRouter;