import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import logger from "../logger.js";

let isConfigured = false;

const configureCloudinary = () => {
  if (!isConfigured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    isConfigured = true;
  }
};

// Upload File
// export const cloudinaryFileUpload = async (file) => {
//   try {
//     configureCloudinary();
//
//     const mediaFolder = process.env.CLOUDINARY_MEDIA_FOLDER;
//     return new Promise((resolve, reject) => {
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           folder: mediaFolder,
//           resource_type: "auto",
//         },
//         (error, result) => {
//           if (error) {
//             logger.error(
//               `::: Error occurred while uploading to cloudinary: ${JSON.stringify(error)} :::`,
//             );
//             reject(error);
//           }
//           logger.info(`::: File path successfully uploaded to cloudinary :::`);
//           resolve(result);
//         },
//       );
//
//       uploadStream.end(file.buffer);
//     });
//   } catch (e) {
//     logger.error(
//       `::: Error uploading file to cloudinary: [${JSON.stringify(e)}] :::`,
//     );
//     throw e;
//   }
// };

// Upload File Path
export const cloudinaryFileUpload = async (filePath) => {
  try {
    configureCloudinary();

    const mediaFolder = process.env.CLOUDINARY_MEDIA_FOLDER;
    const result = await cloudinary.uploader.upload(filePath, {
      folder: mediaFolder,
      resource_type: "auto",
    });

    logger.info(`::: File path uploaded successfully to Cloudinary :::`);

    // remove the file from local storage after upload
    fs.unlink(filePath, (err) => {
      if (err) logger.error(`::: Could not delete temp file ${filePath} :::`);
    });

    return result;
  } catch (e) {
    logger.error(`::: Cloudinary upload error: ${JSON.stringify(e)} :::`);
    throw e;
  }
};

export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(
      `::: Media [${publicId}] deleted successfully from cloud storage :::`,
    );
    return result;
  } catch (e) {
    logger.error(
      `::: Failed to delete media from cloudinary with error [${JSON.stringify(e)}] :::`,
    );
    throw e;
  }
};
