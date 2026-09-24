import * as XLSX from 'xlsx';
import { Order } from '../types';

export interface ReportRow {
  Date: string;
  Time: string;
  'Order ID': string;
  'Customer Name': string;
  'Phone': string;
  'Product Name': string;
  'Quantity': number;
  'Size': string;
  'Colour': string;
  'KG/Weight': string;
  'Combo': string;
  'Unit Price': string;
  'Delivery Charge': string;
  'Total Amount': string;
  'Delivery Option': string;
}

export function transformOrdersToReportRows(orders: Order[], currencySymbol = '$'): ReportRow[] {
  const rows: ReportRow[] = [];

  orders.forEach((order) => {
    order.items.forEach((item) => {
      rows.push({
        Date: order.dateString || order.createdAt.slice(0, 10),
        Time: order.createdAtTime || new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        'Order ID': order.orderNumber,
        'Customer Name': order.customerName,
        'Phone': order.phone,
        'Product Name': item.name,
        'Quantity': item.quantity,
        'Size': item.selectedSize || 'N/A',
        'Colour': item.selectedColour || 'N/A',
        'KG/Weight': item.selectedKg || 'N/A',
        'Combo': item.selectedCombo || 'N/A',
        'Unit Price': `${currencySymbol}${item.price.toFixed(2)}`,
        'Delivery Charge': `${currencySymbol}${order.deliveryCharge.toFixed(2)}`,
        'Total Amount': `${currencySymbol}${order.totalAmount.toFixed(2)}`,
        'Delivery Option': order.deliveryOption?.name || 'Standard'
      });
    });
  });

  return rows;
}

export function exportOrdersToExcel(orders: Order[], filename = 'SalesReport.xlsx', currencySymbol = '$'): void {
  const rows = transformOrdersToReportRows(orders, currencySymbol);

  // If no rows, provide dummy header
  const data = rows.length > 0 ? rows : [{
    Date: '',
    Time: '',
    'Order ID': '',
    'Customer Name': '',
    'Phone': '',
    'Product Name': 'No orders match filter criteria',
    'Quantity': 0,
    'Size': '',
    'Colour': '',
    'KG/Weight': '',
    'Combo': '',
    'Unit Price': '',
    'Delivery Charge': '',
    'Total Amount': '',
    'Delivery Option': ''
  }];

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colKeys = Object.keys(data[0]);
  worksheet['!cols'] = colKeys.map(key => ({
    wch: Math.max(key.length, 14)
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Orders');

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

export function exportOrdersToCSV(orders: Order[], filename = 'SalesReport.csv', currencySymbol = '$'): void {
  const rows = transformOrdersToReportRows(orders, currencySymbol);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob(['\ufeff' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
