// src/components/UniversalDataBox.jsx
import React from "react";

export  function UniversalDataBox({ label, data }) {
  const getType = (d) =>
    Array.isArray(d)
      ? Array.isArray(d[0]) ? "matrix" : "array"
      : typeof d === "object" && d !== null
      ? "hashmap"
      : "variable";

  const type = getType(data);

  let items = [];
  let gridCols = "auto";

  if (type === "variable") {
    items = [[label, data]];
  } else if (type === "array") {
    items = data.map((v, i) => [`${i}`, v]);
    gridCols = `repeat(${data.length}, auto)`;
  } else if (type === "matrix") {
    items = data.flat().map((v) => [null, v]);
    gridCols = `repeat(${data[0].length}, auto)`;
  } else if (type === "hashmap") {
    items = Object.entries(data);
    gridCols = `repeat(${items.length}, auto)`;
  }

  return (
    <div className="flex flex-col items-center my-4 w-fit max-w-full">
      {/* Title bar */}
      {label && (
        <div className="w-full bg-black text-green-400 text-center py-1 rounded-t-md">
          {label}
        </div>
      )}

      {/* Black background container */}
      <div
        className={type === "variable" ? "flex bg-black" : "grid bg-black"}
        style={{
          gridTemplateColumns: type === "variable" ? undefined : gridCols,
          border: "1px solid green",
          borderTop: "none",
          borderRadius: "0 0 0.375rem 0.375rem",
          padding: "0.75rem",
          minWidth: "fit-content",
          maxWidth: "100%",
          flexWrap: type === "variable" ? "wrap" : undefined,
          justifyContent: "center",
          gap: "0.5rem"
        }}
      >
        {items.map(([key, value], idx) => (
          <div
            key={idx}
            className="flex flex-col items-center border border-gray-300 bg-white text-black px-3 py-2"
          >
            {key !== null && (
              <span className="text-[10px] text-gray-500">{key}</span>
            )}
            <span className="text-sm font-bold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlackBoxContainer({ title, children }) {
  return (
    <div className="flex flex-col items-center my-2 w-fit max-w-full border border-green-400 rounded-lg bg-black p-4">
      {title && (
        <div className="text-green-400 font-bold mb-1">{title}</div>
      )}
      <div className="flex flex-wrap gap-1 justify-center">
        {children}
      </div>
    </div>
  );
}
