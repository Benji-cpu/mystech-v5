"use client";

import { cn } from "@/lib/utils";
import type { ContentViewProps } from "../mirror-types";
import { MOCK_ACTIVITY } from "../../_shared/mock-data-v1";
import { MT } from "../mirror-theme";

// Simple inline SVG icons for each activity type
function ActivityIcon({ icon }: { icon: string }) {
  const color = MT.gold;
  const size = 12;

  if (icon === "sparkles") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
        <path d="M19 3l.75 2.25L22 6l-2.25.75L19 9l-.75-2.25L16 6l2.25-.75z" />
        <path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5z" />
      </svg>
    );
  }
  if (icon === "layers") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    );
  }
  if (icon === "plus") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }
  if (icon === "palette") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="13.5" cy="6.5" r="0.5" fill={color} />
        <circle cx="17.5" cy="10.5" r="0.5" fill={color} />
        <circle cx="8.5" cy="7.5" r="0.5" fill={color} />
        <circle cx="6.5" cy="12.5" r="0.5" fill={color} />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    );
  }
  return null;
}

export function ActivityFeed({ className }: ContentViewProps) {
  // Limit to 3 items to avoid overflow
  const activities = MOCK_ACTIVITY.slice(0, 3);

  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center",
        className
      )}
      style={{ background: MT.bg }}
    >
      <div className="flex flex-col p-4 w-full gap-2 max-w-[92%]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-px" style={{ background: MT.goldDim }} />
          <p
            className="text-xs tracking-widest uppercase font-semibold"
            style={{ color: MT.gold }}
          >
            Recent Activity
          </p>
          <div className="w-3 h-px" style={{ background: MT.goldDim }} />
        </div>

        {/* Activity list */}
        <div className="flex flex-col gap-1.5">
          {activities.map((activity, i) => (
            <div
              key={activity.id}
              className="flex items-center gap-2.5 p-2 rounded"
              style={{
                background:
                  i === 0
                    ? "rgba(201,169,78,0.06)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${i === 0 ? MT.goldDim : MT.border}`,
              }}
            >
              {/* Icon circle */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(201,169,78,0.1)",
                  border: `1px solid ${MT.goldDim}`,
                }}
              >
                <ActivityIcon icon={activity.icon} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold truncate"
                  style={{ color: MT.text }}
                >
                  {activity.title}
                </p>
                <p
                  className="text-[11px] truncate"
                  style={{ color: MT.textDim }}
                >
                  {activity.subtitle}
                </p>
              </div>

              {/* Timestamp */}
              <p
                className="text-[11px] shrink-0"
                style={{ color: MT.textDim }}
              >
                {activity.timestamp.replace(" ago", "")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
