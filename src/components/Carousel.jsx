import { useEffect, useRef, useState } from "react";

export default function Carousel({ children, slidesPerView = 2, autoplay = 5000, gap = 20 }) {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(slidesPerView);
  const trackRef = useRef(null);

  const count = Array.isArray(children) ? children.length : 1;
  const maxIndex = Math.max(0, count - perView);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const pv = w <= 760 ? 1 : w <= 1080 ? (slidesPerView > 1 ? 2 : 1) : slidesPerView;
      setPerView(pv);
      setIndex((i) => Math.min(i, Math.max(0, count - pv)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [slidesPerView, count]);

  useEffect(() => {
    if (!autoplay || maxIndex === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, autoplay);
    return () => clearInterval(id);
  }, [autoplay, maxIndex]);

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        ref={trackRef}
        style={{
          transform: `translateX(-${index * (100 / perView)}%)`,
        }}
      >
        {Array.isArray(children) &&
          children.map((child, i) => (
            <div key={i} className="carousel-slide" style={{ width: `${100 / perView}%`, padding: `0 ${gap / 2}px` }}>
              {child}
            </div>
          ))}
      </div>
    </div>
  );
}
