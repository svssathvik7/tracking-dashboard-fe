import { useState } from "react";
import api from "../utils/api";

interface AddTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTruckModal({ isOpen, onClose }: AddTruckModalProps) {
  const [truckName, setTruckName] = useState("");

  const handleSubmit = async () => {
    if (!truckName.trim()) {
      alert("Please enter a truck name");
      return;
    }

    try {
      await api.post(`/track/add-truck/${truckName}`);
      setTruckName("");
      onClose();
    } catch (error) {
      console.error("Failed to create truck:", error);
      alert("Failed to create truck. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Truck</h2>
        <input
          type="text"
          value={truckName}
          onChange={(e) => setTruckName(e.target.value)}
          placeholder="Enter truck name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black mb-4"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Create Entry
          </button>
        </div>
      </div>
    </div>
  );
}
