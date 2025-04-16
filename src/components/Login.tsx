import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../constants";
import api from "../utils/api";

export enum CheckPoints {
  entry_gate,
  front_office,
  weigh_bridge,
  qc,
  material_handling,
  none,
}

export interface UserData {
  email: string;
  name: string;
  password: string;
  role: string;
  checkPointAssigned: CheckPoints;
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response: UserData = (
        await api.post(`/auth/login`, { email, password })
      ).data.data;
      localStorage.setItem("userEmail", response.email);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      return;
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-white text-black p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          type="text"
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          onClick={() => {
            handleLogin();
          }}
          type="button"
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
