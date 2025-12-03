import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = {
  postId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
};

const searchSchema = new mongoose.Schema(schema, { timestamps: true });

searchSchema.index({ content: "text" });
searchSchema.index({ createdAt: -1 });

searchSchema.plugin(mongoosePaginate);

searchSchema.set("toJSON", {
  transform(doc, ret) {
    const { _id: id, __v, ...others } = ret;
    return { id, ...others };
  },
});

const Search = mongoose.model("search", searchSchema);

export default Search;
