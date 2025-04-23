"use client";

import { useEffect, useState } from "react";
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
import { Users, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import api from "../utils/api";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

interface AddOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddOperatorModal({
  isOpen,
  onClose,
}: AddOperatorModalProps) {
  useEffect(() => {
    const fetch = async () => {
      const checkPoints = (await api.get("/track/get-all-checkpoints")).data;
      setCheckPoints(Array.isArray(checkPoints.data) ? checkPoints.data : []);
    };
    fetch();
  }, []);
  const [checkpoints, setCheckPoints] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    checkPointAssigned: [] as string[],
    role: "operator",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      toast("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users/create-operator", formData);
      toast(`Operator ${formData.name} has been created successfully`);
      setFormData({
        name: "",
        email: "",
        password: "",
        checkPointAssigned: [],
        role: "operator",
      });
      onClose();
    } catch (error) {
      console.error("Failed to create operator:", error);
      toast("Failed to create operator. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckpointToggle = (checkpoint: string) => {
    setFormData((prev) => ({
      ...prev,
      checkPointAssigned: prev.checkPointAssigned.includes(checkpoint)
        ? prev.checkPointAssigned.filter((cp) => cp !== checkpoint)
        : [...prev.checkPointAssigned, checkpoint],
    }));
  };

  const formatCheckpointName = (name: string) => {
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
            Add New Operator
          </DialogTitle>
          <DialogDescription>
            Enter the operator details to create a new account
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter operator name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter operator email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter operator password"
            />
          </div>
          <div className="grid gap-2">
            <Label>Assigned Checkpoints</Label>
            <div className="grid grid-cols-2 gap-2">
              {checkpoints.length != 0 &&
                checkpoints.map((checkpoint) => (
                  <div key={checkpoint} className="flex items-center space-x-2">
                    <Checkbox
                      id={checkpoint}
                      checked={formData.checkPointAssigned.includes(checkpoint)}
                      onCheckedChange={() => handleCheckpointToggle(checkpoint)}
                    />
                    <Label htmlFor={checkpoint} className="text-sm font-normal">
                      {formatCheckpointName(checkpoint)}
                    </Label>
                  </div>
                ))}
            </div>
            {formData.checkPointAssigned.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.checkPointAssigned.map((checkpoint) => (
                  <div
                    key={checkpoint}
                    className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    {formatCheckpointName(checkpoint)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            className="text-white"
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
              "Create Operator"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
