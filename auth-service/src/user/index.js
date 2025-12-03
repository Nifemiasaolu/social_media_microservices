import {
  generatePasswordResetToken,
  getRefreshToken,
  login,
  logOut,
  signup,
} from "./user.controller.js";

const auth = ({ server, subDomain }) => {
  server.post(`${subDomain}/sign-up`, signup);
  server.post(`${subDomain}/login`, login);
  server.post(`${subDomain}/password-reset-token`, generatePasswordResetToken);
  server.get(`${subDomain}/refresh-token`, getRefreshToken);
  server.post(`${subDomain}/logout`, logOut);
};

export default auth;
