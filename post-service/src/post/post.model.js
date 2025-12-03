import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = {
  userId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  mediaIds: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
};

const postSchema = new mongoose.Schema(schema, { timestamps: true });

postSchema.index({ content: "text" });
postSchema.plugin(mongoosePaginate);

postSchema.set("toJSON", {
  transform(doc, ret) {
    const { _id: id, __v, ...others } = ret;
    return { id, ...others };
  },
});

const Post = mongoose.model("post", postSchema);

export default Post;
