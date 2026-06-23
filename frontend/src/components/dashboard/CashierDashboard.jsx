import { MonitorSmartphone, CreditCard, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CashierDashboard = () => {
  const navigate = useNavigate();

  const recentTransactions = [
    { id: 'ORD-8901', customer: 'Walk-in', amount: '$45.00', time: '10:42 AM', status: 'Completed' },
    { id: 'ORD-8900', customer: 'Sarah Jenkins', amount: '$120.50', time: '10:15 AM', status: 'Completed' },
    { id: 'ORD-8899', customer: 'Walk-in', amount: '$12.00', time: '09:58 AM', status: 'Completed' },
    { id: 'ORD-8898', customer: 'Mike Ross', amount: '$340.00', time: '09:30 AM', status: 'Completed' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center py-8">
        <h2 className="text-3xl font-display font-bold text-text-main mb-2">Ready for the next customer?</h2>
        <p className="text-text-sec mb-8">Shift started at 09:00 AM. You're doing great!</p>
        
        <button 
          onClick={() => navigate('/dashboard/pos')}
          className="inline-flex items-center px-8 py-4 text-lg font-bold bg-primary text-white rounded-2xl hover:bg-primary-hover hover:-translate-y-1 transition-all shadow-lg shadow-primary/30"
        >
          <MonitorSmartphone className="w-6 h-6 mr-3" />
          Start New Sale
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-border-main text-center">
          <p className="text-text-sec text-sm font-medium mb-1">Today's Transactions</p>
          <p className="text-3xl font-bold text-text-main">42</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-main text-center">
          <p className="text-text-sec text-sm font-medium mb-1">Items Sold</p>
          <p className="text-3xl font-bold text-text-main">156</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-border-main text-center">
          <p className="text-text-sec text-sm font-medium mb-1">Revenue Generated</p>
          <p className="text-3xl font-bold text-text-main">$1,240.50</p>
        </div>
      </div>

      <div className="bg-white border border-border-main rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-main bg-bg-sec/50 flex justify-between items-center">
          <h3 className="font-semibold text-text-main">Recent Transactions</h3>
          <button className="text-sm text-primary font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-main text-xs uppercase text-text-sec bg-white">
                <th className="px-6 py-3 font-medium">Order ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border-main">
              {recentTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-bg-sec/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-primary">{tx.id}</td>
                  <td className="px-6 py-4 text-text-main">{tx.customer}</td>
                  <td className="px-6 py-4 text-text-sec text-sm">{tx.time}</td>
                  <td className="px-6 py-4 font-semibold text-text-main">{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashierDashboard;
