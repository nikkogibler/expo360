// ...existing code...

// Add burger menu animation CSS for overflow and transform origin
const burgerMenuStyles = `
  .burgerIcon {
    overflow: visible;
  }
  .burgerIcon > rect {
    transform-origin: center;
    transform-box: fill-box;
  }
`;

import { animated, config, useSprings } from "react-spring";
import { memo } from "react";

const linearConfig = {
  duration: 100
};

const topRect = async (next: any, isOpen: boolean) => {
  // Stage 1
  await next({
    transform: isOpen
      ? "translate(0px, 9px) rotate(0deg)"
      : "translate(0px, 9px) rotate(0deg)",
    config: linearConfig
  });

  // Stage 2
  await next({
    transform: isOpen
      ? "translate(0px, 9px) rotate(-45deg)"
      : "translate(0px, 0px) rotate(0deg)",
    config: config.wobbly
  });
};

const mediumRect = async (next: any, isOpen: boolean) => {
  // Medium rect has only Stage 1
  await next({
    opacity: isOpen ? 0 : 1,
    // Make delay when isOpen changed from true to false
    delay: !isOpen && 100,
    config: linearConfig
  });
};

const bottomRect = async (next: any, isOpen: boolean) => {
  // Stage 1
  await next({
    transform: isOpen
      ? "translate(0px, -9px) rotate(0deg)"
      : "translate(0px, -9px) rotate(0deg)",
    config: linearConfig
  });

  // Stage 2
  await next({
    transform: isOpen
      ? "translate(0px, -9px) rotate(-135deg)"
      : "translate(0px, 0px) rotate(0deg)",
    config: config.wobbly
  });
};

const rects = [topRect, mediumRect, bottomRect];

interface BurgerMenuProps {
  isOpen: boolean;
  onClick: () => void;
}

const BurgerMenu = memo(({ isOpen, onClick }: BurgerMenuProps) => {
  const [springs] = useSprings(
    3,
    (index) => ({
      to: async (next) => {
        await rects[index](next, isOpen);
      }
    }),
    [isOpen]
  );

  return (
    <>
      <style>{burgerMenuStyles}</style>
      <svg
        onClick={onClick}
        width="24"
        height="20"
        viewBox="0 0 24 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="burgerIcon"
        style={{ cursor: "pointer" }}
      >
        {springs.map((props, index) => (
          <animated.rect
            key={index}
            y={index * 9}
            width="24"
            height="2"
            rx="1"
            fill={"#4F4F4F"}
            style={props}
          />
        ))}
      </svg>
    </>
  );
});

export default BurgerMenu;
