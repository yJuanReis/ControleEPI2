// src/components/Dashboard/StatsCard.tsx

import React from "react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  className = "",
  valueClassName = "",
}) => (
  <Card className={`p-4 flex items-center gap-4 ${className}`}>
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
    </div>
  </Card>
);

export default StatsCard;