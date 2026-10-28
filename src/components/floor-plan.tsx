import { cn } from "@/lib/utils";
import type { Occupancy, SpaceItem } from "@/lib/types";

type Props = {
  spaces: SpaceItem[];
  occupancy: Occupancy[];
  selectedId: number | null;
  onSelect: (space: SpaceItem) => void;
  kind: "mesa" | "salao";
};

const MESA_LAYOUT: { code: string; x: number; y: number; w: number; h: number }[] = [
  { code: "C1", x: 40, y: 28, w: 150, h: 72 },
  { code: "C2", x: 210, y: 28, w: 150, h: 72 },
  { code: "M1", x: 40, y: 124, w: 150, h: 56 },
  { code: "M2", x: 210, y: 124, w: 150, h: 56 },
  { code: "B1", x: 40, y: 210, w: 110, h: 200 },
  { code: "P1", x: 170, y: 230, w: 90, h: 70 },
  { code: "P2", x: 270, y: 230, w: 90, h: 70 },
  { code: "P3", x: 220, y: 314, w: 90, h: 70 },
];

const SALAO_LAYOUT: { code: string; x: number; y: number; w: number; h: number }[] = [
  { code: "S1", x: 36, y: 36, w: 328, h: 220 },
  { code: "S2", x: 36, y: 272, w: 328, h: 120 },
];

export function FloorPlan({ spaces, occupancy, selectedId, onSelect, kind }: Props) {
  const layout = kind === "salao" ? SALAO_LAYOUT : MESA_LAYOUT;
  const byCode = new Map(spaces.map((s) => [s.code, s]));
  const occById = new Map(occupancy.map((o) => [o.spaceId, o.status]));

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface p-3 md:p-5">
      <svg
        viewBox="0 0 400 430"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={kind === "salao" ? "Planta do salão" : "Planta da casa"}
      >
        <rect x="8" y="8" width="384" height="414" rx="18" fill="#0c0c0c" stroke="rgba(243,238,230,0.12)" />
        {kind === "mesa" ? (
          <>
            <text x="200" y="22" textAnchor="middle" fill="#6f6a64" fontSize="8" letterSpacing="2">
              CAMAROTES
            </text>
            <rect x="160" y="210" width="200" height="190" rx="10" fill="#111" stroke="rgba(243,238,230,0.08)" />
            <text x="260" y="408" textAnchor="middle" fill="#6f6a64" fontSize="8" letterSpacing="2">
              PISTA
            </text>
            <rect x="238" y="372" width="44" height="14" rx="2" fill="#181818" />
            <text x="260" y="382" textAnchor="middle" fill="#9a948c" fontSize="7">
              DJ
            </text>
            <text x="95" y="400" textAnchor="middle" fill="#6f6a64" fontSize="8" letterSpacing="2">
              BAR
            </text>
          </>
        ) : (
          <text x="200" y="24" textAnchor="middle" fill="#6f6a64" fontSize="8" letterSpacing="2">
            SALÃO DE EVENTOS
          </text>
        )}

        {layout.map((box) => {
          const space = byCode.get(box.code);
          if (!space) return null;
          const occ = occById.get(space.id);
          const selected = selectedId === space.id;
          const taken = Boolean(occ);
          return (
            <g
              key={space.code}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
              onClick={() => !taken && onSelect(space)}
              onKeyDown={(e) => {
                if (!taken && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelect(space);
                }
              }}
            >
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="10"
                fill={selected ? "#e8ddd0" : taken ? "#1c1c1c" : "#141414"}
                stroke={selected ? "#e8ddd0" : taken ? "rgba(243,238,230,0.08)" : "rgba(243,238,230,0.28)"}
                strokeWidth={selected ? 2 : 1}
              />
              <text
                x={box.x + box.w / 2}
                y={box.y + box.h / 2 - 4}
                textAnchor="middle"
                fontSize="12"
                fontFamily="Outfit, sans-serif"
                fill={selected ? "#0c0c0c" : taken ? "#6f6a64" : "#f3eee6"}
              >
                {space.code}
              </text>
              <text
                x={box.x + box.w / 2}
                y={box.y + box.h / 2 + 12}
                textAnchor="middle"
                fontSize="8"
                fill={selected ? "#0c0c0c" : "#9a948c"}
              >
                {taken ? "reservado" : `${space.capacity} pax`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap gap-4 px-2 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-2.5 rounded-sm border border-border-strong" />
          Livre
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-2.5 rounded-sm bg-elevated" />
          Reservado
        </span>
        <span className="inline-flex items-center gap-2">
          <i className="inline-block size-2.5 rounded-sm bg-accent" />
          Selecionado
        </span>
      </div>
    </div>
  );
}

export function SpaceMeta({
  space,
  className,
}: {
  space: SpaceItem;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      <p className="kicker">{space.zone}</p>
      <h3 className="mt-1 font-display text-3xl text-fg">
        {space.code} · {space.name}
      </h3>
      <p className="mt-2 text-sm text-muted">{space.description}</p>
    </div>
  );
}
