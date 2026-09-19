// De zes schema's. Eén grammatica, één verhaal.
//
// De labels zijn copy en vallen onder de positioneringsregels: "systeem" met een
// object, geen cijferclaims, en de mens beslist. Wijzig ze niet zonder dat na te lopen.
//
// Elk schema heeft TWEE layouts: horizontaal vanaf md, verticaal daaronder.
// Reden: een keten van vijf stappen naast elkaar is op 375px onleesbaar, en juist
// daar komt het verkeer vandaan (LinkedIn op de telefoon). CSS kiest; beide staan
// in de DOM maar alleen de zichtbare krijgt een toegankelijke naam.

import { Schema, Node, Arrow, Item } from "./grammar";

type Keten = {
  bronnenLabel?: string;
  bronnen: string[];
  midden: string[];
  beslissing: string[];
  uitkomstLabel?: string;
  uitkomsten: string[];
  title: string;
  desc: string;
};

/* -------------------------------------------------------------------------- */
/* Horizontaal — vanaf md                                                      */
/* -------------------------------------------------------------------------- */

function KetenBreed({ k, extra }: { k: Keten; extra?: boolean }) {
  const H = extra ? 250 : 180;
  const midY = extra ? 96 : 84;

  return (
    <Schema viewBox={`0 0 720 ${H}`} title={k.title} desc={k.desc} className="hidden md:block">
      <Item x={0} y={midY - 40}>{k.bronnenLabel ?? "bronnen"}</Item>
      {k.bronnen.map((b, i) => (
        <Item key={b} x={0} y={midY - 16 + i * 17}>
          {b}
        </Item>
      ))}

      <Arrow from={[130, midY]} to={[172, midY]} />
      <Node x={182} y={midY - 28} w={160} h={56} label={k.midden} />
      <Arrow from={[342, midY]} to={[384, midY]} accent />
      <Node x={394} y={midY - 36} w={166} h={72} accent label={k.beslissing} />
      <Arrow from={[560, midY]} to={[602, midY]} />

      <Item x={612} y={midY - 40}>{k.uitkomstLabel ?? "resultaat"}</Item>
      {k.uitkomsten.map((u, i) => (
        <Item key={u} x={612} y={midY - 16 + i * 17}>
          {u}
        </Item>
      ))}

      {extra && (
        <>
          <path
            d={`M 477 ${midY + 36} L 477 ${midY + 92} L 262 ${midY + 92} L 262 ${midY + 28}`}
            fill="none"
            stroke="var(--color-rule-strong)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <path
            d={`M 257.5 ${midY + 32.5} L 262 ${midY + 28} L 266.5 ${midY + 32.5}`}
            fill="none"
            stroke="var(--color-rule-strong)"
            strokeWidth={1}
            strokeLinecap="round"
          />
          <text
            x={369}
            y={midY + 110}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize={11}
            fill="var(--color-ink-3)"
          >
            wat zij beslissen, leert het systeem
          </text>
        </>
      )}
    </Schema>
  );
}

/* -------------------------------------------------------------------------- */
/* Verticaal — onder md                                                        */
/* -------------------------------------------------------------------------- */

function KetenSmal({ k }: { k: Keten }) {
  const W = 320;
  const nodeW = 208;
  const x = (W - nodeW) / 2;

  const bronnenH = 22 + k.bronnen.length * 19;
  const yBronnen = 6;
  const yMidden = yBronnen + bronnenH + 34;
  const yBeslissing = yMidden + 56 + 34;
  const yUitkomst = yBeslissing + 76 + 34;
  const H = yUitkomst + 22 + k.uitkomsten.length * 19 + 10;

  return (
    <Schema viewBox={`0 0 ${W} ${H}`} title={k.title} desc={k.desc} className="md:hidden">
      <text
        x={W / 2}
        y={yBronnen + 12}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-ink-3)"
      >
        {k.bronnenLabel ?? "bronnen"}
      </text>
      {k.bronnen.map((b, i) => (
        <text
          key={b}
          x={W / 2}
          y={yBronnen + 32 + i * 19}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill="var(--color-ink-2)"
        >
          {b}
        </text>
      ))}

      <Arrow from={[W / 2, yBronnen + bronnenH + 4]} to={[W / 2, yMidden - 8]} />
      <Node x={x} y={yMidden} w={nodeW} h={56} label={k.midden} />
      <Arrow from={[W / 2, yMidden + 60]} to={[W / 2, yBeslissing - 8]} accent />
      <Node x={x} y={yBeslissing} w={nodeW} h={76} accent label={k.beslissing} />
      <Arrow from={[W / 2, yBeslissing + 80]} to={[W / 2, yUitkomst - 8]} />

      <text
        x={W / 2}
        y={yUitkomst + 12}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-ink-3)"
      >
        {k.uitkomstLabel ?? "resultaat"}
      </text>
      {k.uitkomsten.map((u, i) => (
        <text
          key={u}
          x={W / 2}
          y={yUitkomst + 32 + i * 19}
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fontSize={12}
          fill="var(--color-ink-2)"
        >
          {u}
        </text>
      ))}
    </Schema>
  );
}

