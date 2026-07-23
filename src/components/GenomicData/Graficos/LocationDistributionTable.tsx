import React from "react";

interface DataRow {
  location: string;
  geoCode: string;
  matched: number;
  total: number;
  share: string;
}

interface Props {
  data: DataRow[];
}

export function LocationDistributionTable({ data }: Props) {
  if (!data?.length) return null;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Location</th>
              <th className="px-6 py-4 font-semibold">Geo Code</th>
              <th className="px-6 py-4 text-right font-semibold">Matched</th>
              <th className="px-6 py-4 text-right font-semibold">Total</th>
              <th className="px-6 py-4 text-right font-semibold">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => (
              <tr
                key={index}
                className="transition-colors hover:bg-slate-50/50"
              >
                <td className="px-6 py-4 font-medium text-slate-900">
                  {row.location}
                </td>
                <td className="px-6 py-4 font-medium text-slate-600">
                  {row.geoCode || "-"}
                </td>
                <td className="px-6 py-4 text-right text-slate-900">
                  {row.matched.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-slate-900">
                  {row.total.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right text-slate-900">
                  {row.share}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
