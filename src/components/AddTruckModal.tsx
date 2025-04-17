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
import { Truck, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import api from "../utils/api";
import { toast } from "sonner";

interface AddTruckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTruckModal({ isOpen, onClose }: AddTruckModalProps) {
  const [truckName, setTruckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!truckName.trim()) {
      toast("Please enter a valid truck name");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/track/add-truck/${truckName}`);
      toast(`Truck ${truckName} has been created successfully`);
      setTruckName("");
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
