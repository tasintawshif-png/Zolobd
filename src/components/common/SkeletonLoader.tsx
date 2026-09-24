import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-50/50 flex flex-col animate-pulse">
      <div className="w-full aspect-square bg-slate-100 rounded-xl mb-3"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-100 rounded w-1/2 mb-3"></div>
      <div className="mt-auto pt-2 flex items-center justify-between">
        <div className="h-5 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 bg-emerald-100 rounded-full w-24"></div>
      </div>
    </div>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <div className="w-full aspect-[21/9] min-h-[220px] md:min-h-[360px] bg-slate-200 rounded-2xl md:rounded-3xl animate-pulse"></div>
  );
};
