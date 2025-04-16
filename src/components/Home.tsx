import { useEffect, useState } from "react";
import { CheckPoints, UserData } from "./Login";
import { getUserDetails } from "../utils/getuserDetails";
import api from "../utils/api";

export default function Home() {
  const [user, setUser] = useState<UserData>({
    email: "",
    name: "",
    password: "",
    role: "",
    checkPointAssigned: CheckPoints.none,
  });
  const [operators, setOperators] = useState<UserData[]>([]);

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const fetch = async () => {
      const userData: UserData = await getUserDetails(userEmail || "abc");
      setUser(userData);
      console.log(userData);
      if (userData.role === "admin") {
        try {
          const response = await api.get("/users/get-all-operators");
          setOperators(response.data.data);
          console.log("operators", response.data.data);
        } catch (error) {
          console.error("Failed to fetch operators:", error);
        }
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-gray-50 h-screen w-screen p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
      {user.role === "admin" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Available Operators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {operators.map((operator) => (
              <div
                key={operator.email}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {operator.name}
                    </h3>
                    <p className="text-gray-600">{operator.email}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
                    {operator.role}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Checkpoint:
                    </span>
                    <span className="text-sm px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full">
                      {operator.checkPointAssigned}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
