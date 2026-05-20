import React from 'react';

const tx = [
  { id: 1, label: 'Starbucks', date: '2025-10-28', amount: -5.4, icon: CoffeeIcon },
  { id: 2, label: 'Salary', date: '2025-10-25', amount: 1500, icon: WalletIcon },
  { id: 3, label: 'Groceries', date: '2025-10-24', amount: -120.75, icon: CartIcon },
];

export default function RecentTransactions() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-800">Recent Transactions</h3>
        <a href="#" className="text-sm text-indigo-600 hover:underline">View All</a>
      </div>

      <ul className="space-y-3">
        {tx.map((t) => {
          const Icon = t.icon;
          const isNegative = t.amount < 0;
          return (
            <li key={t.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.date}</div>
                </div>
              </div>
              <div className={`font-medium ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                {isNegative ? '-' : '+'}M{Math.abs(t.amount)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* icons */
function CoffeeIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M3 8h14v6a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/>
      <path strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M18 8v3"/>
    </svg>
  );
}
function WalletIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M2 7h18v10H2z"/>
      <path strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M22 9v6"/>
    </svg>
  );
}
function CartIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" d="M6 6h15l-1.5 9h-12z"/>
      <circle cx="9" cy="20" r="1" strokeWidth="1.3" />
      <circle cx="18" cy="20" r="1" strokeWidth="1.3" />
    </svg>
  );
}
