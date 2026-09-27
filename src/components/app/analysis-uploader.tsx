"use client";

import { useState } from "react";
import { FileSearch, Sparkles } from "lucide-react";
import { UploadZone } from "@/components/binix/upload-zone";
import { ProductStatusBanner } from "@/components/binix/product-status-banner";
import { Button } from "@/components/ui/button";

export function AnalysisUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [showState, setShowState] = useState(false);

  return (
    <div className="space-y-4">
      <UploadZone selectedFile={file} onFileSelect={(next) => { setFile(next); setShowState(false); }} onClear={() => { setFile(null); setShowState(false); }} />
      {file && (
        <div className="flex flex-col gap-3 rounded-card border border-border bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary"><FileSearch size={17} /></div>
            <div><div className="font-ui text-sm font-medium text-foreground">فایل آماده شروع تحلیل است</div><div className="mt-1 font-ui text-xs text-foreground-subtle">در نسخه فعلی پنل، موتور تحلیل واقعی هنوز فعال نشده است.</div></div>
          </div>
          <Button type="button" variant="ai" leadingIcon={<Sparkles size={15} />} onClick={() => setShowState(true)}>شروع تحلیل</Button>
        </div>
      )}
      {showState && <ProductStatusBanner tone="warning" title="تحلیل واقعی هنوز فعال نیست" description="آپلود و اعتبارسنجی فایل کار می‌کند، اما برای جلوگیری از نمایش نتیجه ساختگی، گزارش فقط بعد از اتصال موتور تحلیل تولید خواهد شد." />}
    </div>
  );
}
