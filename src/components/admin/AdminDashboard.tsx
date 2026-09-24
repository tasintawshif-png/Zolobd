import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Users,
  Calendar,
  Clock,
  ArrowUpRight,
  Eye,
  CreditCard,
  Phone
} from 'lucide-react';
import { Order, Product } from '../../types';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  currencySymbol: string;
  onNavigateTab: (tab: AdminTab) => void;
  onUpdateOrderStatus?: (orderId: string, status: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  products,
  currencySymbol,
  onNavigateTab
}) => {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const sevenDaysAgo = Date.now() - 7 * 86400000;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  // Revenue & Sales stats
  let totalRevenue = 0;
  let todaySales = 0;
  let last7DaysSales = 0;
  let last30DaysSales = 0;

  const uniqueCustomers = new Set<string>();
  const productSalesMap: Record<string, { name: string; units: number; revenue: number }> = {};

  orders.forEach((o) => {
    const orderTimestamp = o.timestamp || new Date(o.createdAt).getTime();
    const orderAmount = o.totalAmount || 0;

    totalRevenue += orderAmount;
    if (o.customerName) uniqueCustomers.add(o.customerName.toLowerCase().trim());

    if (o.dateString === todayStr || o.createdAt.slice(0, 10) === todayStr) {
      todaySales += orderAmount;
    }

    if (orderTimestamp >= sevenDaysAgo) {
      last7DaysSales += orderAmount;
    }

    if (orderTimestamp >= thirtyDaysAgo) {
      last30DaysSales += orderAmount;
    }

    // Accumulate product stats
    o.items?.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.name, units: 0, revenue: 0 };
      }
      productSalesMap[item.productId].units += item.quantity;
      productSalesMap[item.productId].revenue += item.price * item.quantity;
    });
  });

  const bestSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  const recentOrders = orders.slice(0, 6);
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 to-green-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-900/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
            Store Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Real-time synchronization across customer checkout and inventory.
          </p>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-extrabold shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            + Add Product
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2.5 bg-emerald-700/60 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold border border-emerald-400/30 transition-all cursor-pointer"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {currencySymbol}{totalRevenue.toFixed(2)}
            </p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              All-time lifetime revenue
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Sales</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {currencySymbol}{todaySales.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Since 12:00 AM midnight
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Last 7 Days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 7 Days</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {currencySymbol}{last7DaysSales.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Rolling week performance
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Last 30 Days */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last 30 Days</span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {currencySymbol}{last30DaysSales.toFixed(2)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Monthly sales volume
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <Package className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Active Products</span>
            <span className="text-base font-extrabold text-slate-900">{products.filter(p => p.enabled).length} of {products.length}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <Users className="w-5 h-5 text-indigo-600" />
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Total Customers</span>
            <span className="text-base font-extrabold text-slate-900">{uniqueCustomers.size}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Total Orders</span>
            <span className="text-base font-extrabold text-slate-900">{orders.length}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-blue-500" />
          <div>
            <span className="text-[11px] text-slate-400 font-bold block">Avg. Order Value</span>
            <span className="text-base font-extrabold text-slate-900">{currencySymbol}{avgOrderValue}</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Orders & Best-Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Latest checkout purchases from store</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No orders placed yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center flex-shrink-0">
                      {order.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{order.orderNumber}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-800">{order.customerName}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {order.items.length} items • {order.items.map(i => i.name).slice(0, 2).join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-12 sm:pl-0">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {order.phone}
                    </span>

                    <span className="font-extrabold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg">
                      {currencySymbol}{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top 5 Best Sellers (1 col) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-slate-900">Top Selling Products</h2>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Analytics
              </button>
            </div>

            <div className="space-y-3">
              {bestSellingProducts.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">No sales data recorded yet.</p>
              ) : (
                bestSellingProducts.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 truncate">{p.name}</span>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0 flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {totalRevenue > 0 ? ((p.revenue / totalRevenue) * 100).toFixed(1) : '0'}%
                      </span>
                      <div>
                        <span className="font-extrabold text-slate-900 block">{p.units} sold</span>
                        <span className="text-[10px] text-slate-400">{currencySymbol}{p.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('reports')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Download Full Sales Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
