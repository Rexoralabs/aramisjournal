import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { startDesktopDownload } from "@/lib/ultra";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export async function runDownload() {
  const ok = await startDesktopDownload();
  if (ok) toast.success("Your download has begun.");
  else toast("The desktop edition is being prepared — we'll have it ready shortly.");
}

export function DownloadButton({ className, variant = "glass", label = "Download" }: { className?: string; variant?: ButtonProps["variant"]; label?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size="pill"
        className={className}
        onClick={() => (user ? runDownload() : setOpen(true))}
      >
        <Icon icon="ph:download-simple" className="h-4 w-4" />
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-3xl font-normal">Reserved for members</DialogTitle>
            <DialogDescription className="font-emphasis text-lg">
              Aramis for Windows is available to anyone with an Ultra Account. Sign in with your
              name@ultra.co and your download begins immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ink" size="pill" onClick={() => navigate("/auth?intent=download")}>
              Continue with Ultra
              <Icon icon="ph:arrow-right" className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
