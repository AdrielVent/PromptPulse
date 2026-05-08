import { Check, Copy } from "lucide-react";
import { useState } from "react";
import Button from "./Button";

interface CopyButtonProps {
  value: string;
  label?: string;
}

export default function CopyButton({ value, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const copy = async () => {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copiedWithFallback = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (copiedWithFallback) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      } else {
        setFailed(true);
        window.setTimeout(() => setFailed(false), 1800);
      }
    }
  };

  return (
    <Button icon={copied ? <Check size={16} /> : <Copy size={16} />} onClick={copy} variant="secondary">
      {copied ? "Copied" : failed ? "Copy unavailable" : label}
    </Button>
  );
}
