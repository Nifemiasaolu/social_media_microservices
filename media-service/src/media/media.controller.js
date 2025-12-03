import {
  getAllMediasForUser,
  uploadFile,
  uploadMultipleFiles,
} from "./media.service.js";

export const uploadMedia = (req, res, next) => {
  const { file } = req;
  const { userId } = req.user;

  uploadFile({ file, userId })
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

export const uploadMultipleMedias = (req, res, next) => {
  const { files } = req;
  const { userId } = req.user;

  uploadMultipleFiles({ files, userId })
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

export const fetchAllMedias = (req, res, next) => {
  const { userId } = req.user;

  getAllMediasForUser({ userId })
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
