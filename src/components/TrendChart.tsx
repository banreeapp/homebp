import React, { useState } from 'react';
import { BPRecord } from '../types/bloodPressure';
import { Sun, Moon, Info } from 'lucide-react';

interface TrendChartProps {
  records: BPRecord[];
  startDateStr: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ records, startDateStr }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: number;
    period: 'morning' | 'evening';
    sys: number;
    dia: number;
    pulse: number;
    x: number;
    ySys: number;
    yDia: number;
  } | null>(null);

  if (records.length === 0) return null;

  // Build 14 possible points (Day 1-7 x Morning & Evening)
  const points: Array<{
    day: number;
    period: 'morning' | 'evening';
    label: string;
    record?: BPRecord;
  }> = [];

  for (let d = 1; d <= 7; d++) {
    points.push({
      day: d,
      period: 'morning',
      label: `ว.${d} เช้า`,
      record: records.find(r => r.dayIndex === d && r.period === 'morning'),
    });
    points.push({
      day: d,
      period: 'evening',
      label: `ว.${d} เย็น`,
      record: records.find(r => r.dayIndex === d && r.period === 'evening'),
    });
  }

  // Chart dimensions
  const width = 800;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 50, left: 55 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // BP Scale: from 50 mmHg to 180 mmHg
  const minBP = 50;
  const maxBP = 180;

  const getY = (val: number) => {
    const clamped = Math.max(minBP, Math.min(maxBP, val));
    return padding.top + graphHeight - ((clamped - minBP) / (maxBP - minBP)) * graphHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index / (points.length - 1)) * graphWidth;
  };

  // Threshold lines for TSH HBPM
  const ySys135 = getY(135);
  const yDia85 = getY(85);

  // Filter valid data points
  const validPoints = points
    .map((p, idx) => ({
      ...p,
      x: getX(idx),
      ySys: p.record ? getY(p.record.avgSys) : null,
      yDia: p.record ? getY(p.record.avgDia) : null,
      sys: p.record?.avgSys,
      dia: p.record?.avgDia,
      pulse: p.record?.avgPulse,
    }))
    .filter(p => p.record);

  // SVG paths
  const sysPath = validPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySys}`)
    .join(' ');

  const diaPath = validPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yDia}`)
    .join(' ');

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 card-tactile space-y-4">
      
      {/* Chart Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-[#181A2E] font-display">
            กราฟแนวโน้มความดันโลหิต 7 วันต่อเนื่อง
          </h3>
          <p className="text-xs text-[#181A2E]/60">
            แสดงค่าตัวบน (SYS) และตัวล่าง (DIA) เทียบกับเส้นมาตรฐาน TSH (135/85 mmHg)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-xs font-bold text-[#181A2E]/80">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#b7102a]" />
            <span>SYS (ตัวบน)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#006948]" />
            <span>DIA (ตัวล่าง)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-red-500" />
            <span className="text-[11px] text-red-600">เกณฑ์ 135</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-emerald-600" />
            <span className="text-[11px] text-emerald-600">เกณฑ์ 85</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[650px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
            
            {/* Grid horizontal lines */}
            {[60, 80, 85, 100, 120, 135, 140, 160, 180].map((val) => {
              const y = getY(val);
              const isTshSys = val === 135;
              const isTshDia = val === 85;

              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke={isTshSys ? '#b7102a' : isTshDia ? '#006948' : '#181A2E'}
                    strokeOpacity={isTshSys || isTshDia ? 0.7 : 0.08}
                    strokeDasharray={isTshSys || isTshDia ? '5,5' : undefined}
                    strokeWidth={isTshSys || isTshDia ? 1.5 : 1}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fontWeight={isTshSys || isTshDia ? '800' : '500'}
                    fill={isTshSys ? '#b7102a' : isTshDia ? '#006948' : '#181A2E'}
                    fillOpacity={isTshSys || isTshDia ? 1 : 0.5}
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Threshold Labels on Right */}
            <text
              x={width - padding.right + 6}
              y={ySys135 + 3}
              fontSize="9"
              fontWeight="bold"
              fill="#b7102a"
            >
              TSH 135
            </text>
            <text
              x={width - padding.right + 6}
              y={yDia85 + 3}
              fontSize="9"
              fontWeight="bold"
              fill="#006948"
            >
              TSH 85
            </text>

            {/* Shaded Target Safe Zone (< 135 and < 85) */}
            <rect
              x={padding.left}
              y={ySys135}
              width={graphWidth}
              height={getY(minBP) - ySys135}
              fill="#006948"
              fillOpacity="0.03"
            />

            {/* Connecting Lines */}
            {sysPath && (
              <path
                d={sysPath}
                fill="none"
                stroke="#b7102a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {diaPath && (
              <path
                d={diaPath}
                fill="none"
                stroke="#006948"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* X-Axis Vertical dividers & Labels */}
            {points.map((p, idx) => {
              const x = getX(idx);
              const isMorning = p.period === 'morning';

              return (
                <g key={idx}>
                  {/* Subtle column divider */}
                  {isMorning && idx > 0 && (
                    <line
                      x1={x - graphWidth / (points.length * 2)}
                      y1={padding.top}
                      x2={x - graphWidth / (points.length * 2)}
                      y2={height - padding.bottom}
                      stroke="#181A2E"
                      strokeOpacity="0.06"
                    />
                  )}

                  {/* X Labels */}
                  <text
                    x={x}
                    y={height - padding.bottom + 16}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight={p.record ? '700' : '400'}
                    fill="#181A2E"
                    fillOpacity={p.record ? 0.9 : 0.4}
                  >
                    ว.{p.day}
                  </text>
                  <text
                    x={x}
                    y={height - padding.bottom + 28}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill={isMorning ? '#d97706' : '#4338ca'}
                  >
                    {isMorning ? 'เช้า' : 'เย็น'}
                  </text>
                </g>
              );
            })}

            {/* Data Points */}
            {validPoints.map((p, idx) => {
              if (p.ySys === null || p.yDia === null) return null;
              const isHovered = hoveredPoint?.day === p.day && hoveredPoint?.period === p.period;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      day: p.day,
                      period: p.period,
                      sys: p.sys!,
                      dia: p.dia!,
                      pulse: p.pulse!,
                      x: p.x,
                      ySys: p.ySys!,
                      yDia: p.yDia!,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Connecting bar between SYS and DIA */}
                  <line
                    x1={p.x}
                    y1={p.ySys}
                    x2={p.x}
                    y2={p.yDia}
                    stroke="#181A2E"
                    strokeOpacity="0.15"
                    strokeWidth="1.5"
                  />

                  {/* SYS Point */}
                  <circle
                    cx={p.x}
                    cy={p.ySys}
                    r={isHovered ? 6.5 : 4.5}
                    fill="#b7102a"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />

                  {/* DIA Point */}
                  <circle
                    cx={p.x}
                    cy={p.yDia}
                    r={isHovered ? 6.5 : 4.5}
                    fill="#006948"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })}

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={height - padding.bottom}
                  stroke="#181A2E"
                  strokeOpacity="0.3"
                  strokeDasharray="3,3"
                />
                <rect
                  x={Math.min(width - 150, Math.max(10, hoveredPoint.x - 70))}
                  y={padding.top}
                  width="140"
                  height="64"
                  rx="10"
                  fill="#181A2E"
                  fillOpacity="0.95"
                />
                <text
                  x={Math.min(width - 150, Math.max(10, hoveredPoint.x - 70)) + 70}
                  y={padding.top + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  วันที่ {hoveredPoint.day} ({hoveredPoint.period === 'morning' ? 'เช้า' : 'เย็น'})
                </text>
                <text
                  x={Math.min(width - 150, Math.max(10, hoveredPoint.x - 70)) + 70}
                  y={padding.top + 34}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="900"
                  fill="#ffffff"
                >
                  {hoveredPoint.sys} / {hoveredPoint.dia} mmHg
                </text>
                <text
                  x={Math.min(width - 150, Math.max(10, hoveredPoint.x - 70)) + 70}
                  y={padding.top + 50}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#85f8c4"
                  fontWeight="bold"
                >
                  ชีพจร: {hoveredPoint.pulse} bpm
                </text>
              </g>
            )}

          </svg>
        </div>
      </div>

    </div>
  );
};