function KetenSchema({ k, extra }: { k: Keten; extra?: boolean }) {
  return (
    <>
      <KetenBreed k={k} extra={extra} />
      <KetenSmal k={k} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Master — de loop. Home-hero, en de plek van het 3D-model.               */
/* -------------------------------------------------------------------------- */

export function SchemaLoop({ className }: { className?: string }) {
  return (
    <div className={className}>
      <KetenSchema
        extra
        k={{
          bronnen: ["mail", "Excel", "leveranciersdocs", "voorraad"],
          midden: ["systeem zoekt uit", "en zet klaar"],
          beslissing: ["jouw mensen", "controleren", "en beslissen"],
          uitkomsten: ["bestelling", "offerte", "antwoord", "belletje"],
          title: "Hoe het werkt: het systeem zoekt uit, jouw mensen beslissen",
          desc:
            "Uit mail, Excel, leveranciersdocumenten en voorraad haalt het systeem de gegevens bij elkaar en zet het werk klaar. Jouw mensen controleren en beslissen. Daarna volgt het resultaat: een bestelling, een offerte, een antwoord of een belletje. Wat zij beslissen, gaat het systeem weer in.",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 2-5. De vier diensten.                                                     */
/* -------------------------------------------------------------------------- */

export function SchemaLeads({ className }: { className?: string }) {
  return (
    <div className={className}>
      <KetenSchema
        k={{
          bronnen: ["vacaturesignalen", "bedrijfssignalen"],
          midden: ["zoeken en screenen", "'s nachts"],
          beslissing: ["team kiest", "wie er gebeld", "wordt"],
          uitkomsten: ["gesprek"],
          title: "Leads uitzoeken: het systeem screent, het team kiest",
          desc:
            "Uit vacature- en bedrijfssignalen zoekt en screent het systeem 's nachts. 's Ochtends staat de lijst klaar. Het team kiest zelf wie er gebeld wordt en voert het gesprek.",
        }}
      />
    </div>
  );
}

export function SchemaInkoop({ className }: { className?: string }) {
  return (
    <div className={className}>
      <KetenSchema
        k={{
          bronnen: ["voorraad", "verbruik", "levertijden", "prijzen"],
          midden: ["besteladvies", "opstellen"],
          beslissing: ["inkoper kijkt na", "en past aan"],
          uitkomsten: ["bestelling"],
          title: "Besteladvies: het systeem stelt voor, de inkoper beslist",
          desc:
            "Uit voorraad, verbruik, levertijden en prijzen stelt het systeem een besteladvies op. De inkoper kijkt het na en past aan waar hij het beter weet. Daarna gaat de bestelling eruit.",
        }}
      />
    </div>
  );
}

export function SchemaOffertes({ className }: { className?: string }) {
  return (
    <div className={className}>
      <KetenSchema
        k={{
          bronnen: ["aanvraag", "tarieven", "productinfo"],
          midden: ["concept", "klaarzetten"],
          beslissing: ["jij zet kennis", "en prijs erin"],
          uitkomsten: ["offerte eruit"],
          title: "Offertes klaarzetten: het concept staat er, jij zet de prijs",
          desc:
            "Uit de aanvraag, de tarieven en de productinformatie zet het systeem een concept klaar. Jij zet er je kennis en je prijs in. Daarna gaat de offerte de deur uit.",
        }}
      />
    </div>
  );
}

export function SchemaKennisbank({ className }: { className?: string }) {
  return (
    <div className={className}>
      <KetenSchema
        k={{
          bronnen: ["vraag", "handleidingen", "procedures"],
          midden: ["antwoord zoeken", "met bronverwijzing"],
          beslissing: ["medewerker", "controleert"],
          uitkomsten: ["antwoord"],
          title: "Vragen uit eigen documentatie: met bronverwijzing, altijd nagekeken",
          desc:
            "Een vraag komt binnen. Het systeem zoekt het antwoord in de eigen documenten en vermeldt erbij waar het vandaan komt. De medewerker controleert het concept en stuurt het antwoord naar de klant.",
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. Ervoor/erna. De hele case in één beeld.                                 */
/* -------------------------------------------------------------------------- */

export function SchemaVoorNa({
  stappen,
  systeemVanaf,
  beslissing,
  title,
  desc,
  className,
}: {
  stappen: string[];
  systeemVanaf: number;
  beslissing: number;
  title: string;
  desc: string;
  className?: string;
}) {
  const W = 720;
  const colW = W / stappen.length;
  const rowY = { voor: 54, na: 144 };

  const breed = (
    <Schema viewBox={`0 0 ${W} 210`} title={title} desc={desc} className="hidden md:block">
      {(["voor", "na"] as const).map((rij) => (
        <g key={rij}>
          <text
            x={0}
            y={rowY[rij] - 20}
            fontFamily="var(--font-mono)"
            fontSize={11}
            fill="var(--color-ink-3)"
          >
            {rij === "voor" ? "ervoor — alles met de hand" : "erna"}
          </text>
          {stappen.map((stap, i) => {
            const x = i * colW;
            const w = colW - 16;
            const isSysteem = rij === "na" && i >= systeemVanaf && i !== beslissing;
            const isBeslissing = rij === "na" && i === beslissing;
            return (
              <g key={stap}>
                <rect
                  x={x}
                  y={rowY[rij]}
                  width={w}
                  height={46}
                  rx={2}
                  fill={isBeslissing ? "var(--color-accent-wash)" : "transparent"}
                  stroke={
                    isBeslissing
                      ? "var(--color-accent)"
                      : isSysteem
                        ? "var(--color-rule-strong)"
                        : "var(--color-ink)"
                  }
                  strokeWidth={isBeslissing ? 1.5 : 1}
                  strokeDasharray={isSysteem ? "3 3" : undefined}
                />
                <text
                  x={x + w / 2}
                  y={rowY[rij] + 28}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                  fontSize={11}
                  fill={
                    isBeslissing
                      ? "var(--color-accent)"
                      : isSysteem
                        ? "var(--color-ink-3)"
                        : "var(--color-ink)"
                  }
                >
                  {stap}
                </text>
                {i < stappen.length - 1 && (
                  <Arrow from={[x + w + 1, rowY[rij] + 23]} to={[x + colW - 3, rowY[rij] + 23]} />
                )}
              </g>
            );
          })}
        </g>
      ))}
      <text
        x={0}
        y={rowY.na + 72}
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-ink-3)"
      >
        gestippeld = het systeem doet het · gekleurd = hier beslist een mens
      </text>
    </Schema>
  );

  // Smal: twee kolommen naast elkaar (ervoor | erna), stappen onder elkaar.
  // Zo blijft de vergelijking die de hele case draagt zichtbaar op één scherm.
  const SW = 320;
  const kolW = 138;
  const rijH = 42;
  const smalH = 40 + stappen.length * rijH + 30;
  const smal = (
    <Schema viewBox={`0 0 ${SW} ${smalH}`} title={title} desc={desc} className="md:hidden">
      <text x={0} y={14} fontFamily="var(--font-mono)" fontSize={11} fill="var(--color-ink-3)">
        ervoor
      </text>
      <text
        x={SW - kolW}
        y={14}
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-ink-3)"
      >
        erna
      </text>
      {stappen.map((stap, i) => {
        const y = 30 + i * rijH;
        const isSysteem = i >= systeemVanaf && i !== beslissing;
        const isBeslissing = i === beslissing;
        return (
          <g key={stap}>
            <rect
              x={0}
              y={y}
              width={kolW}
              height={34}
              rx={2}
              fill="transparent"
              stroke="var(--color-ink)"
              strokeWidth={1}
            />
            <text
              x={kolW / 2}
              y={y + 21}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10.5}
              fill="var(--color-ink)"
            >
              {stap}
            </text>
            <rect
              x={SW - kolW}
              y={y}
              width={kolW}
              height={34}
              rx={2}
              fill={isBeslissing ? "var(--color-accent-wash)" : "transparent"}
              stroke={
                isBeslissing
                  ? "var(--color-accent)"
                  : isSysteem
                    ? "var(--color-rule-strong)"
                    : "var(--color-ink)"
              }
              strokeWidth={isBeslissing ? 1.5 : 1}
              strokeDasharray={isSysteem ? "3 3" : undefined}
            />
            <text
              x={SW - kolW / 2}
              y={y + 21}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10.5}
              fill={
                isBeslissing
                  ? "var(--color-accent)"
                  : isSysteem
                    ? "var(--color-ink-3)"
                    : "var(--color-ink)"
              }
            >
              {stap}
            </text>
          </g>
        );
      })}
      <text
        x={0}
        y={smalH - 10}
        fontFamily="var(--font-mono)"
        fontSize={10}
        fill="var(--color-ink-3)"
      >
        gestippeld = systeem · gekleurd = mens beslist
      </text>
    </Schema>
  );

  return (
    <div className={className}>
      {breed}
      {smal}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1b. Hero-variant van de loop.                                              */
/*                                                                            */
/* Het volledige schema 1 heeft vier bronnen en vier uitkomsten; naast een     */
/* display-kop geperst worden die labels effectief 7px en dus onleesbaar       */
/* (gemeten op 1440px, 2026-09-19). De hero krijgt daarom de kern zonder de    */
/* detaillijsten: drie knooppunten, grote labels. Het complete schema staat    */
/* verderop op de pagina, waar het de volle breedte heeft.                     */
/*                                                                            */
/* Dit is ook de plek waar het Blender-model komt (fase 5).                    */
/* -------------------------------------------------------------------------- */

export function SchemaLoopHero({ className }: { className?: string }) {
  const W = 440;
  const H = 340;
  const nodeW = 260;
  const x = (W - nodeW) / 2;

  return (
    <Schema
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      title="Het systeem zoekt uit, jouw mensen beslissen"
      desc="Het handwerk — mail doorspitten, Excel bijwerken, documenten doorzoeken — gaat naar het systeem. Dat zoekt uit en zet klaar. Jouw mensen controleren en beslissen. Daarna gaat het werk eruit. Wat zij beslissen, leert het systeem."
    >
      <text
        x={W / 2}
        y={18}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fill="var(--color-ink-3)"
      >
        het uitzoekwerk
      </text>

      <Arrow from={[W / 2, 30]} to={[W / 2, 58]} />

      <Node x={x} y={70} w={nodeW} h={58} label={["systeem zoekt uit", "en zet klaar"]} />

      <Arrow from={[W / 2, 132]} to={[W / 2, 160]} accent />

      <Node
        x={x}
        y={172}
        w={nodeW}
        h={78}
        accent
        label={["jouw mensen", "controleren en beslissen"]}
      />

      <Arrow from={[W / 2, 254]} to={[W / 2, 282]} />

      <text
        x={W / 2}
        y={300}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={12}
        fill="var(--color-ink-2)"
      >
        het werk gaat eruit
      </text>

      {/* De terugkoppeling: de loop uit de merknaam. */}
      <path
        d={`M ${x + nodeW + 14} 211 L ${x + nodeW + 34} 211 L ${x + nodeW + 34} 99 L ${x + nodeW + 14} 99`}
        fill="none"
        stroke="var(--color-rule-strong)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <path
        d={`M ${x + nodeW + 18.5} 94.5 L ${x + nodeW + 14} 99 L ${x + nodeW + 18.5} 103.5`}
        fill="none"
        stroke="var(--color-rule-strong)"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <text
        x={W / 2}
        y={328}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-ink-3)"
      >
        wat zij beslissen, leert het systeem
      </text>
    </Schema>
  );
}
