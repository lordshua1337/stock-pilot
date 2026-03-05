"use client";

import { motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

interface CopilotTriggerProps {
  readonly isOpen: boolean;
  readonly onClick: () => void;
}

export function CopilotTrigger({ isOpen, onClick }: CopilotTriggerProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-green text-black flex items-center justify-center shadow-lg shadow-green/20 hover:shadow-green/40 hover:scale-105 transition-all"
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "Close AI Copilot" : "Open AI Copilot"}
    >
      {isOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <MessageSquare className="w-5 h-5" />
      )}
    </motion.button>
  );
}
