import { useRef, useEffect } from "react";

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null); // The viewport container
  const contentRef = useRef<HTMLDivElement>(null); // The draggable content

  // Current offset (position) of the content
  const offset = useRef({ x: 0, y: 0 });

  // Whether the user is currently dragging
  const isDragging = useRef(false);

  // Last recorded pointer position (used to calculate dx/dy)
  const lastPos = useRef({ x: 0, y: 0 });

  // Current drag velocity (used for inertia)
  const velocity = useRef({ x: 0, y: 0 });

  // Reference to the inertia animation frame
  const animationFrame = useRef<number | null>(null);

  // Example steps/cards
  const steps = [
    { id: 1, title: "Card 1", height: 200 },
    { id: 2, title: "Card 2", height: 400 },
    { id: 3, title: "Card 3", height: 150 },
    { id: 4, title: "Card 4", height: 150 },
    { id: 5, title: "Card 5", height: 150 },
    { id: 6, title: "Card 6", height: 150 },
    { id: 7, title: "Card 7", height: 150 },
    { id: 8, title: "Card 8", height: 150 },
    { id: 9, title: "Card 9", height: 150 },
    { id: 10, title: "Card 10", height: 150 },
  ];

  // Basic layout metrics
  const cardWidth = 200;
  const gap = 20;
  const paddingX = 16 * 2; // left + right padding
  const totalWidth =
    steps.length * cardWidth + (steps.length - 1) * gap + paddingX;
  const tallestCard = Math.max(...steps.map((s) => s.height));

  // Updates the transform (applies current offset)
  const updateTransform = () => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`;
    }
  };

  // Inertia animation after releasing the mouse
  const animateMomentum = () => {
    const containerWidth =
      containerRef.current?.clientWidth || window.innerWidth;

    // Calculate limits for X and Y so the content never goes out of bounds
    const minX = Math.min(0, containerWidth - totalWidth);
    const minY = Math.min(0, window.innerHeight - tallestCard - 32);

    // Apply velocity to position
    offset.current.x = Math.max(
      minX,
      Math.min(0, offset.current.x + velocity.current.x),
    );
    offset.current.y = Math.max(
      minY,
      Math.min(0, offset.current.y + velocity.current.y),
    );

    // Apply friction to gradually slow down
    velocity.current.x *= 0.9;
    velocity.current.y *= 0.9;

    updateTransform();

    // Continue animating until velocity is almost 0
    if (
      Math.abs(velocity.current.x) > 0.5 ||
      Math.abs(velocity.current.y) > 0.5
    ) {
      animationFrame.current = requestAnimationFrame(animateMomentum);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // When user starts dragging
    const onPointerDown = (e: PointerEvent) => {
      // Cancel any ongoing inertia animation
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      isDragging.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 }; // reset velocity

      // Capture pointer so dragging continues even if pointer leaves the element
      el.setPointerCapture(e.pointerId);
    };

    // When user moves the pointer (dragging)
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;

      // Calculate movement since last frame
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      // Recalculate limits for X and Y
      const containerWidth =
        containerRef.current?.clientWidth || window.innerWidth;
      const minX = Math.min(0, containerWidth - totalWidth);
      const minY = Math.min(0, window.innerHeight - tallestCard - 32);

      // Update position while clamping to boundaries
      offset.current.x = Math.max(minX, Math.min(0, offset.current.x + dx));
      offset.current.y = Math.max(minY, Math.min(0, offset.current.y + dy));

      // Store velocity (used for inertia)
      velocity.current = { x: dx, y: dy };

      // Update last pointer position
      lastPos.current = { x: e.clientX, y: e.clientY };

      requestAnimationFrame(updateTransform);
    };

    // When user releases the pointer
    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      el.releasePointerCapture(e.pointerId);

      // Start inertia animation using the last velocity
      animationFrame.current = requestAnimationFrame(animateMomentum);
    };

    // Event listeners
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onPointerUp);

    // Cleanup listeners
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onPointerUp);
    };
  }, [totalWidth, tallestCard]);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen overflow-hidden bg-gray-100 touch-none cursor-grab"
    >
      <div
        ref={contentRef}
        className="transform-origin-top-left flex p-4"
        style={{
          gap: `${gap}px`,
        }}
      >
        {steps.map((s) => (
          <div
            className=" bg-white rounded-lg shadow-md flex items-center justify-center font-medium text-lg"
            key={s.id}
            style={{
              height: s.height,
              width: cardWidth,
              minWidth: cardWidth,
              userSelect: "none", // Prevents text selection during drag
              pointerEvents: "none", // Prevents pointer interactions on cards
            }}
          >
            {s.title}
          </div>
        ))}
      </div>
    </div>
  );
}
