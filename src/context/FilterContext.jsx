import React, { createContext, useState } from "react";

export const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("Month");

  return (
    <FilterContext.Provider value={{ searchQuery, setSearchQuery, timeRange, setTimeRange }}>
      {children}
    </FilterContext.Provider>
  );
}
