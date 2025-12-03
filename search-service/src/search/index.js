import { searchUserPost } from "./search.controller.js";

const search = ({ server, subDomain }) => {
  server.post(`${subDomain}/post`, searchUserPost);
};

export default search;
