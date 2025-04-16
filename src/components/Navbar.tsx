import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("userEmail");
    if (!isLoggedIn) {
      navigate("/login");
    }
  });
  return <></>;
}
