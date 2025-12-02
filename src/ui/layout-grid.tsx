"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Card {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
}

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-3 auto-rows-max">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          onClick={() => setSelected(card.id)}
          className={cn(
            card.className,
            "relative bg-white overflow-hidden rounded-lg cursor-pointer h-60 md:h-80 w-full"
          )}
          layoutId={`card-${card.id}`}
        >
          <motion.div
            className="absolute inset-0"
            layoutId={`bg-${card.id}`}
          >
            <img
              src={card.thumbnail}
              alt="thumbnail"
              className="h-full w-full object-cover"
            />
          </motion.div>

          <motion.div
            className="absolute inset-0 bg-black/40 flex items-end p-4 md:p-8"
            layoutId={`overlay-${card.id}`}
          >
            {card.content}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};
