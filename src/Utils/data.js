// src/Utils/data.js
import { HiHome, HiCurrencyDollar, HiShoppingCart } from "react-icons/hi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { MdSettings } from "react-icons/md";

export const SIDE_MENU_DATA = [
  { label: "Dashboard", icon: HiHome, path: "/dashboard" },
  { label: "Income", icon: HiCurrencyDollar, path: "/income" },
  { label: "Expenses", icon: HiShoppingCart, path: "/expense" },
  { label: "Transactions", icon: FaMoneyBillTransfer, path: "/transactions" },
  { label: "Settings", icon: MdSettings, path: "/settings" },
  { label: "Logout", icon: MdSettings, path: "logout" }, // keep logout here for handleClick
];

// You can still keep your mock transactions here if needed:
export const transactions = [
  { id: 1, type: "expense", category: "Shopping", amount: 430, date: "2025-02-17" },
  { id: 2, type: "expense", category: "Travel", amount: 670, date: "2025-02-13" },
  { id: 3, type: "income", category: "Salary", amount: 12000, date: "2025-02-12" },
  { id: 4, type: "expense", category: "Electricity Bill", amount: 200, date: "2025-02-11" },
  { id: 5, type: "expense", category: "Loan Repayment", amount: 600, date: "2025-02-10" },
];

export const totalIncome = transactions
  .filter((t) => t.type === "income")
  .reduce((sum, t) => sum + t.amount, 0);

export const totalExpenses = transactions
  .filter((t) => t.type === "expense")
  .reduce((sum, t) => sum + t.amount, 0);

export const totalBalance = totalIncome - totalExpenses;
