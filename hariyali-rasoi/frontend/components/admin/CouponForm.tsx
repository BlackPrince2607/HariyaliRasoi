"use client";

import { useForm } from "react-hook-form";
import type { Coupon } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CouponFormProps {
  coupon?: Coupon;
  onSubmit: (data: Partial<Coupon>) => Promise<void>;
  onCancel: () => void;
}

export function CouponForm({ coupon, onSubmit, onCancel }: CouponFormProps) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: coupon || { code: "", type: "percentage", value: 10, min_order_amount: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Code</Label>
        <Input {...register("code", { required: true })} className="mt-1" placeholder="WELCOME10" />
      </div>
      <div>
        <Label>Type</Label>
        <Select defaultValue={coupon?.type || "percentage"} onValueChange={(v) => setValue("type", v as "percentage" | "fixed")}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Value</Label>
          <Input type="number" {...register("value", { valueAsNumber: true })} className="mt-1" />
        </div>
        <div>
          <Label>Min Order (₹)</Label>
          <Input type="number" {...register("min_order_amount", { valueAsNumber: true })} className="mt-1" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
