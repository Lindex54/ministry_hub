"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { EmptyState, LoadingState } from "@/components/shared/StatusState";
import { cn } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function EChart({ option, loading = false, empty = false, className, height = 320 }) {
  const { resolvedTheme } = useTheme();
  const [colors, setColors] = useState(null);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    setColors({
      text: styles.getPropertyValue("--foreground").trim(),
      muted: styles.getPropertyValue("--muted-foreground").trim(),
      border: styles.getPropertyValue("--border").trim(),
      surface: styles.getPropertyValue("--popover").trim(),
      series: [1, 2, 3, 4, 5].map((index) =>
        styles.getPropertyValue(`--chart-${index}`).trim()
      ),
    });
  }, [resolvedTheme]);

  const themedOption = useMemo(() => {
    if (!colors) return option;
    const axisTheme = {
      axisLabel: { color: colors.muted },
      axisLine: { lineStyle: { color: colors.border } },
      splitLine: { lineStyle: { color: colors.border, opacity: 0.55 } },
    };
    const mergeAxis = (axis) => {
      if (Array.isArray(axis)) return axis.map((item) => ({ ...axisTheme, ...item }));
      return axis ? { ...axisTheme, ...axis } : axis;
    };

    return {
      ...option,
      color: colors.series,
      backgroundColor: "transparent",
      textStyle: { color: colors.text, fontFamily: "Manrope, sans-serif" },
      tooltip: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
        textStyle: { color: colors.text },
        ...option.tooltip,
      },
      legend: option.legend ? { textStyle: { color: colors.muted }, ...option.legend } : { show: false },
      xAxis: mergeAxis(option.xAxis),
      yAxis: mergeAxis(option.yAxis),
    };
  }, [colors, option]);

  if (loading) return <LoadingState rows={4} />;
  if (empty) {
    return <EmptyState title="No chart data" description="Data will appear here when it becomes available." />;
  }

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ReactECharts option={themedOption} style={{ height: "100%", width: "100%" }} notMerge />
    </div>
  );
}

