"use client";

import { useForm } from "react-hook-form";
import type { Banner } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploader } from "./ImageUploader";

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: Partial<Banner>) => Promise<void>;
  onCancel: () => void;
}

export function BannerForm({ banner, onSubmit, onCancel }: BannerFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: banner || { title: "", subtitle: "", image_url: "", link_url: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input {...register("title")} className="mt-1" />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Input {...register("subtitle")} className="mt-1" />
      </div>
      <div>
        <Label>Image URL</Label>
        <Input {...register("image_url", { required: true })} className="mt-1" value={watch("image_url")} />
        <div className="mt-2">
          <ImageUploader bucket="banners" onUpload={(url) => setValue("image_url", url)} />
        </div>
      </div>
      <div>
        <Label>Link URL (optional)</Label>
        <Input {...register("link_url")} className="mt-1" />
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
