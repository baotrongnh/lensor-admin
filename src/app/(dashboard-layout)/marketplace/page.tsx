"use client";

import React from "react";
import { ProductTable } from "./product-table";

export default function MarketplacePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-6 py-4 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">
                Marketplace Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Quản lý sản phẩm, theo dõi doanh số và đánh giá
              </p>
            </div>
            <ProductTable />
          </div>
        </div>
      </div>
    </div>
  );
}

