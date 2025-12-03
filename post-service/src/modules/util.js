import crypto from "crypto";

export const generateAlphaNumericValue = (length = 32) => {
  const bytes = crypto.randomBytes(Math.ceil(length / 2));
  return bytes.toString("hex").slice(0, length);
};
