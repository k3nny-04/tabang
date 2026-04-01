import { Loader2 } from "lucide-react";

const DataTable = ({ columns, data, loading, emptyMessage = "No data available." }) => {
  return (
    <div className="w-full min-h-0 shrink overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm custom-scrollbar">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="sticky top-0 z-10 bg-gray-50 text-text-muted border-b border-gray-200 shadow-sm">
          <tr>
            {columns.map((col, idx) => (
              <th key={col.key || idx} className="px-6 py-4 font-semibold tracking-wide bg-gray-50">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="divide-y divide-gray-100 bg-white text-text-primary">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-text-muted">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <p>Loading data...</p>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="transition-colors hover:bg-gray-50/50">
                {columns.map((col, colIndex) => (
                  <td key={col.key || colIndex} className="px-6 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;