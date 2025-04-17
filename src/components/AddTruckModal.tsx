"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Loader2, Plus, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import api from "../utils/api";
import { toast } from "sonner";

interface AddTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DetailField {
  key: string;
  value: string;
}

export default function AddTruckModal({ isOpen, onClose }: AddTruckModalProps) {
  const [truckName, setTruckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState<DetailField[]>([]);

  const addDetailField = () => {
    setDetails([...details, { key: "", value: "" }]);
  };

  const removeDetailField = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const updateDetailField = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    setDetails(newDetails);
  };

  const handleSubmit = async () => {
    if (!truckName.trim()) {
      toast("Please enter a valid truck name");
      return;
    }

    const detailsObject = details.reduce((acc, { key, value }) => {
      if (key.trim()) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    setIsSubmitting(true);
    try {
      await api.post(`/track/add-truck`, {
        trackingNumber: truckName,
        details: detailsObject,
      });
      toast(`Truck ${truckName} has been created successfully`);
      setTruckName("");
      setDetails([]);
      onClose();
    } catch (error) {
      console.error("Failed to create truck:", error);
      toast("Failed to create truck. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Add New Truck
          </DialogTitle>
          <DialogDescription>
            Enter the truck details to create a new tracking entry
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="truck-name">Truck Name/ID</Label>
            <Input
              id="truck-name"
              type="text"
              value={truckName}
              onChange={(e) => setTruckName(e.target.value)}
              placeholder="Enter truck name or ID"
              className="w-full"
              autoComplete="off"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Additional Details</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDetailField}
                className="flex items-center gap-1 text-white hover:text-white"
              >
                <Plus className="h-4 w-4 text-white" />
                Add Field
              </Button>
            </div>

            {details.map((detail, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr,1fr,auto] gap-2 items-start"
              >
                <Input
                  placeholder="Key"
                  value={detail.key}
                  onChange={(e) =>
                    updateDetailField(index, "key", e.target.value)
                  }
                />
                <Input
                  placeholder="Value"
                  value={detail.value}
                  onChange={(e) =>
                    updateDetailField(index, "value", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDetailField(index)}
                  className="h-10 w-10"
                >
                  <X className="h-4 w-4 text-white" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="text-white hover:text-white"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Entry"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
