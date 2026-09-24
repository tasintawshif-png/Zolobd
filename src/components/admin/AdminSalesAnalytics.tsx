import React, { useState, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { Order, Product, Category } from '../../types';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Calendar,
  Download,
  FileText,
  PieChart as PieIcon
} from 'lucide-react';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AdminSalesAnalyticsProps {
  orders: Order[];
  products: Product[];
  categories: Category[];
  currencySymbol: string;
}

type TimeRange = '7days' | '30days' | 'all';
type PieChartType = 'donut' | 'pie';

export const AdminSalesAnalytics: React.FC<AdminSalesAnalyticsProps> = ({
  orders,
  products,
  categories,
  currencySymbol
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [pieChartType, setPieChartType] = useState<PieChartType>('pie');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pieChartRef = useRef<any>(null);

  const now = Date.now();
  const cutoff = timeRange === '7days'
    ? now - 7 * 86400000
    : timeRange === '30days'
    ? now - 30 * 86400000
    : 0;

  const filteredOrders = orders.filter((o) => {
    const timestamp = o.timestamp || new Date(o.createdAt).getTime();
    return timestamp >= cutoff;
  });

  // Calculate totals
  const totalSales = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Aggregate daily revenue for line chart
  const dailyRevenueMap: Record<string, number> = {};
  filteredOrders.forEach((o) => {
    const dateKey = o.dateString || o.createdAt.slice(0, 10);
    dailyRevenueMap[dateKey] = (dailyRevenueMap[dateKey] || 0) + o.totalAmount;
  });

  // Aggregate product volume and revenue
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  const categorySalesMap: Record<string, number> = {};

  const productCategoryMap: Record<string, string> = {};
  products.forEach(p => {
    const cat = categories.find(c => c.id === p.categoryId);
    productCategoryMap[p.id] = cat ? cat.name : 'General';
  });

  let totalQtySold = 0;

  filteredOrders.forEach((order) => {
    order.items?.forEach((item) => {
      totalQtySold += item.quantity;
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.name,
          qty: 0,
          revenue: 0
        };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.price * item.quantity;

      const catName = productCategoryMap[item.productId] || 'General';
      categorySalesMap[catName] = (categorySalesMap[catName] || 0) + (item.price * item.quantity);
    });
  });

  // Chart 1: Sales Over Time (Line)
  const sortedDates = Object.keys(dailyRevenueMap).sort();
  const salesOverTimeData = {
    labels: sortedDates.map(d => d.slice(5)), // MM-DD
    datasets: [
      {
        label: `Daily Sales (${currencySymbol})`,
        data: sortedDates.map(d => dailyRevenueMap[d]),
        borderColor: '#059669',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#059669'
      }
    ]
  };

  // Chart 2: Product Sales (Donut/Pie) - Top products with percentage calculation
  const totalProductRevenue = Object.values(productSalesMap).reduce((sum, p) => sum + p.revenue, 0);

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const productPieData = {
    labels: topProducts.map(p => {
      const pct = totalProductRevenue > 0 ? ((p.revenue / totalProductRevenue) * 100).toFixed(1) : '0';
      return `${p.name} (${pct}%)`;
    }),
    datasets: [
      {
        data: topProducts.map(p => p.revenue),
        backgroundColor: [
          '#059669',
          '#10b981',
          '#34d399',
          '#0284c7',
          '#6366f1',
          '#f59e0b',
          '#ec4899',
          '#8b5cf6'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Chart 3: Product Quantity Comparison (Bar)
  const topQtyProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  const productQtyData = {
    labels: topQtyProducts.map(p => p.name.length > 14 ? p.name.slice(0, 14) + '...' : p.name),
    datasets: [
      {
        label: 'Units Sold',
        data: topQtyProducts.map(p => p.qty),
        backgroundColor: '#10b981',
        borderRadius: 8
      }
    ]
  };

  // Chart 4: Category Sales Comparison (Bar / Doughnut)
  const categoryLabels = Object.keys(categorySalesMap);
  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        label: `Category Revenue (${currencySymbol})`,
        data: categoryLabels.map(c => categorySalesMap[c]),
        backgroundColor: [
          '#10b981',
          '#0ea5e9',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#64748b'
        ],
        borderRadius: 8
      }
    ]
  };

  // PDF Export for Pie Chart
  const handleDownloadPiePdf = () => {
    try {
      setIsGeneratingPdf(true);
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Green Header Bar
      doc.setFillColor(5, 150, 105); // emerald-600
      doc.rect(0, 0, pageWidth, 28, 'F');

      // Header Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text('PRODUCT SALES SHARE (%) ANALYTICS REPORT', 14, 13);

      // Header Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(209, 250, 229);
      const timeframeLabel = timeRange === '7days' ? 'Last 7 Days' : timeRange === '30days' ? 'Last 30 Days' : 'All Time';
      const genDate = new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Timeframe: ${timeframeLabel}  |  Generated: ${genDate}`, 14, 21);

      // Summary Cards
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);

      // Box 1: Total Revenue
      doc.roundedRect(14, 34, 56, 18, 2, 2, 'FD');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL SALES REVENUE', 18, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${currencySymbol}${totalProductRevenue.toFixed(2)}`, 18, 48);

      // Box 2: Total Units Sold
      doc.roundedRect(74, 34, 56, 18, 2, 2, 'FD');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('TOTAL UNITS SOLD', 78, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${totalQtySold} Units`, 78, 48);

      // Box 3: Total Products
      doc.roundedRect(134, 34, 62, 18, 2, 2, 'FD');
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('TOP PRODUCTS IN SHARE', 138, 40);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${topProducts.length} Items`, 138, 48);

      // Draw Chart Image
      let chartY = 56;
      if (pieChartRef.current) {
        const chartInstance = pieChartRef.current;
        let base64Image = '';
        if (typeof chartInstance.toBase64Image === 'function') {
          base64Image = chartInstance.toBase64Image();
        } else if (chartInstance.canvas && typeof chartInstance.canvas.toDataURL === 'function') {
          base64Image = chartInstance.canvas.toDataURL('image/png');
        }

        if (base64Image) {
          const chartWidth = 120;
          const chartHeight = 72;
          const chartX = (pageWidth - chartWidth) / 2;
          doc.addImage(base64Image, 'PNG', chartX, chartY, chartWidth, chartHeight);
          chartY += chartHeight + 6;
        }
      }

      // Section Title: Breakdown Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Product-Wise Sales & Percentage Share (%) Breakdown', 14, chartY);
      chartY += 4.5;

      // Table Header
      doc.setFillColor(16, 185, 129); // emerald-500
      doc.rect(14, chartY, pageWidth - 28, 8, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('RANK', 18, chartY + 5.5);
      doc.text('PRODUCT NAME', 34, chartY + 5.5);
      doc.text('UNITS SOLD', 105, chartY + 5.5);
      doc.text('REVENUE', 135, chartY + 5.5);
      doc.text('SALES SHARE (%)', 165, chartY + 5.5);
      chartY += 8;

      // Table Rows
      doc.setFont('helvetica', 'normal');
      topProducts.forEach((p, idx) => {
        const revPct = totalProductRevenue > 0 ? ((p.revenue / totalProductRevenue) * 100).toFixed(1) : '0';
        const qtyPct = totalQtySold > 0 ? ((p.qty / totalQtySold) * 100).toFixed(1) : '0';

        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, chartY, pageWidth - 28, 7, 'F');
        }

        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(`#${idx + 1}`, 18, chartY + 4.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        const prodName = p.name.length > 34 ? p.name.slice(0, 34) + '...' : p.name;
        doc.text(prodName, 34, chartY + 4.8);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(`${p.qty} (${qtyPct}%)`, 105, chartY + 4.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`${currencySymbol}${p.revenue.toFixed(2)}`, 135, chartY + 4.8);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(5, 150, 105);
        doc.text(`${revPct}%`, 165, chartY + 4.8);

        chartY += 7;
      });

      // Total Row
      doc.setDrawColor(203, 213, 225);
      doc.line(14, chartY, pageWidth - 14, chartY);
      doc.setFillColor(241, 245, 249);
      doc.rect(14, chartY, pageWidth - 28, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('TOTAL', 34, chartY + 5.5);
      doc.text(`${totalQtySold} Units`, 105, chartY + 5.5);
      doc.text(`${currencySymbol}${totalProductRevenue.toFixed(2)}`, 135, chartY + 5.5);
      doc.setTextColor(5, 150, 105);
      doc.text('100.0%', 165, chartY + 5.5);

      // Footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Generated with Store Admin Platform • Official Sales Analytics Report', pageWidth / 2, pageHeight - 6, { align: 'center' });

      doc.save(`Pie_Chart_Sales_Share_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Store Sales Analytics & Visuals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Interactive chart telemetry tracking revenue trends, product share, and categories.
          </p>
        </div>

        {/* Timeframe switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              timeRange === '7days' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              timeRange === '30days' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              timeRange === 'all' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Sales Revenue</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {currencySymbol}{totalSales.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">In selected period</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalOrders}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Customer checkouts</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Average Order Value (AOV)</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {currencySymbol}{avgOrderValue.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Per placed basket</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Units Sold</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalQtySold}
          </p>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">Units dispatched</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Revenue Over Time */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-1">Sales Revenue Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Daily gross incoming revenue</p>
          <div className="h-64">
            <Line
              data={salesOverTimeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (val) => `${currencySymbol}${val}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 2: Product Sales Share Pie/Donut Chart with PDF DOWNLOAD OPTION */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">Product Sales Share (%)</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Percentage Breakdown
                </span>
              </div>

              {/* Pie / Donut switcher & PDF Download Button */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setPieChartType('pie')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      pieChartType === 'pie' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Pie
                  </button>
                  <button
                    onClick={() => setPieChartType('donut')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      pieChartType === 'donut' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Donut
                  </button>
                </div>

                <button
                  onClick={handleDownloadPiePdf}
                  disabled={topProducts.length === 0 || isGeneratingPdf}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                  title="Download Pie Chart Report as PDF"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-3">Each product's contribution to total store sales</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400">No product sales recorded yet.</p>
            ) : pieChartType === 'pie' ? (
              <Pie
                ref={pieChartRef}
                data={productPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 12, font: { size: 10 } }
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const val = Number(ctx.raw) || 0;
                          const pct = totalProductRevenue > 0 ? ((val / totalProductRevenue) * 100).toFixed(1) : '0';
                          return ` ${currencySymbol}${val.toFixed(2)} (${pct}% of sales)`;
                        }
                      }
                    }
                  }
                }}
              />
            ) : (
              <Doughnut
                ref={pieChartRef}
                data={productPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 12, font: { size: 10 } }
                    },
                    tooltip: {
                      callbacks: {
                        label: (ctx) => {
                          const val = Number(ctx.raw) || 0;
                          const pct = totalProductRevenue > 0 ? ((val / totalProductRevenue) * 100).toFixed(1) : '0';
                          return ` ${currencySymbol}${val.toFixed(2)} (${pct}% of sales)`;
                        }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Chart 3: Product Quantity Comparison */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-1">Units Sold by Product</h3>
          <p className="text-xs text-slate-400 mb-4">Fastest moving items in volume</p>
          <div className="h-64">
            <Bar
              data={productQtyData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 4: Category Sales Comparison */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 mb-1">Category Sales Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Total dollar contribution per category</p>
          <div className="h-64">
            <Bar
              data={categoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (val) => `${currencySymbol}${val}`
                    }
                  }
                }
              }}
            />
          </div>
        </div>

      </div>

      {/* Product-wise Sales Percentage Table / Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900">Product Sales & Share Percentage (%) Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Exact sales percentage and volume for each item sold</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {topProducts.length} Top Products
            </span>
            <button
              onClick={handleDownloadPiePdf}
              disabled={topProducts.length === 0 || isGeneratingPdf}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {topProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No sales data available for the selected period.
            </div>
          ) : (
            topProducts.map((p, index) => {
              const revPct = totalProductRevenue > 0 ? (p.revenue / totalProductRevenue) * 100 : 0;
              const qtyPct = totalQtySold > 0 ? (p.qty / totalQtySold) * 100 : 0;

              return (
                <div key={index} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${Math.min(revPct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500">{p.qty} units ({qtyPct.toFixed(1)}% of volume)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                        {currencySymbol}{p.revenue.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400">Revenue</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-center min-w-[70px]">
                      <span className="text-xs sm:text-sm font-black text-emerald-800 block">
                        {revPct.toFixed(1)}%
                      </span>
                      <span className="text-[9px] uppercase font-bold text-emerald-600 block">Share</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
