import type { Satta29Row } from "@/lib/types";

function dayNum(iso: string): string {
  const parts = iso.split("-");
  return parts[2] || iso;
}

export function MonthlyChartSection({
  month,
  year,
  games,
  rows,
}: {
  month: string;
  year: string;
  games: string[];
  rows: Satta29Row[];
}) {
  // Split the games into groups of 3 so each renders as its own compact table
  // (3 games + Date) that fits a phone screen without horizontal scrolling.
  const groups: string[][] = [];
  for (let i = 0; i < games.length; i += 3) groups.push(games.slice(i, i + 3));

  return (
    <div className="">
      <div className="bg-white rounded-xl border-2 border-[#e0850b] overflow-hidden shadow-lg">
        <div className="bg-gradient-to-r from-[#FFD93B] to-[#F5A623] text-[#a5370c] text-center py-2.5 md:py-3 text-[14px] md:text-sm font-bold px-2 md:px-3 leading-relaxed border-b-2 border-[#e0850b]">
          Satta King Chart {month} {year} <span className="hidden sm:inline">&mdash; Faridabad Day, Delhi Bazar, Shree Ganesh, Faridabad, Old Alwar, Ghaziabad, Dehradun City, Gali &amp; Desawar</span>
        </div>

        <div className="p-2.5 md:p-4 space-y-4 md:space-y-5">
          {groups.map((groupGames, gi) => (
            <table
              key={gi}
              className="w-full table-fixed text-[15px] sm:text-xs md:text-base border-collapse"
            >
              <thead>
                <tr className="bg-[#a5370c] text-[#FFE071] text-[13px] md:text-sm uppercase tracking-wider">
                  <th className="py-2.5 px-1.5 md:px-3 text-[#FFE071] font-bold border border-[#c2600f] w-[19%]">DATE</th>
                  {groupGames.map((g) => (
                    <th key={g} className="py-2.5 px-1 md:px-3 font-bold border border-[#c2600f] leading-tight">{g}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.date}
                    className={`text-center transition-colors hover:bg-[#fdf2c9] ${
                      i % 2 === 0 ? "bg-white" : "bg-[#fffbe9]"
                    }`}
                  >
                    <td className="py-1.5 px-1.5 md:px-3 text-[#dc2626] font-extrabold border border-[#f0e2a6]">{dayNum(row.date)}</td>
                    {groupGames.map((g) => (
                      <td key={g} className="py-1.5 px-1.5 md:px-3 font-mono font-bold text-[#1e293b] border border-[#f0e2a6]">{row.values[g] ? row.values[g] : "XX"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </div>
    </div>
  );
}
