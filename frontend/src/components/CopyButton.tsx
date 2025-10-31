import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyButtonProps {
  textToCopy: string;
  size?: number;
  className?: string;
  tooltipText?: string;
  successText?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  size = 16,
  className = "",
  tooltipText = "Copy to clipboard",
  successText = "Copied!",
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-auto w-auto p-1 hover:bg-muted rounded-full ${className}`}
            onClick={handleCopy}
          >
            {copied ? (
              <Check size={size} className="text-green-500" />
            ) : (
              <Copy size={size} className="text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? successText : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton;
