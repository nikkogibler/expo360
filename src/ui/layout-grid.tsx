"use client";
import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Card {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
}

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  return (
    <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-3 auto-rows-max">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            card.className,
            "relative bg-gray-900 overflow-hidden rounded-lg cursor-pointer h-60 md:h-80 w-full"
          )}
        >
          <div className="absolute inset-0">
            <Image
              src={card.thumbnail}
              alt="thumbnail"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>

          <div className="absolute inset-0 bg-black/40 flex items-end p-4 md:p-8">
            {card.content}
          </div>
        </div>
      ))}
    </div>
  );
};
