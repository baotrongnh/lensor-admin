"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { RevenueStatistics } from "@/services/revenue.service"
import { Skeleton } from "@/components/ui/skeleton"

export const description = "An interactive area chart for revenue"

interface ChartAreaInteractiveProps {
  revenueData: RevenueStatistics | null;
  loading: boolean;
}

// Generate chart data based on actual orders
const generateChartData = (revenueData: RevenueStatistics | null) => {
  if (!revenueData || !revenueData.orders || revenueData.orders.length === 0) return [];

  // Group orders by date
  const ordersByDate = new Map<string, { platformRevenue: number; sellerRevenue: number }>();

  revenueData.orders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    const existing = ordersByDate.get(date) || { platformRevenue: 0, sellerRevenue: 0 };

    ordersByDate.set(date, {
      platformRevenue: existing.platformRevenue + order.platformFee,
      sellerRevenue: existing.sellerRevenue + order.sellerReceived,
    });
  });

  // Convert to array and sort by date
  const data = Array.from(ordersByDate.entries())
    .map(([date, revenue]) => ({
      date,
      platformRevenue: revenue.platformRevenue,
      sellerRevenue: revenue.sellerRevenue,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // If we have orders, fill in gaps for the last 30 days to show context
  if (data.length > 0) {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const firstOrderDate = new Date(data[0].date);
    const startDate = firstOrderDate < thirtyDaysAgo ? thirtyDaysAgo : firstOrderDate;

    const filledData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = data.find(d => d.date === dateStr);

      filledData.push(existingData || {
        date: dateStr,
        platformRevenue: 0,
        sellerRevenue: 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledData;
  }

  return data;
};

const chartConfig = {
  revenue: {
    label: "Revenue",
  },
  platformRevenue: {
    label: "Platform Revenue",
    color: "hsl(271, 91%, 65%)",
  },
  sellerRevenue: {
    label: "Seller Revenue",
    color: "hsl(271, 91%, 45%)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({ revenueData, loading }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const chartData = React.useMemo(() => generateChartData(revenueData), [revenueData]);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 30
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    } else if (timeRange === "all") {
      return true; // Show all data
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Platform and seller revenue from orders
          </span>
          <span className="@[540px]/card:hidden">Revenue from orders</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="all">All Time</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all" className="rounded-lg">
                All Time
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillPlatform" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-platformRevenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-platformRevenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSeller" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sellerRevenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sellerRevenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => formatCurrency(value as number)}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sellerRevenue"
              type="natural"
              fill="url(#fillSeller)"
              stroke="var(--color-sellerRevenue)"
              stackId="a"
            />
            <Area
              dataKey="platformRevenue"
              type="natural"
              fill="url(#fillPlatform)"
              stroke="var(--color-platformRevenue)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
