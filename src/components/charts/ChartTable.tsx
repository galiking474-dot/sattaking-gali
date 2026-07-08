"use client";

import type { ChartRecord } from "@/types";

export function ChartTable({ records, gameName }: { records: ChartRecord[]; gameName: string }) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No records available for this month.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-base border-collapse">
        <thead>
          <tr className="bg-[#1e293b] text-white">
            <th className="px-3 md:px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-3 md:px-4 py-3 text-left font-semibold">Day</th>
            <th className="px-3 md:px-4 py-3 text-center font-semibold">{gameName} Result</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={record.date}
              className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-3 md:px-4 py-3 font-bold text-gray-800">
                {record.date}
              </td>
              <td className="px-3 md:px-4 py-3">
                <div className="font-bold text-gray-800">{record.day}</div>
                <div className="text-xs font-semibold text-gray-400 mt-0.5">{record.resultTime}</div>
              </td>
              <td className="px-3 md:px-4 py-3 text-center">
                <span className="inline-block bg-emerald-100 text-emerald-800 font-mono font-extrabold px-4 py-1.5 rounded-lg text-lg">
                  {record.result}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
