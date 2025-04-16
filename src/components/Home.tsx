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

interface TruckData {
  currentStage: number;
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
    qc: Array<{
      start: Date;
      end: Date;
    }>;
    material_handling: Array<{
      start: Date;
      end: Date;
    }>;
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
  const [showFinished, setShowFinished] = useState(false);
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
    return (currentStage + 1) * 20;
  };

  const formatCheckpointName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          {user.name && (
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.name}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {(user.role === "admin" || user.role === "operator") && (
            <Button
              onClick={() => setIsAddTruckModalOpen(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Truck
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="gap-1"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {user.role === "admin" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Available Operators
            </CardTitle>
            <CardDescription>
              Manage and monitor all operators in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {operators.map((operator) => (
                  <Card
                    key={operator.email}
                    className="transition-all duration-300 hover:shadow-md"
                  >
                    <CardContent className="p-6">
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
                            {operator.checkPointAssigned !== CheckPoints.none
                              ? formatCheckpointName(
                                  CheckPoints[operator.checkPointAssigned]
                                )
                              : "None"}
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Truck Tracking
            </CardTitle>
            <CardDescription>
              Monitor and manage all trucks in the system
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-finished"
              checked={showFinished}
              onCheckedChange={setShowFinished}
            />
            <Label htmlFor="show-finished">Show Finished</Label>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-24 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trucks.filter((truck) => truck.finished === showFinished)
              .length === 0 ? (
            <div className="text-center py-12">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trucks
                .filter((truck) => truck.finished === showFinished)
                .map((truck) => (
                  <Card
                    key={truck.trackingNumber}
                    className={cn(
                      "transition-all duration-300 hover:shadow-lg border-l-4",
                      truck.finished
                        ? "border-l-green-500"
                        : "border-l-blue-500"
                    )}
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
                              {truck.currentStage + 1}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <button
                        onClick={() =>
                          setExpandedSections((prev) => ({
                            ...prev,
                            [truck.trackingNumber]: !prev[truck.trackingNumber],
                          }))
                        }
                        className="flex items-center justify-between w-full py-2 text-sm font-medium text-left text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <span>Checkpoint Details</span>
                        {expandedSections[truck.trackingNumber] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>

                      {expandedSections[truck.trackingNumber] && (
                        <div className="mt-4 space-y-3 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                          {Object.entries(truck.timestamps).map(
                            ([checkpoint, data], index) => {
                              const isExpandable = [
                                "entry_gate",
                                "front_office",
                                "weigh_bridge",
                              ].includes(checkpoint);
                              const isOperatorCheckpoint =
                                user.role === "operator" &&
                                user.checkPointAssigned.toString() ===
                                  checkpoint;

                              return (
                                <div
                                  key={checkpoint}
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
                                        {formatCheckpointName(checkpoint)}
                                      </h4>
                                      {isExpandable && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={() =>
                                            setExpandedSections((prev) => ({
                                              ...prev,
                                              [`${truck.trackingNumber}-${checkpoint}`]: !prev[
                                                `${truck.trackingNumber}-${checkpoint}`
                                              ],
                                            }))
                                          }
                                        >
                                          {expandedSections[
                                            `${truck.trackingNumber}-${checkpoint}`
                                          ] ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>

                                    {isExpandable ? (
                                      expandedSections[
                                        `${truck.trackingNumber}-${checkpoint}`
                                      ] && (
                                        <div className="mt-3 space-y-3 animate-in fade-in-50 duration-200">
                                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                              Incoming
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
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
                                                  {truck.currentStage ===
                                                    4 * index &&
                                                  user.checkPointAssigned.toString() ===
                                                    checkpoint ? (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        handleUpdate(
                                                          truck.trackingNumber,
                                                          checkpoint,
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
                                                      {data[0]?.start
                                                        ? new Date(
                                                            data[0].start
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
                                                  {truck.currentStage ===
                                                    4 * index + 1 &&
                                                  user.checkPointAssigned.toString() ===
                                                    checkpoint ? (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        handleUpdate(
                                                          truck.trackingNumber,
                                                          checkpoint,
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
                                                      {data[0]?.end
                                                        ? new Date(
                                                            data[0].end
                                                          ).toLocaleString()
                                                        : "Pending"}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="bg-white p-3 rounded-lg border border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                                              Returning
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
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
                                                  {truck.currentStage ===
                                                    4 * index + 2 &&
                                                  user.checkPointAssigned.toString() ===
                                                    checkpoint ? (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        handleUpdate(
                                                          truck.trackingNumber,
                                                          checkpoint,
                                                          1,
                                                          true
                                                        );
                                                      }}
                                                      className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                      Update log
                                                    </Button>
                                                  ) : (
                                                    <span className="text-gray-600">
                                                      {data[1]?.start
                                                        ? new Date(
                                                            data[1].start
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
                                                  {truck.currentStage ===
                                                    4 * index + 3 &&
                                                  user.checkPointAssigned.toString() ===
                                                    checkpoint ? (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => {
                                                        handleUpdate(
                                                          truck.trackingNumber,
                                                          checkpoint,
                                                          1,
                                                          false
                                                        );
                                                      }}
                                                      className="bg-green-600 hover:bg-green-700 text-white"
                                                    >
                                                      Update log
                                                    </Button>
                                                  ) : (
                                                    <span className="text-gray-600">
                                                      {data[1]?.end
                                                        ? new Date(
                                                            data[1].end
                                                          ).toLocaleString()
                                                        : "Pending"}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    ) : (
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
                                            {(index === 3
                                              ? truck.currentStage === 4 * index
                                              : truck.currentStage ===
                                                3 * index + 2) &&
                                            user.checkPointAssigned.toString() ===
                                              checkpoint ? (
                                              <Button
                                                size="sm"
                                                onClick={() => {
                                                  handleUpdate(
                                                    truck.trackingNumber,
                                                    checkpoint,
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
                                                {data[0]?.start
                                                  ? new Date(
                                                      data[0].start
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
                                            {(index === 3
                                              ? truck.currentStage ===
                                                4 * index + 1
                                              : truck.currentStage ===
                                                3 * index + 3) &&
                                            user.checkPointAssigned.toString() ===
                                              checkpoint ? (
                                              <Button
                                                size="sm"
                                                onClick={() => {
                                                  handleUpdate(
                                                    truck.trackingNumber,
                                                    checkpoint,
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
                                                {data[0]?.end
                                                  ? new Date(
                                                      data[0].end
                                                    ).toLocaleString()
                                                  : "Pending"}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
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
