import {
  createPost,
  deletePost,
  getAllPosts,
  getPost,
} from "./post.service.js";

export const createUserPost = (req, res, next) => {
  const { userId } = req.user;
  const params = req.body;

  createPost({ userId, params })
    .then((dataObj) => {
      res.status(dataObj.statusCode).json({
        status: true,
        data: dataObj.data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const fetchAllPosts = (req, res, next) => {
  const { userId } = req.user;
  const { query } = req;

  getAllPosts({ userId, query })
    .then((dataObj) => {
      res.status(dataObj.statusCode).json({
        status: true,
        data: dataObj.data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const fetchSinglePost = (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  getPost({ id, userId })
    .then((dataObj) => {
      res.status(dataObj.statusCode).json({
        status: true,
        data: dataObj.data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const deleteUserPost = (req, res, next) => {
  const { userId } = req.user;
  const { id } = req.params;

  deletePost({ id, userId })
    .then((dataObj) => {
      res.status(dataObj.statusCode).json({
        status: true,
        data: dataObj.data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};
