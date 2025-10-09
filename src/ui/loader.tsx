"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const LoaderOne = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
    >
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-3 h-3 rounded-full"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #2563EB, #EC4899)",
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const LoaderThree = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-md z-[100]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Gradient spinning loader */}
        <motion.div
          className="w-16 h-16 rounded-full"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #2563EB, #EC4899)",
            opacity: 0.9,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="w-full h-full rounded-full bg-white m-2" />
        </motion.div>
        
        {/* Loading text */}
        <motion.p
          className="text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, #8B5CF6, #2563EB, #EC4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Preparando imagen...
        </motion.p>
      </div>
    </div>
  );
};
