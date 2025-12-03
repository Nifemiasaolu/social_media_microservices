import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const schema = {
  publicId: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
};

const mediaSchema = new mongoose.Schema(schema, { timestamps: true });

mediaSchema.index({ content: "text" });
mediaSchema.plugin(mongoosePaginate);

mediaSchema.set("toJSON", {
  transform(doc, ret) {
    const { _id: id, __v, ...others } = ret;
    return { id, ...others };
  },
});

const Media = mongoose.model("media", mediaSchema);

export default Media;
