"use client";

import { Skeleton } from "antd";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <Skeleton />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton.Node active className="flex !w-full" />
        <Skeleton.Node active className="flex !w-full" />
        <Skeleton.Node active className="flex !w-full" />
        <Skeleton.Node active className="flex !w-full" />
      </div>

      <div className="flex flex-col md:flex-row w-full gap-8">
        <Skeleton.Node active className="flex !w-full" />
        <Skeleton.Node active className="flex !w-full" />
      </div>
    </div>
  );
}
