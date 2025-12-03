import crypto from "crypto";

export const generateAlphaNumericValue = (length = 32) => {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").slice(0, length);
};

export const processImageFilePath = (file) => {
  const maxSize = process.env.FILE_SIZE; // --> 3MB

  if (file.size > maxSize) {
    throw new Error("Image file is too large. Max size is 3MB.");
  }
  return file.path;
};
