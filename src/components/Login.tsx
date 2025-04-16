import axios from "axios";
import { useState } from "react";
import { BACKEND_URL } from "../constants";
import { useUserStore } from "../store/userStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setUser = useUserStore((state) => state.setUser);

  const handleLogin = async () => {
    try {
      const response = (
        await axios.post(`${BACKEND_URL}/auth/login`, { email, password })
      ).data;
      setUser({
        name: response.name,
        email: response.email,
        role: response.role,
        checkPointAssigned: response.checkPointAssigned,
      });
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
