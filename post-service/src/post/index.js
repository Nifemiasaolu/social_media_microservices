import {
  createUserPost,
  deleteUserPost,
  fetchAllPosts,
  fetchSinglePost,
} from "./post.controller.js";

const post = ({ server, subDomain }) => {
  server.post(`${subDomain}/create`, createUserPost);
  server.get(`${subDomain}/all`, fetchAllPosts);
  server.get(`${subDomain}/:id`, fetchSinglePost);
  server.delete(`${subDomain}/:id/delete`, deleteUserPost);
};

export default post;
