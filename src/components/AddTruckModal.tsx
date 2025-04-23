"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck, Loader2, Plus, X } from "lucide-react";
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

interface Stage {
  name: string;
  stageNumber: number;
  start: Date | null;
  end: Date | null;
}

interface Workflow {
  workflowName: string;
  stages: Stage[];
}

export default function AddTruckModal({ isOpen, onClose }: AddTruckModalProps) {
  const [truckName, setTruckName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [details, setDetails] = useState<DetailField[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = (await api.get("/workflows/get-all-workflows")).data;
        setWorkflows(response.data);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
        toast("Failed to load workflows");
      }
    };

    if (isOpen) {
      fetchWorkflows();
    }
  }, [isOpen]);

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

  const handleWorkflowSelect = (workflowName: string) => {
    const workflow = workflows.find((w) => w.workflowName === workflowName);
    setSelectedWorkflow(workflow || null);
  };

  const handleSubmit = async () => {
    if (!truckName.trim()) {
      toast("Please enter a valid truck name");
      return;
    }

    if (!selectedWorkflow) {
      toast("Please select a workflow");
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
        stages: selectedWorkflow.stages,
      });
      toast(`Truck ${truckName} has been created successfully`);
      setTruckName("");
      setDetails([]);
      setSelectedWorkflow(null);
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
      <DialogContent className="sm:max-w-md max-h-[80dvh] overflow-y-scroll">
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

          <div className="grid gap-2">
            <Label htmlFor="workflow">Select Workflow</Label>
            <Select onValueChange={handleWorkflowSelect}>
              <SelectTrigger>
                <SelectValue
                  className="text-white"
                  placeholder="Select a workflow"
                />
              </SelectTrigger>
              <SelectContent>
                {workflows.map((workflow) => (
                  <SelectItem
                    key={workflow.workflowName}
                    value={workflow.workflowName}
                  >
                    {workflow.workflowName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedWorkflow && (
            <div className="space-y-4">
              <Label>Workflow Stages</Label>
              <div className="space-y-2">
                {selectedWorkflow.stages.map((stage, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-secondary rounded-md"
                  >
                    <span className="text-sm font-medium">
                      Stage {stage.stageNumber}: {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
