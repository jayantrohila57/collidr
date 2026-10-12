"use client";

import { variableKeySchema } from "@env-manager/api/validation";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AddVariableDialogProps {
  onConfirm: (data: { key: string; value: string }) => Promise<void>;
  isPending: boolean;
}

export function AddVariableDialog({
  onConfirm,
  isPending,
}: AddVariableDialogProps) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateKey = (rawKey: string) => {
    const result = variableKeySchema.safeParse(rawKey);
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid key";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keyError = validateKey(key);
    if (keyError) {
      setError(keyError);
      return;
    }
    setError(null);
    await onConfirm({ key: key.trim().toUpperCase(), value });
    setOpen(false);
    setKey("");
    setValue("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setKey("");
          setValue("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Variable
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Variable</DialogTitle>
          <DialogDescription>Add a new environment variable.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="var-key">Key</Label>
              <Input
                id="var-key"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (error) setError(validateKey(e.target.value));
                }}
                placeholder="DATABASE_URL"
                className="font-mono"
                aria-invalid={Boolean(error)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="var-value">Value</Label>
              <Textarea
                id="var-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="your-value-here"
                rows={4}
                className="max-h-[300px] min-h-[6rem] overflow-y-auto break-all font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
