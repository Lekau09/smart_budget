// src/components/Dashboard/RecentTransactions.jsx
import React from "react";
import { transactions } from "../../Utils/data";
import { HiShoppingBag } from "react-icons/hi";
import { FaPlane, FaMoneyBill, FaLightbulb, FaUniversity } from "react-icons/fa";

const categoryIcons = {
  Shopping: <HiShoppingBag className="text-pink-500 text-xl" />,
  Travel: <FaPlane className="text-blue-500 text-xl" />,
  Salary: <FaMoneyBill className="text-green-500 text-xl" />,
  "Electricity Bill": <FaLightbulb className="text-yellow-400 text-xl" />,
  "Loan Repayment": <FaUniversity className="text-gray-500 text-xl" />,
};

const RecentTransactions = () => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <button className="text-sm text-blue-600 hover:underline">See All →</button>
      </div>

      <ul className="divide-y">
        {transactions.map((t) => (
          <li
            key={t.id}
            className="flex justify-between items-center py-3 text-sm"
          >
            <div className="flex items-center gap-3">
              {categoryIcons[t.category] || <HiShoppingBag className="text-gray-400 text-xl" />}
              <div>
                <p className="font-medium">{t.category}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(t.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <span
              className={`font-semibold ${
                t.type === "income" ? "text-green-600" : "text-red-500"
              }`}
            >
              {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentTransactions;
