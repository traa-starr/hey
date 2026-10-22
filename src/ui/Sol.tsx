// sol: a small dawn-light companion. it breathes, floats and blinks; its mood changes its face.
import { useId } from "react";

export type Mood = "calm" | "happy" | "curious" | "sleepy";

const EYES: Record<Mood, React.ReactNode> = {
  calm: <g className="lid"><ellipse cx="47" cy="66" rx="4.6" ry="6.2" /><ellipse cx="73" cy="66" rx="4.6" ry="6.2" /></g>,
  happy: <path d="M41 68q6-8 12 0M67 68q6-8 12 0" fill="none" strokeWidth="4.5" strokeLinecap="round" />,
  curious: <g className="lid"><ellipse cx="47" cy="66" rx="5" ry="7" /><ellipse cx="74" cy="64" rx="6.5" ry="8.5" /></g>,
  sleepy: <path d="M41 68h12M67 68h12" fill="none" strokeWidth="4.5" strokeLinecap="round" />
};
const MOUTH: Record<Mood, React.ReactNode> = {
  calm: <path d="M54.5 79q5.5 5 11 0" fill="none" strokeWidth="3.2" strokeLinecap="round" />,
  happy: <path d="M54 80q6 6 12 0" fill="none" strokeWidth="3.5" strokeLinecap="round" />,
  curious: <circle cx="60" cy="81" r="2.8" />,
  sleepy: <path d="M56 81q4 2 8 0" fill="none" strokeWidth="3" strokeLinecap="round" />
};

export function Sol({ mood = "calm" }: { mood?: Mood }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className="sol" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}g`} cx=".5" cy=".55" r=".5">
          <stop offset="0" stopColor="#ffd27a" stopOpacity=".7" /><stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd978" /><stop offset=".55" stopColor="#ffa45e" /><stop offset="1" stopColor="#ff6f5b" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="68" r="58" fill={`url(#${id}g)`} />
      <g className="floatg">
        <g className="bodyg">
          <path d="M60 24c24 0 40 18 40 42 0 22-17 36-40 36S20 88 20 66c0-24 16-42 40-42z" fill={`url(#${id}b)`} />
          <ellipse cx="45" cy="42" rx="12" ry="7" fill="#fff" opacity=".38" transform="rotate(-24 45 42)" />
          <ellipse cx="38" cy="78" rx="6" ry="3.5" fill="#ff5a7a" opacity=".22" />
          <ellipse cx="82" cy="78" rx="6" ry="3.5" fill="#ff5a7a" opacity=".22" />
          <g fill="#2a1d4a" stroke="#2a1d4a">{EYES[mood]}{MOUTH[mood]}</g>
        </g>
      </g>
    </svg>
  );
}
