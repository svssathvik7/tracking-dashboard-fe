import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Track() {
  const [trucks, setTrucks] = useState([]);
  const [showFinished, setShowFinished] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTruck, setSelectedTruck] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const response = await api.get("/track/get-all-trucks");
        setTrucks(response.data.data);
      } catch (error) {
        console.error("Failed to fetch trucks:", error);
      }
    };
    fetchTrucks();
  }, []);

  const filteredTrucks = trucks.filter(
    (truck: any) =>
      truck.finished === showFinished &&
      truck.trackingNumber.includes(searchTerm)
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
            console.warn("Invalid date encountered:", timestamp);
            return 0;
          }
        })
      );
      const total = times.reduce((acc: any, time: any) => acc + time, 0);
      return total / times.length;
    });
    return averages;
  };

  return (
    <div className="bg-gray-50 min-h-screen w-screen p-6 overflow-auto absolute top-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Trucks</h1>
      <input
        type="text"
        placeholder="Search by Tracking Number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />
      <label className="flex items-center mb-4">
        <span className="mr-2">Show Finished</span>
        <input
          type="checkbox"
          checked={showFinished}
          onChange={(e) => setShowFinished(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrucks.map((truck: any) => (
          <div
            key={truck.trackingNumber}
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            onClick={() =>
              setSelectedTruck(
                truck.trackingNumber === selectedTruck
                  ? null
                  : truck.trackingNumber
              )
            }
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {truck.trackingNumber}
                </h2>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    truck.finished
                      ? "bg-green-50 text-green-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {truck.finished ? "Completed" : "In Progress"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Stage</p>
                <p className="text-lg font-medium text-gray-900">
                  {truck.currentStage + 1}/5
                </p>
              </div>
            </div>

            {selectedTruck === truck.trackingNumber && (
              <div className="mt-4 space-y-4 border-t pt-4">
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
                      className={`p-3 rounded-lg ${
                        isCurrentStage
                          ? "bg-blue-50 border border-blue-100"
                          : hasCompleted
                          ? "bg-green-50 border border-green-100"
                          : "bg-gray-50 border border-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {checkpoint
                            .replace("_", " ")
                            .charAt(0)
                            .toUpperCase() +
                            checkpoint.replace("_", " ").slice(1)}
                        </span>
                        {isCurrentStage && (
                          <span className="text-blue-600 animate-pulse">
                            🚛
                          </span>
                        )}
                        {hasCompleted && (
                          <span className="text-green-600">✓</span>
                        )}
                      </div>
                      {lastTimestamp && (
                        <div className="text-xs text-gray-500">
                          <p>
                            Start:{" "}
                            {new Date(lastTimestamp.start).toLocaleString()}
                          </p>
                          {lastTimestamp.end && (
                            <p>
                              End:{" "}
                              {new Date(lastTimestamp.end).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Checkpoint Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {averageTimeAtCheckpoints(trucks).map((avg, index) => {
            const checkpoint = [
              "Entry Gate",
              "Front Office",
              "Weigh Bridge",
              "Quality Control",
              "Material Handling",
            ][index];
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-gray-50 border border-gray-100"
              >
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  {checkpoint}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {Math.round(avg)}
                  </span>
                  <span className="text-sm text-gray-500">sec</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
