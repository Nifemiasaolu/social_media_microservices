import mongoose from "mongoose";

const schema = {
  token: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
};

const refreshTokenSchema = new mongoose.Schema(schema, { timestamps: true });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("refresh-token", refreshTokenSchema);

export default RefreshToken;
