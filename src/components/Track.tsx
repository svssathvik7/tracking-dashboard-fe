"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Truck,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import api from "../utils/api";

export default function Track() {
  const [trucks, setTrucks] = useState([]);
  const [showFinished, setShowFinished] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrucks = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/track/get-all-trucks");
        setTrucks(response.data.data);
      } catch (error) {
        console.error("Failed to fetch trucks:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrucks();
  }, []);

  const filteredTrucks = trucks.filter(
    (truck: any) =>
      truck.finished === showFinished &&
      truck.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageTimeAtCheckpoints = (trucks: any) => {
    const checkpoints = [
      "entry_gate",
      "front_office",
      "weigh_bridge",
      "qc",
      "material_handling",
    ];
    const averages = checkpoints.map((checkpoint) => {
      const times = trucks.flatMap((truck: any) =>
        truck.timestamps[checkpoint].map((timestamp: any) => {
          const start = new Date(timestamp.start);
          const end = new Date(timestamp.end);
          if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            return (end.getTime() - start.getTime()) / 1000; // convert to seconds
          } else {
            return 0;
          }
        })
      );
      const total = times.reduce((acc: any, time: any) => acc + time, 0);
      return times.length > 0 ? total / times.length : 0;
    });
    return averages;
  };

  const checkpointNames = [
    "Entry Gate",
    "Front Office",
    "Weigh Bridge",
    "Quality Control",
    "Material Handling",
  ];

  const getProgressPercentage = (currentStage: number) => {
    return (currentStage + 1) * 20;
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Track Trucks</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-finished"
              checked={showFinished}
              onCheckedChange={setShowFinished}
            />
            <Label htmlFor="show-finished">Show Finished</Label>
          </div>
        </div>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Search by Tracking Number"
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="mb-6"
        />
      </div>

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
      ) : filteredTrucks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Truck className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium">No trucks found</h3>
          <p className="text-gray-500 mt-2">
            {showFinished
              ? "No completed trucks match your search."
              : "No in-progress trucks match your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrucks.map((truck: any) => (
            <Card
              key={truck.trackingNumber}
              className={cn(
                "transition-all duration-300 hover:shadow-lg border-l-4",
                truck.finished ? "border-l-green-500" : "border-l-blue-500"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {truck.trackingNumber}
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
                    <p className="text-sm text-muted-foreground">Progress</p>
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
                    setSelectedTruck(
                      truck.trackingNumber === selectedTruck
                        ? null
                        : truck.trackingNumber
                    )
                  }
                  className="flex items-center justify-between w-full py-2 text-sm font-medium text-left text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <span>Checkpoint Details</span>
                  {selectedTruck === truck.trackingNumber ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {selectedTruck === truck.trackingNumber && (
                  <div className="mt-4 space-y-3 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                    {[
                      "entry_gate",
                      "front_office",
                      "weigh_bridge",
                      "qc",
                      "material_handling",
                    ].map((checkpoint, index) => {
                      const timestamps = truck.timestamps[checkpoint];
                      const lastTimestamp = timestamps[timestamps.length - 1];
                      const isCurrentStage = truck.currentStage === index;
                      const hasCompleted = index < truck.currentStage;

                      return (
                        <div
                          key={checkpoint}
                          className={cn(
                            "p-3 rounded-lg border transition-all",
                            isCurrentStage
                              ? "bg-blue-50 border-blue-200 shadow-sm"
                              : hasCompleted
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium capitalize">
                              {checkpoint.replace(/_/g, " ")}
                            </span>
                            {isCurrentStage && (
                              <span className="text-blue-600 animate-pulse">
                                <Truck className="h-4 w-4" />
                              </span>
                            )}
                            {hasCompleted && (
                              <span className="text-green-600">
                                <CheckCircle className="h-4 w-4" />
                              </span>
                            )}
                          </div>
                          {lastTimestamp && (
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                              <div>
                                <p className="font-medium text-gray-700">
                                  Start:
                                </p>
                                <p>
                                  {lastTimestamp.start
                                    ? new Date(
                                        lastTimestamp.start
                                      ).toLocaleString()
                                    : "Pending"}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700">
                                  End:
                                </p>
                                <p>
                                  {lastTimestamp.end
                                    ? new Date(
                                        lastTimestamp.end
                                      ).toLocaleString()
                                    : "Pending"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Checkpoint Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {averageTimeAtCheckpoints(trucks).map((avg, index) => {
              const checkpoint = checkpointNames[index];
              const formattedTime = isNaN(avg) ? "N/A" : Math.round(avg);

              return (
                <Card key={index} className="border shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      {checkpoint}
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {formattedTime}
                      </span>
                      <span className="text-sm text-muted-foreground">sec</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
