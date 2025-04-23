"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Truck, Users, CheckCircle, Clock, Workflow } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { getUserDetails } from "../utils/getuserDetails";
import api from "../utils/api";
import AddTruckModal from "./AddTruckModal";
import { UserData } from "./Login";
import Navbar from "./Navbar";
import AddOperatorModal from "./AddOperatorModal";
import { TruckType } from "./Track";
import AddWorkflowModal from "./AddWorkflowModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  operator: UserData | null;
}

function EditOperatorModal({
  isOpen,
  onClose,
  operator,
}: EditOperatorModalProps) {
  const [selectedCheckpoints, setSelectedCheckpoints] = useState<string[]>(
    operator?.checkPointAssigned || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [availableCheckpoints, setAvailableCheckpoints] = useState<string[]>(
    []
  );

  useEffect(() => {
    setSelectedCheckpoints(operator?.checkPointAssigned || []);
  }, [operator]);

  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        const response = await api.get("/track/get-all-checkpoints");
        setAvailableCheckpoints(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch checkpoints:", error);
        toast("Failed to load checkpoints");
      }
    };
    if (isOpen) {
      fetchCheckpoints();
    }
  }, [isOpen]);

  const handleCheckpointToggle = (checkpoint: string) => {
    console.log("Toggling checkpoint: ", checkpoint);
    setSelectedCheckpoints((prev) =>
      prev.includes(checkpoint)
        ? prev.filter((cp) => cp !== checkpoint)
        : [...prev, checkpoint]
    );
  };

  const handleUpdate = async () => {
    if (!operator) return;

    setIsLoading(true);
    try {
      const response = await api.post("/users/update-operator", {
        email: operator.email,
        checkPointAssigned: selectedCheckpoints,
      });

      if (response.status === 200) {
        toast("Operator updated successfully");
        onClose();
      }
    } catch (error) {
      console.error("Failed to update operator:", error);
      toast("Failed to update operator");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCheckpointName = (name: string) => {
    if (name === "none") return "None";
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Edit Operator
          </DialogTitle>
          <DialogDescription>Update {operator?.name} details</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Currently Assigned Checkpoints</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCheckpoints.map((checkpoint) => (
                <Badge
                  key={checkpoint}
                  variant="secondary"
                  className="flex items-center gap-1"
                  onClick={() => {
                    console.log("toggleeeee");
                    handleCheckpointToggle(checkpoint);
                  }}
                >
                  {formatCheckpointName(checkpoint)}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Available Checkpoints</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableCheckpoints
                .filter(
                  (checkpoint) => !selectedCheckpoints.includes(checkpoint)
                )
                .map((checkpoint) => (
                  <div
                    key={checkpoint}
                    onClick={() => handleCheckpointToggle(checkpoint)}
                    className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md cursor-pointer hover:bg-secondary"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="text-sm">
                      {formatCheckpointName(checkpoint)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button className="text-white" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isLoading}
            className="bg-primary text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const [user, setUser] = useState<UserData>({
    email: "",
    name: "",
    password: "",
    role: "",
    checkPointAssigned: ["none"],
  });
  const [operators, setOperators] = useState<UserData[]>([]);
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [isAddTruckModalOpen, setIsAddTruckModalOpen] = useState(false);
  const [isAddOperatorModalOpen, setIsAddOperatorModalOpen] = useState(false);
  const [isAddWorkflowModalOpen, setIsAddWorkflowModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<UserData | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      <Navbar userName={user.name} userRole={user.role} />
      <p className="mt-[20dvh] ml-2 m-2 bg-gray-500 text-lg text-white w-fit px-2 rounded-lg">
        Welcome, {user.name}!
      </p>
      {user.role === "admin" && (
        <>
          <Card className="mb-4 mx-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 w-full md:w-fit">
                  <Users className="h-5 w-5" />
                  Available Operators
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setIsAddOperatorModalOpen(true)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Operator
                  </Button>
                  <Button
                    onClick={() => setIsAddWorkflowModalOpen(true)}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Workflow
                  </Button>
                </div>
              </div>
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
                      className="transition-all duration-300 hover:shadow-md cursor-pointer"
                      onClick={() => {
                        setSelectedOperator(operator);
                        setIsEditModalOpen(true);
                      }}
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
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium">
                              Checkpoints:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {operator.checkPointAssigned.map((checkpoint) => (
                                <Badge
                                  key={checkpoint}
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {formatCheckpointName(checkpoint.toString())}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <AddOperatorModal
            isOpen={isAddOperatorModalOpen}
            onClose={() => setIsAddOperatorModalOpen(false)}
          />
          <AddWorkflowModal
            isOpen={isAddWorkflowModalOpen}
            onClose={() => setIsAddWorkflowModalOpen(false)}
          />
          <EditOperatorModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            operator={selectedOperator}
          />
        </>
      )}
      <div className="mx-2 p-2 overflow-y-scroll max-h-full min-h-[60dvh]">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between pb-2 ">
          <div>
            <p className="text-3xl font-bold tracking-tight flex items-center justify-start">
              Truck Tracking
            </p>
            <CardDescription className="flex items-center justify-start">
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
        <CardContent className="">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="text-center">
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
                    <CardHeader className="">
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
                            {truck.finished
                              ? "Completed"
                              : `${
                                  truck.stages[
                                    Math.floor(truck.currentStage / 2)
                                  ]?.name
                                }`}
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
                              {truck.currentStage}/{2 * truck.stages.length}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {expandedSections[truck.trackingNumber] && (
                        <div className="mt-4 space-y-3 animate-in fade-in-50 slide-in-from-top-5 duration-300 overflow-y-scroll max-h-[80dvh]">
                          {Object.entries(truck.stages).map(
                            (checkpoint, index) => {
                              const isOperatorCheckpoint =
                                user.role === "operator" &&
                                user.checkPointAssigned.some(
                                  (checkPoint) =>
                                    checkPoint.toString() ==
                                    checkpoint[1].name.toString()
                                );

                              return (
                                <div
                                  key={checkpoint[1].name.toString()}
                                  className={cn(
                                    "border rounded-lg overflow-hidden relative",
                                    isOperatorCheckpoint
                                      ? "bg-yellow-50 border-yellow-200 shadow-sm"
                                      : "bg-gray-50 border-gray-200"
                                  )}
                                >
                                  {isOperatorCheckpoint && (
                                    <Badge
                                      variant="secondary"
                                      className="absolute top-2 right-2 bg-yellow-100 text-yellow-800"
                                    >
                                      Assigned
                                    </Badge>
                                  )}
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
                                          checkpoint[1].name.toString()
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
                                                  checkpoint[1].name,
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
                                                  checkpoint[1].name,
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
                      {truck.details &&
                        Object.entries(truck.details).length > 0 && (
                          <div className="mt-3 border-t pt-3">
                            <h4 className="text-sm font-medium mb-2">
                              Additional Details
                            </h4>
                            <div className="grid gap-2">
                              {Object.entries(truck.details).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between items-center text-sm"
                                  >
                                    <span className="font-medium capitalize">
                                      {key}:
                                    </span>
                                    <span className="text-muted-foreground">
                                      {value}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </div>

      <AddTruckModal
        isOpen={isAddTruckModalOpen}
        onClose={() => setIsAddTruckModalOpen(false)}
      />
    </div>
  );
}
