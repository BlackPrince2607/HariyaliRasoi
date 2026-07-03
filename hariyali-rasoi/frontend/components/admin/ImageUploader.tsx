"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { uploadImage } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploaderProps {
  bucket?: string;
  onUpload: (url: string) => void;
}

export function ImageUploader({ bucket = "menu", onUpload }: ImageUploaderProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { url } = await uploadImage(file, bucket);
      onUpload(url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <label>
      <input type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={loading} />
      <Button type="button" variant="outline" disabled={loading} asChild>
        <span>
          <Upload className="h-4 w-4" />
          {loading ? "Uploading..." : "Upload Image"}
        </span>
      </Button>
    </label>
  );
}
