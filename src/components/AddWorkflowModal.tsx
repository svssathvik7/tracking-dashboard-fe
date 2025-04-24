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
import { Plus, X, Loader2 } from "lucide-react";
import api from "../utils/api";
import { toast } from "sonner";

interface AddWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Stage {
  id: string;
  name: string;
  stageNumber: number;
  start: Date | null;
  end: Date | null;
}

export default function AddWorkflowModal({
  isOpen,
  onClose,
}: AddWorkflowModalProps) {
  const [workflowName, setWorkflowName] = useState("");
  const [stages, setStages] = useState<Stage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addStage = () => {
    setStages([
      ...stages,
      {
        id: "",
        name: "",
        stageNumber: stages.length + 1,
        start: null,
        end: null,
      },
    ]);
  };

  const removeStage = (index: number) => {
    const newStages = stages.filter((_, i) => i !== index);
    // Update stage numbers
    newStages.forEach((stage, i) => {
      stage.stageNumber = i + 1;
    });
    setStages(newStages);
  };

  const updateStageName = (index: number, name: string) => {
    const newStages = [...stages];
    newStages[index].name = name;
    newStages[index].id = name + newStages[index].stageNumber;
    setStages(newStages);
  };

  const handleSubmit = async () => {
    if (!workflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }

    if (stages.length === 0) {
      toast.error("Please add at least one stage");
      return;
    }

    if (stages.some((stage) => !stage.name.trim())) {
      toast.error("Please fill in all stage names");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/workflows/create", {
        workflowName,
        stages,
      });
      toast.success(`Workflow "${workflowName}" has been created successfully`);
      setWorkflowName("");
      setStages([]);
      onClose();
    } catch (error) {
      console.error("Failed to create workflow:", error);
      toast.error("Failed to create workflow. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Add New Workflow
          </DialogTitle>
          <DialogDescription>
            Create a new workflow by adding stages
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Enter workflow name"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Stages</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStage}
                className="flex items-center gap-1 text-white"
              >
                <Plus className="h-4 w-4 text-white" />
                Add Stage
              </Button>
            </div>

            {stages.map((stage, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-8 text-white">
                      #{stage.stageNumber}
                    </span>
                    <Input
                      placeholder="Stage name"
                      value={stage.name}
                      onChange={(e) => updateStageName(index, e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStage(index)}
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
              "Create Workflow"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
