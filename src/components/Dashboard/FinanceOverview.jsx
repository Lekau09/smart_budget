// src/components/Dashboard/FinanceOverview.jsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { totalBalance, totalIncome, totalExpenses } from "../../Utils/data";

const FinanceOverview = () => {
  const data = [
    { name: "Total Balance", value: totalBalance, color: "#7b61ff" },
    { name: "Total Income", value: totalIncome, color: "#ff7f50" },
    { name: "Total Expenses", value: totalExpenses, color: "#ff4b4b" },
  ];

  return (
    <div className="bg-white shadow-md rounded-2xl p-5">
      <h3 className="text-lg font-semibold mb-4">Financial Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-around text-sm mt-3">
        {data.map((d, i) => (
          <div key={i}>
            <span
              className="inline-block w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: d.color }}
            ></span>
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinanceOverview;
