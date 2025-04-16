import { useEffect, useState } from "react";
import { CheckPoints, UserData } from "./Login";
import { getUserDetails } from "../utils/getuserDetails";
import api from "../utils/api";
import AddTruckModal from "./AddTruckModal";
import { useNavigate } from "react-router-dom";

interface TruckData {
  finished: boolean;
  trackingNumber: string;
  timestamps: {
    entry_gate: Array<{
      start: Date;
      end: Date;
    }>;
    front_office: Array<{
      start: Date;
      end: Date;
    }>;
    weigh_bridge: Array<{
      start: Date;
      end: Date;
    }>;
    qc: {
      start: Date;
      end: Date;
    };
    material_building: {
      start: Date;
      end: Date;
    };
  };
}

export default function Home() {
  const [user, setUser] = useState<UserData>({
    email: "",
    name: "",
    password: "",
    role: "",
    checkPointAssigned: CheckPoints.none,
  });
  const [operators, setOperators] = useState<UserData[]>([]);
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [showFinished, setShowFinished] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const fetch = async () => {
      const userData: UserData = await getUserDetails(userEmail || "abc");
      setUser(userData);
      console.log(userData);
      try {
        const trucksResponse = await api.get("/track/get-all-trucks");
        setTrucks(trucksResponse.data.data);

        if (userData.role === "admin") {
          const operatorsResponse = await api.get("/users/get-all-operators");
          setOperators(operatorsResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetch();
  }, []);

  const handleStatusToggle = async (
    trackingNumber: string,
    finished: boolean
  ) => {
    try {
      await api.put(`/track/update-status/${trackingNumber}`, { finished });
      setTrucks(
        trucks.map((truck) =>
          truck.trackingNumber === trackingNumber
            ? { ...truck, finished }
            : truck
        )
      );
    } catch (error) {
      console.error("Failed to update truck status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="bg-gray-50 min-h-screen w-screen p-6 overflow-auto absolute top-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          {(user.role === "admin" || user.role === "operator") && (
            <button
              onClick={() => setIsAddTruckModalOpen(true)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Add Truck
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
      {user.role === "admin" && (
        <>
          <div className="space-y-6 mb-8">
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
        </>
      )}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Truck Tracking
          </h2>
          <label className="inline-flex items-center cursor-pointer gap-2">
            <span className="text-sm font-medium text-gray-700">
              Show Finished
            </span>
            <input
              type="checkbox"
              checked={showFinished}
              onChange={(e) => setShowFinished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trucks
            .filter((truck) => truck.finished === showFinished)
            .map((truck) => (
              <div
                key={truck.trackingNumber}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Tracking #{truck.trackingNumber}
                  </h3>
                </div>
                <div className="space-y-4">
                  {Object.entries(truck.timestamps).map(
                    ([checkpoint, data]) => {
                      const times = Array.isArray(data) ? data[0] : data;
                      return (
                        <div key={checkpoint} className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                            {checkpoint.replace("_", " ")}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Start: </span>
                              <span>
                                {new Date(times?.start).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">End: </span>
                              <span>
                                {new Date(times?.end).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      <AddTruckModal
        isOpen={isAddTruckModalOpen}
        onClose={() => setIsAddTruckModalOpen(false)}
      />
    </div>
  );
}
