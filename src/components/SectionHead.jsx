import Reveal from "./Reveal";

export default function SectionHead({ tag, title, text, center = false, row = false, action }) {
  if (row) {
    return (
      <div className="sec-head--row">
        <div className="sec-head">
          <span className="sec-tag">{tag}</span>
          <h2 className="sec-title">{title}</h2>
          {text && <p>{text}</p>}
        </div>
        {action}
      </div>
    );
  }
  return (
    <Reveal className={center ? "sec-head sec-head--center" : "sec-head"}>
      <span className="sec-tag">{tag}</span>
      <h2 className="sec-title">{title}</h2>
      {text && <p>{text}</p>}
    </Reveal>
  );
}
