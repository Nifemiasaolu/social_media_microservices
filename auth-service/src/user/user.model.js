import mongoose from "mongoose";
import argon2 from "argon2";

export const UserRole = {
  USER: "user",
  ADMIN: "admin",
};

const schema = {
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    default: "user",
  },
  refreshToken: {
    type: String,
  },

  forgotPasswordToken: {
    type: String,
  },
};

const userSchema = new mongoose.Schema(schema, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (e) {
      return next(e);
    }
  }
});

userSchema.methods.comparePassword = async function (incomingPassword) {
  try {
    return await argon2.verify(this.password, incomingPassword);
  } catch (e) {
    throw e;
  }
};

userSchema.index({ username: "text" });

userSchema.set("toJSON", {
  transform(doc, ret) {
    const { _id: id, __v, ...others } = ret;
    return { id, ...others };
  },
});

const User = mongoose.model("user", userSchema);
export default User;
