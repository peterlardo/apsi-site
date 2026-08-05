import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqList({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-wrap">
      {items.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? "open" : ""}`}>
          <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            <span className="faq-num">{i + 1}.</span>
            <span>{item.q}</span>
            <ChevronDown size={20} />
          </button>
          <div className="faq-a" style={{ maxHeight: open === i ? "240px" : "0" }}>
            <p>{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
