"use client";

import { useRef, useState } from "react";
import { Upload, Database } from "lucide-react";
import { importDefaultMenuSeed, importMenuFile } from "@/lib/api/menu";
import type { MenuImportResult } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface MenuBulkImportProps {
  onComplete: () => void;
}

export function MenuBulkImport({ onComplete }: MenuBulkImportProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<MenuImportResult | null>(null);

  const handleResult = (result: MenuImportResult) => {
    setLastResult(result);
    toast.success(
      `Imported ${result.items_created} new items, updated ${result.items_updated}`
    );
    onComplete();
  };

  const handleSeedImport = async () => {
    setLoading(true);
    try {
      const result = await importDefaultMenuSeed(replaceExisting);
      handleResult(result);
    } catch {
      toast.error("Failed to import production menu seed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileImport = async (file: File) => {
    setLoading(true);
    try {
      const result = await importMenuFile(file, replaceExisting);
      handleResult(result);
    } catch {
      toast.error("Failed to import menu file");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-brand-gold/40 bg-brand-cream/40 p-5">
      <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-brand-charcoal">
        Bulk Menu Import
      </h2>
      <p className="mt-1 text-sm text-brand-muted">
        Load the Hariyali Rasoi production menu or upload a JSON file with categories and items.
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-brand-gold/35 bg-brand-surface p-3">
        <Switch
          id="replace-existing"
          checked={replaceExisting}
          onCheckedChange={setReplaceExisting}
        />
        <Label htmlFor="replace-existing" className="text-sm">
          Replace existing menu (deletes all current categories and items first)
        </Label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={loading}
          onClick={handleSeedImport}
        >
          <Database className="mr-2 h-4 w-4" />
          Import Production Seed
        </Button>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload JSON File
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileImport(file);
          }}
        />
      </div>

      {lastResult && (
        <p className="mt-3 text-xs text-brand-muted">
          Last import: {lastResult.categories_created} categories created,{" "}
          {lastResult.categories_updated} updated, {lastResult.items_created} items created,{" "}
          {lastResult.items_updated} updated ({lastResult.total_items} total in file)
        </p>
      )}
    </div>
  );
}
