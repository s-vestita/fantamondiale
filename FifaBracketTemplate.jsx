import React, { useMemo } from "react";
import { Trophy } from "lucide-react";
import { BRACKET_LAYOUT, R32, LATER, slotCodeShort, r32PairLabel } from "./tournamentBracket.js";

function CodeCell({ slot, align }) {
  const isThird = slot?.t === "3";
  const code = slotCodeShort(slot, null);
  return (
    <div
      className={
        "wm-fmt-bk-cell fifa-code"
        + (isThird ? " pending" : "")
        + (align === "right" ? " right" : "")
      }
    >
      <span className="wm-fmt-bk-txt">{code}</span>
    </div>
  );
}

function R32Pair({ r, align }) {
  return (
    <div className={"wm-fmt-bk-pair wm-fifa-bk-r32" + (align === "right" ? " right" : "")}>
      <div className="wm-fifa-bk-pair-lbl">{r32PairLabel(r)}</div>
      <CodeCell slot={r.a} align={align} />
      <CodeCell slot={r.b} align={align} />
      <span className="wm-fmt-bk-mini">M{r.m}</span>
    </div>
  );
}

function GhostPair({ m, align }) {
  const feeders = LATER[m];
  const a = feeders ? `V${feeders[0]}` : "—";
  const b = feeders ? `V${feeders[1]}` : "—";
  return (
    <div className={"wm-fmt-bk-pair ghost wm-fifa-bk-ghost" + (align === "right" ? " right" : "")}>
      <div className="wm-fmt-bk-cell slot">
        <span className="wm-fmt-bk-txt">{a}</span>
      </div>
      <div className="wm-fmt-bk-cell slot">
        <span className="wm-fmt-bk-txt">{b}</span>
      </div>
      <span className="wm-fmt-bk-mini">M{m}</span>
    </div>
  );
}

function BracketRoundCol({ ids, r32ByM, align, tier, showDivider }) {
  return (
    <div className={"wm-fmt-bk-col t" + tier + " " + align}>
      <div className="wm-fmt-bk-col-inner">
        {ids.map((m, i) => (
          <React.Fragment key={m}>
            {showDivider && i === 4 && <div className="wm-fmt-bk-divider" aria-hidden />}
            <div className="wm-fmt-bk-slot-wrap">
              {r32ByM.has(m)
                ? <R32Pair r={r32ByM.get(m)} align={align} />
                : <GhostPair m={m} align={align} />}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BracketHalf({ side, r32ByM }) {
  const layout = BRACKET_LAYOUT[side];
  const align = side;
  const rounds = [
    { key: "r32", ids: layout.r32, tier: 0, isR32: true },
    { key: "ott", ids: layout.ott, tier: 1, isR32: false },
    { key: "quart", ids: layout.quart, tier: 2, isR32: false },
    { key: "semi", ids: layout.semi, tier: 3, isR32: false },
  ];
  const cols = side === "left" ? rounds : [...rounds].reverse();

  return (
    <div className={"wm-fmt-bk-half " + side}>
      <div className="wm-fmt-bk-half-title">{side === "left" ? "Parte sinistra" : "Parte destra"}</div>
      <div className="wm-fmt-bk-half-cols">
        {cols.map((r) => (
          <BracketRoundCol
            key={r.key}
            ids={r.ids}
            r32ByM={r32ByM}
            align={align}
            tier={r.tier}
            showDivider={r.isR32}
          />
        ))}
      </div>
    </div>
  );
}

export default function FifaBracketTemplate() {
  const r32ByM = useMemo(() => new Map(R32.map((r) => [r.m, r])), []);

  return (
    <div className="wm-panel wm-fmt-bk-panel">
      <div className="wm-fmt-bk-wrap wm-fifa-bk">
        <div className="wm-fmt-bk-banner">
          <div className="wm-fmt-bk-banner-t">Tabellone FIFA</div>
          <div className="wm-fmt-bk-banner-s">Schema ufficiale · sedicesimi → finale</div>
          <div className="wm-fmt-bk-legend">
            <span className="wm-fmt-bk-leg slot"><b style={{ color: "var(--gold)" }}>1X</b> 1º · <b style={{ color: "var(--gold)" }}>2X</b> 2º</span>
            <span className="wm-fmt-bk-leg pending"><b style={{ color: "var(--gold)" }}>3·ABC…</b> slot terza</span>
            <span className="wm-fmt-bk-leg slot"><b>V73</b> vincitore M73</span>
          </div>
        </div>

        <div className="wm-fmt-bk-scaler">
          <div className="wm-fmt-bk-tree">
            <BracketHalf side="left" r32ByM={r32ByM} />

            <div className="wm-fmt-bk-mid">
              <Trophy size={16} color="var(--gold)" />
              <span className="wm-fmt-bk-mid-t">Finale</span>
              <GhostPair m={BRACKET_LAYOUT.final} align="left" />
              <span className="wm-fmt-bk-mid-m">M104</span>
            </div>

            <BracketHalf side="right" r32ByM={r32ByM} />
          </div>
        </div>
      </div>
    </div>
  );
}
