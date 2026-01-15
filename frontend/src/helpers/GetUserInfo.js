import { getCurrentUser } from "./authService";

export const getUserInfo = () => {
  return getCurrentUser();
};
