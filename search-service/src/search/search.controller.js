import { searchPost } from "./search.service.js";

export const searchUserPost = (req, res, next) => {
  const { userId } = req.user;
  const query = req.query;

  searchPost({ userId, query })
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
