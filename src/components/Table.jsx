import React from 'react';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className="py-3 px-6">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="bg-white border-b hover:bg-gray-50"
              onClick={() => onRowClick && onRowClick(row)}
              tabIndex={onRowClick ? 0 : -1} // Make row focusable if clickable
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="py-4 px-6">
                  {column.accessor ? row[column.accessor] : column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;