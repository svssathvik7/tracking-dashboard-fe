import axios from "axios";
import { UserData } from "../components/Login";
import api from "./api";

export const getUserDetails = async (email: string) => {
  const response: UserData = (await api.get(`/users/get-user/${email}`)).data
    .data;
  return response;
};
