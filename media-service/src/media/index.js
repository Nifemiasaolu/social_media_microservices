import {
  fetchAllMedias,
  uploadMedia,
  uploadMultipleMedias,
} from "./media.controller.js";
import multerUpload from "../modules/multer.js";

const media = ({ server, subDomain }) => {
  server.post(`${subDomain}/upload`, multerUpload.single("file"), uploadMedia);
  server.post(
    `${subDomain}/upload-multiple`,
    multerUpload.array("files", 5),
    uploadMultipleMedias,
  );
  server.get(`${subDomain}/all`, fetchAllMedias);
};

export default media;
