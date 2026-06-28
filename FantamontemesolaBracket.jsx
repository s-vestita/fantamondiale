import React from "react";
import { Trophy } from "lucide-react";
import { natFlagUrl } from "./fantamondialeLogic.js";
import { BRACKET_LAYOUT, feedsInto } from "./tournamentBracket.js";
import { slotLabel, teamNatCode } from "./fantamontemesolaLogic.js";

function compactSlotLabel(slot, thirdGroup) {
  if (!slot) return "—";
  if (slot.t === "w") return `1º ${slot.g}`;
  if (slot.t === "ru") return `2º ${slot.g}`;
  if (slot.t === "3") {
    if (thirdGroup) return `3º ${thirdGroup}`;
    return `Migl. 3ª ${slot.elig.join("/")}`;
  }
  return "";
}

function BracketCell({ team, slot, r32, align }) {
  const isThird = slot?.t === "3";
  const pending = isThird && !r32?.thirdGroup && !team;
  const label = team || compactSlotLabel(slot, isThird ? r32?.thirdGroup : null) || "—";
  const filled = !!team;

  return (
    <div
      className={
        "wm-fmt-bk-cell"
        + (filled ? " filled" : "")
        + (pending ? " pending" : "")
        + (!filled && !pending ? " slot" : "")
        + (align === "right" ? " right" : "")
      }
      title={slot && !team ? slotLabel(slot, isThird ? r32?.thirdGroup : null) : team || ""}
    >
      {filled && teamNatCode(team) && (
        <img className="wm-flag" src={natFlagUrl(teamNatCode(team), 16)} alt="" loading="lazy" />
      )}
      <span className="wm-fmt-bk-txt">{label}</span>
    </div>
  );
}

function CompactPair({ m, matchById, isR32, align }) {
  const r32 = isR32 ? matchById.get(m) : null;
  const feed = feedsInto[m];

  if (r32) {
    return (
      <div className={"wm-fmt-bk-pair" + (align === "right" ? " right" : "")}>
        <BracketCell team={r32.a} slot={r32.slotA} r32={r32} align={align} />
        <BracketCell team={r32.b} slot={r32.slotB} r32={r32} align={align} />
      </div>
    );
  }

  return (
    <div className={"wm-fmt-bk-pair ghost" + (align === "right" ? " right" : "")}>
      <div className="wm-fmt-bk-cell slot"><span className="wm-fmt-bk-txt">—</span></div>
      <div className="wm-fmt-bk-cell slot"><span className="wm-fmt-bk-txt">—</span></div>
      {feed && <span className="wm-fmt-bk-mini">M{m}</span>}
    </div>
  );
}

function BracketRoundCol({ ids, matchById, isR32, align, tier, showDivider }) {
  return (
    <div className={"wm-fmt-bk-col t" + tier + " " + align}>
      <div className="wm-fmt-bk-col-inner">
        {ids.map((m, i) => (
          <React.Fragment key={m}>
            {showDivider && i === 4 && <div className="wm-fmt-bk-divider" aria-hidden />}
            <div className="wm-fmt-bk-slot-wrap">
              <CompactPair m={m} matchById={matchById} isR32={isR32} align={align} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function BracketHalf({ side, matchById }) {
  const layout = BRACKET_LAYOUT[side];
  const align = side;
  const rounds = [
    { key: "r32", ids: layout.r32, isR32: true, tier: 0 },
    { key: "ott", ids: layout.ott, isR32: false, tier: 1 },
    { key: "quart", ids: layout.quart, isR32: false, tier: 2 },
    { key: "semi", ids: layout.semi, isR32: false, tier: 3 },
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
            matchById={matchById}
            isR32={r.isR32}
            align={align}
            tier={r.tier}
            showDivider={r.isR32}
          />
        ))}
      </div>
    </div>
  );
}

export default function FantamontemesolaBracket({ matchById, drawn }) {
  return (
    <div className="wm-fmt-bk-wrap">
      <div className="wm-fmt-bk-banner">
        <div className="wm-fmt-bk-banner-t">Fantamontemesola</div>
        <div className="wm-fmt-bk-banner-s">Tabellone sedicesimi → finale</div>
        <div className="wm-fmt-bk-legend">
          <span className="wm-fmt-bk-leg filled">Squadra qualificata</span>
          <span className="wm-fmt-bk-leg pending">Slot terza da sorteggiare</span>
          <span className="wm-fmt-bk-leg slot">Posto da definire</span>
        </div>
      </div>

      {!drawn && (
        <div className="wm-note wm-fmt-bk-note">Premi <b>Sorteggia</b> per completare gli slot Migl. 3ª.</div>
      )}

      <div className="wm-fmt-bk-scaler">
        <div className="wm-fmt-bk-tree">
          <BracketHalf side="left" matchById={matchById} />

          <div className="wm-fmt-bk-mid">
            <Trophy size={16} color="var(--gold)" />
            <span className="wm-fmt-bk-mid-t">Finale</span>
            <CompactPair m={BRACKET_LAYOUT.final} matchById={matchById} isR32={false} align="left" />
            <span className="wm-fmt-bk-mid-m">M104</span>
          </div>

          <BracketHalf side="right" matchById={matchById} />
        </div>
      </div>
    </div>
  );
}
