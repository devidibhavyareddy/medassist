import React from 'react';

const Table = ({ headers, children, className = '', empty = false, emptyText = 'No data available' }) => {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="py-3.5 px-4 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {empty ? (
            <tr>
              <td colSpan={headers.length} className="text-center py-8 text-slate-400 text-sm">
                {emptyText}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, onClick, className = '' }) => (
  <tr
    onClick={onClick}
    className={`transition-colors hover:bg-slate-50/80 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`py-3.5 px-4 align-middle ${className}`}>{children}</td>
);

export default Table;
