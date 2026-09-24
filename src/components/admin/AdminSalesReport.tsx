import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  DollarSign,
  Package
} from 'lucide-react';
import { Order, Product, Category } from '../../types';
import { exportOrdersToExcel, exportOrdersToCSV, transformOrdersToReportRows } from '../../services/exportService';

interface AdminSalesReportProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  currencySymbol: string;
}

type DateRangePreset = 'all' | 'today' | 'yesterday' | 'last7' | 'last30' | 'custom';

export const AdminSalesReport: React.FC<AdminSalesReportProps> = ({
  orders,
  products,
  categories,
  currencySymbol
}) => {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter calculation
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  const filteredOrders = orders.filter((order) => {
    const orderDate = order.dateString || order.createdAt.slice(0, 10);
    const orderTime = order.timestamp || new Date(order.createdAt).getTime();

    // Date preset check
    if (datePreset === 'today' && orderDate !== todayStr) return false;
    if (datePreset === 'yesterday' && orderDate !== yesterdayStr) return false;
    if (datePreset === 'last7' && orderTime < sevenDaysAgo) return false;
    if (datePreset === 'last30' && orderTime < thirtyDaysAgo) return false;
    if (datePreset === 'custom') {
      if (customStart && orderDate < customStart) return false;
      if (customEnd && orderDate > customEnd) return false;
    }

    // Product & Category filters
    if (productFilter !== 'all') {
      const hasProduct = order.items.some(i => i.productId === productFilter);
      if (!hasProduct) return false;
    }

    if (categoryFilter !== 'all') {
      // Find all product IDs in this category
      const categoryProductIds = products.filter(p => p.categoryId === categoryFilter).map(p => p.id);
      const hasCatItem = order.items.some(i => categoryProductIds.includes(i.productId));
      if (!hasCatItem) return false;
    }

    return true;
  });

  const previewRows = transformOrdersToReportRows(filteredOrders, currencySymbol);

  // Compute summary metrics for filtered results
  const totalFilteredRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalFilteredItems = previewRows.reduce((sum, r) => sum + r.Quantity, 0);

  const handleDownloadExcel = () => {
    const filename = `SalesReport_${datePreset}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportOrdersToExcel(filteredOrders, filename, currencySymbol);
  };

  const handleDownloadCSV = () => {
    const filename = `SalesReport_${datePreset}_${new Date().toISOString().slice(0, 10)}.csv`;
    exportOrdersToCSV(filteredOrders, filename, currencySymbol);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Sales Report & Excel Export
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Filter, examine, and download structured order worksheets with all variant snapshots.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            Export CSV
          </button>
          <button
            onClick={handleDownloadExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-4">
        
        {/* Preset Date Range Buttons */}
        <div>
          <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
            Timeframe Filter
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'last30', label: 'Last 30 Days' },
              { id: 'custom', label: 'Custom Range' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setDatePreset(p.id as DateRangePreset)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === p.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range Inputs */}
        {datePreset === 'custom' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-slate-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-1.5 border rounded-xl text-xs bg-slate-50"
              />
            </div>
          </div>
        )}

        {/* Secondary Filters (Product, Category) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Product</label>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-semibold"
            >
              <option value="all">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 border rounded-xl text-xs bg-slate-50 font-semibold"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200/70 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800">Filtered Sales Revenue</span>
            <p className="text-xl font-black text-emerald-950 mt-1">{currencySymbol}{totalFilteredRevenue.toFixed(2)}</p>
          </div>
          <DollarSign className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-600">Matching Orders</span>
            <p className="text-xl font-black text-slate-900 mt-1">{filteredOrders.length}</p>
          </div>
          <FileSpreadsheet className="w-6 h-6 text-slate-400" />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-600">Total Units Itemized</span>
            <p className="text-xl font-black text-slate-900 mt-1">{totalFilteredItems}</p>
          </div>
          <Package className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      {/* Live Table Preview */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Worksheet Preview ({previewRows.length} rows)
          </h2>
          <span className="text-[11px] text-slate-400">
            Export includes detailed product breakdown
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 text-[10px] font-extrabold uppercase text-slate-600 sticky top-0">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Product Name</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3">Size</th>
                <th className="p-3">Colour</th>
                <th className="p-3">KG/Weight</th>
                <th className="p-3">Combo</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Delivery Charge</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Delivery Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewRows.length === 0 ? (
                <tr>
                  <td colSpan={15} className="text-center p-8 text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-medium">
                    <td className="p-3">{row.Date}</td>
                    <td className="p-3 text-slate-500">{row.Time}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{row['Order ID']}</td>
                    <td className="p-3 font-semibold text-slate-800">{row['Customer Name']}</td>
                    <td className="p-3 text-slate-600">{row.Phone}</td>
                    <td className="p-3 font-bold text-emerald-800">{row['Product Name']}</td>
                    <td className="p-3 text-center font-bold">{row.Quantity}</td>
                    <td className="p-3 text-slate-500">{row.Size}</td>
                    <td className="p-3 text-slate-500">{row.Colour}</td>
                    <td className="p-3 text-slate-500">{row['KG/Weight']}</td>
                    <td className="p-3 text-indigo-600">{row.Combo}</td>
                    <td className="p-3 font-bold">{row['Unit Price']}</td>
                    <td className="p-3 text-slate-600">{row['Delivery Charge']}</td>
                    <td className="p-3 font-black text-slate-900">{row['Total Amount']}</td>
                    <td className="p-3 text-slate-600">{row['Delivery Option']}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
