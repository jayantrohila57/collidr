"use client";

import { variableKeySchema } from "@env-manager/api/validation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditVariableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variable: {
    id: string;
    key: string;
    value?: string;
  };
  isLoadingValue?: boolean;
  onConfirm: (data: {
    id: string;
    key: string;
    value: string;
  }) => Promise<void>;
  isPending: boolean;
}

export function EditVariableDialog({
  open,
  onOpenChange,
  variable,
  isLoadingValue = false,
  onConfirm,
  isPending,
}: EditVariableDialogProps) {
  const [key, setKey] = useState(variable.key);
  const [value, setValue] = useState(variable.value || "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setKey(variable.key);
      setValue(variable.value ?? "");
      setError(null);
    }
  }, [open, variable.key, variable.value]);

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
    await onConfirm({
      id: variable.id,
      key: key.trim().toUpperCase(),
      value,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Variable</DialogTitle>
          <DialogDescription>
            Update the key and value. The current value is loaded when you open
            this dialog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-key">Key</Label>
              <Input
                id="edit-key"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  if (error) setError(validateKey(e.target.value));
                }}
                placeholder="DATABASE_URL"
                className="font-mono"
                aria-invalid={Boolean(error)}
              />
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value</Label>
              {isLoadingValue ? (
                <p className="text-muted-foreground text-sm">
                  Loading current value…
                </p>
              ) : (
                <Textarea
                  id="edit-value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="your-value-here"
                  rows={3}
                  className="wrap-anywhere max-h-[300px] min-h-[6rem] overflow-y-auto font-mono"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isLoadingValue}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
