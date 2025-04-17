"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Plus,
  Truck,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../utils/getuserDetails";
import api from "../utils/api";
import AddTruckModal from "./AddTruckModal";
import { CheckPoints, UserData } from "./Login";
import Navbar from "./Navbar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const checkpoints = [
  "entry_gate",
  "front_office",
  "weigh_bridge",
  "qc",
  "material_handling",
  "weigh_bridge_return",
  "front_office_return",
  "entry_gate_return",
];
interface TruckData {
  currentStage: number;
  finished: boolean;
  trackingNumber: string;
  timestamps: {
    entry_gate: {
      start: Date;
      end: Date;
    };
    front_office: {
      start: Date;
      end: Date;
    };
    weigh_bridge: {
      start: Date;
      end: Date;
    };
    qc: {
      start: Date;
      end: Date;
    };
    material_handling: {
      start: Date;
      end: Date;
    };
    weigh_bridge_return: {
      start: Date;
      end: Date;
    };
    front_office_return: {
      start: Date;
      end: Date;
    };
    entry_gate_return: {
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
    checkPointAssigned: [CheckPoints.none],
  });
  const [operators, setOperators] = useState<UserData[]>([]);
  const [trucks, setTrucks] = useState<TruckData[]>([]);
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "in_progress" | "completed"
  >("in_progress");
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [refetch, setRefetch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    const fetch = async () => {
      setIsLoading(true);
      try {
        const userData: UserData = await getUserDetails(userEmail || "abc");
        setUser(userData);

        const trucksResponse = await api.get("/track/get-all-trucks");
        setTrucks(trucksResponse.data.data);
        console.log("Trucks ", trucksResponse.data.data);

        if (userData.role === "admin") {
          const operatorsResponse = await api.get("/users/get-all-operators");
          setOperators(operatorsResponse.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [refetch]);

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

  const handleUpdate = async (
    trackingNumber: string,
    checkpoint: string,
    index: number,
    isStart: boolean
  ) => {
    try {
      const response = await api.post("/track/update", {
        trackingNumber,
        checkpoint,
        index,
        isStart,
      });
      console.log("Update tracking response ", response.data);
      setRefetch(!refetch);
    } catch (error) {
      console.error("Failed to update tracking:", error);
    }
  };

  const getProgressPercentage = (currentStage: number) => {
    return (currentStage + 1) * 10;
  };

  const formatCheckpointName = (name: string) => {
    if (name === "none") {
      return "None";
    }
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-screen overflow-x-hidden p-2">
      <Navbar
        userName={user.name}
        userRole={user.role}
        onAddTruck={() => setIsAddTruckModalOpen(true)}
      />

      {user.role === "admin" && (
        <Card className="mb-4 mt-[20dvh] mx-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 w-full md:w-fit">
              <Users className="h-5 w-5" />
              Available Operators
            </CardTitle>
            <CardDescription>
              Manage and monitor all operators in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : operators.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <Users className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium">No operators found</h3>
                <p className="text-gray-500 mt-2">
                  There are no operators registered in the system.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {operators.map((operator) => (
                  <Card
                    key={operator.email}
                    className="transition-all duration-300 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">
                            {operator.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {operator.email}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {operator.role}
                        </Badge>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Checkpoint:
                          </span>
                          <Badge variant="secondary" className="capitalize">
                            {formatCheckpointName(
                              operator.checkPointAssigned.toString()
                            )}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mx-2 p-2 overflow-y-scroll max-h-full md:max-h-[65dvh]">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex flex-wrap items-center gap-2 w-full md:w-fit">
              <Truck className="h-5 w-5" />
              Truck Tracking
            </CardTitle>
            <CardDescription>
              Monitor and manage all trucks in the system
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4 bg-secondary p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus("all")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                filterStatus === "all"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("in_progress")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                filterStatus === "in_progress"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              Progress
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                filterStatus === "completed"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              Completed
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trucks.filter((truck) =>
              filterStatus === "all"
                ? true
                : truck.finished === (filterStatus === "completed")
            ).length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Truck className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium">No trucks found</h3>
              <p className="text-gray-500 mt-2">
                {showFinished
                  ? "No completed trucks in the system."
                  : "No in-progress trucks in the system."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trucks
                .filter((truck) =>
                  filterStatus === "all"
                    ? true
                    : truck.finished === (filterStatus === "completed")
                )
                .map((truck) => (
                  <Card
                    key={truck.trackingNumber}
                    className={cn(
                      "transition-all duration-300 hover:shadow-lg border-l-4 cursor-pointer",
                      truck.finished
                        ? "border-l-green-500"
                        : "border-l-blue-500"
                    )}
                    onClick={() => {
                      setExpandedSections((prev) => ({
                        ...prev,
                        [truck.trackingNumber]: !prev[truck.trackingNumber],
                      }));
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            #{truck.trackingNumber}
                          </CardTitle>
                          <Badge
                            variant={truck.finished ? "default" : "secondary"}
                            className="mt-2"
                          >
                            {truck.finished ? (
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 mr-1 animate-pulse" />
                            )}
                            {truck.finished ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Progress
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={getProgressPercentage(truck.currentStage)}
                              className="h-2 w-16"
                            />
                            <span className="text-sm font-medium">
                              {truck.currentStage}/{2 * checkpoints.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {expandedSections[truck.trackingNumber] && (
                        <div className="mt-4 space-y-3 animate-in fade-in-50 slide-in-from-top-5 duration-300 overflow-y-scroll max-h-56">
                          {Object.entries(truck.timestamps).map(
                            (checkpoint, index) => {
                              const isOperatorCheckpoint =
                                user.role === "operator" &&
                                user.checkPointAssigned.some(
                                  (checkPoint) =>
                                    checkPoint.toString() ==
                                    checkpoint[0].toString()
                                );

                              return (
                                <div
                                  key={checkpoint[0]}
                                  className={cn(
                                    "border rounded-lg overflow-hidden",
                                    isOperatorCheckpoint
                                      ? "bg-yellow-50 border-yellow-200 shadow-sm"
                                      : "bg-gray-50 border-gray-200"
                                  )}
                                >
                                  <div className="p-3">
                                    <div className="flex justify-between items-center">
                                      <h4
                                        className={cn(
                                          "text-sm font-medium capitalize",
                                          isOperatorCheckpoint
                                            ? "text-yellow-800"
                                            : "text-gray-700"
                                        )}
                                      >
                                        {formatCheckpointName(
                                          checkpoint[0].toString()
                                        )}
                                      </h4>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span
                                          className={cn(
                                            "font-medium",
                                            isOperatorCheckpoint
                                              ? "text-yellow-800"
                                              : "text-gray-700"
                                          )}
                                        >
                                          Start:{" "}
                                        </span>
                                        <div className="mt-1">
                                          {2 * index === truck.currentStage &&
                                          isOperatorCheckpoint ? (
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                handleUpdate(
                                                  truck.trackingNumber,
                                                  checkpoint[0],
                                                  0,
                                                  true
                                                );
                                              }}
                                              className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              Update log
                                            </Button>
                                          ) : (
                                            <span className="text-gray-600">
                                              {checkpoint[1]?.start
                                                ? new Date(
                                                    checkpoint[1].start
                                                  ).toLocaleString()
                                                : "Pending"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <span
                                          className={cn(
                                            "font-medium",
                                            isOperatorCheckpoint
                                              ? "text-yellow-800"
                                              : "text-gray-700"
                                          )}
                                        >
                                          End:{" "}
                                        </span>
                                        <div className="mt-1">
                                          {2 * index + 1 ===
                                            truck.currentStage &&
                                          isOperatorCheckpoint ? (
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                handleUpdate(
                                                  truck.trackingNumber,
                                                  checkpoint[0],
                                                  0,
                                                  false
                                                );
                                              }}
                                              className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                              Update log
                                            </Button>
                                          ) : (
                                            <span className="text-gray-600">
                                              {checkpoint[1]?.end
                                                ? new Date(
                                                    checkpoint[1].end
                                                  ).toLocaleString()
                                                : "Pending"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTruckModal
        isOpen={isAddTruckModalOpen}
        onClose={() => setIsAddTruckModalOpen(false)}
      />
    </div>
  );
}
