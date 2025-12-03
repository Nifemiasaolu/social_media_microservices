import logger from "../logger.js";
import { processImageFilePath } from "../modules/util.js";
import {
  cloudinaryFileUpload,
  deleteMediaFromCloudinary,
} from "../modules/cloudinary.js";
import { BadRequestError } from "../modules/app-error.js";
import Media from "./media.model.js";
import { OK } from "../modules/status.js";

export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  try {
    const filePath = processImageFilePath(file);
    const { public_id, secure_url } = await cloudinaryFileUpload(filePath);
    return { public_id, secure_url };
  } catch (e) {
    logger.error(`::: Failed to upload image to cloudinary [${e.message}] :::`);
    return null;
  }
};

export const uploadFile = async ({ file, userId }) => {
  if (!file) {
    throw new BadRequestError("File cannot be empty");
  }

  try {
    const { originalname, mimetype, buffer } = file;

    const uploadedResult = await uploadToCloudinary(file);

    const savedImage = new Media({
      publicId: uploadedResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: uploadedResult.secure_url,
      userId,
    });

    await savedImage.save();
    logger.info(`::: File successfully uploaded :::`);

    return Promise.resolve({
      statusCode: OK,
      data: {
        mediaId: savedImage.id,
        url: uploadedResult.secure_url,
        userId,
      },
    });
  } catch (e) {
    logger.error(`::: Failed to upload file with error response: ${e} :::`);
    throw new BadRequestError(e.message || "Failed to upload file.");
  }
};

export const uploadMultipleFiles = async ({ files, userId }) => {
  if (!files || !files.length) {
    throw new BadRequestError("Files cannot be empty");
  }

  try {
    const uploadImages = files.map(async (file) => {
      const { originalname, mimetype, buffer } = file;

      const uploadedResult = await uploadToCloudinary(file);

      const savedImage = new Media({
        publicId: uploadedResult.public_id,
        originalName: originalname,
        mimeType: mimetype,
        url: uploadedResult.secure_url,
        userId,
      });

      await savedImage.save();
      return {
        mediaId: savedImage.id,
        url: uploadedResult.secure_url,
        userId,
      };
    });

    const result = await Promise.all(uploadImages);

    logger.info(`::: [${files.length}] Files successfully uploaded :::`);

    return Promise.resolve({
      statusCode: OK,
      data: result,
    });
  } catch (e) {
    logger.error(`::: Failed to upload file with error response: ${e} :::`);
    throw new BadRequestError(e.message || "Failed to upload file.");
  }
};

export const getAllMediasForUser = async ({ userId }) => {
  try {
    const result = await Media.find({ userId });
    logger.info(`::: Successfully fetched all medias for user [${userId}] :::`);

    return Promise.resolve({
      statusCode: OK,
      data: { total: result.length, result },
    });
  } catch (e) {
    logger.error(`::: Failed to fetch all media with error response: ${e} :::`);
    throw new BadRequestError(e.message || "Failed to fetch media");
  }
};

export const handleMediaDeletion = async ({ postId, mediaIds, userId }) => {
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds }, userId });

    if (!mediaToDelete.length) {
      logger.error(
        `::: No media for postId [${postId}] with mediaIds [${mediaIds.join(", ")}] :::`,
      );
      return;
    }

    await Promise.all(
      mediaToDelete.map(async (media) => {
        await Promise.all([
          deleteMediaFromCloudinary(media.publicId),
          Media.findByIdAndDelete(media.id),
        ]);

        logger.info(
          `::: Deleted media [${media.id}] associated with deleted post [${postId}] :::`,
        );
      }),
    );
  } catch (e) {
    logger.error(
      `::: Failed to delete media for postId [${postId}] with error response: ${e} :::`,
    );
    throw new BadRequestError(e.message);
  }
};
