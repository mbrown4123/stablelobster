import { useRef, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

function VoteGraph({ data }) {
  const chartRef = useRef(null)

  const chartData = (data || []).map(point => ({
    time: point.hour,
    safe: point.safe,
    broken: point.broken,
    total: point.safe + point.broken
  }))

  if (!data || data.length === 0) {
    return (
      <div className="vote-graph">
        <h3>24-Hour Vote Activity</h3>
        <div className="no-data">
          <span className="no-data-icon">📊</span>
          <span>No vote data available yet</span>
        </div>
      </div>
    )
  }

  return (
    <div className="vote-graph">
      <div className="graph-header">
        <h3>24-Hour Vote Activity</h3>
        <div className="graph-legend">
          <span className="legend-item">
            <span className="dot safe"></span>
            <span>Safe</span>
          </span>
          <span className="legend-item">
            <span className="dot broken"></span>
            <span>Broken</span>
          </span>
        </div>
      </div>

      <div className="chart-container" ref={chartRef}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart 
            data={chartData} 
            margin={{ top: 12, right: 24, left: 0, bottom: 8 }}
          >
            <CartesianGrid 
              strokeDasharray="4 4" 
              stroke="var(--border-subtle)" 
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="var(--text-muted)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(time) => {
                const date = new Date(time)
                return date.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })
              }}
              dy={8}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={12}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              dx={-8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                padding: '0.75rem'
              }}
              itemStyle={{
                fontSize: '0.875rem'
              }}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleTimeString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit', 
                  minute: '2-digit'
                })
              }}
              formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '16px',
                fontSize: '13px',
                gap: '24px'
              }} 
              formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
              iconType="circle"
              iconSize={8}
            />
            <Line
              type="monotone"
              dataKey="safe"
              stroke="var(--cyan-bright)"
              strokeWidth={3}
              dot={{ 
                fill: 'var(--cyan-bright)', 
                r: 5,
                strokeWidth: 2,
                stroke: 'var(--bg-deep)'
              }}
              activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--cyan-bright)' }}
              connectNulls={true}
            />
            <Line
              type="monotone"
              dataKey="broken"
              stroke="var(--coral-bright)"
              strokeWidth={3}
              dot={{ 
                fill: 'var(--coral-bright)', 
                r: 5,
                strokeWidth: 2,
                stroke: 'var(--bg-deep)'
              }}
              activeDot={{ r: 7, strokeWidth: 0, fill: 'var(--coral-bright)' }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="graph-summary">
        <SummaryItem 
          label="Peak Safe" 
          value={Math.max(...chartData.map(d => d.safe), 0)}
          color="var(--cyan-bright)"
        />
        <SummaryItem 
          label="Peak Broken" 
          value={Math.max(...chartData.map(d => d.broken), 0)}
          color="var(--coral-bright)"
        />
        <SummaryItem 
          label="Total Votes" 
          value={chartData.reduce((acc, d) => acc + d.total, 0)}
          color="var(--text-primary)"
        />
      </div>

      <style>{`
        .vote-graph {
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.75rem;
          width: 100%;
        }

        .graph-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .graph-header h3 {
          margin: 0;
          font-size: 1.125rem;
          color: var(--text-primary);
        }

        .graph-legend {
          display: flex;
          gap: 1.5rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        .dot.safe {
          background: var(--cyan-bright);
        }

        .dot.broken {
          background: var(--coral-bright);
        }

        .chart-container {
          width: 100%;
          min-height: 280px;
        }

        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-muted);
          font-style: italic;
          gap: 0.5rem;
        }

        .no-data-icon {
          font-size: 2rem;
          opacity: 0.5;
        }

        .graph-summary {
          display: flex;
          justify-content: space-around;
          padding-top: 1.25rem;
          margin-top: 1.25rem;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          padding: 0.75rem 1rem;
          background: var(--bg-elevated);
          border-radius: 0.625rem;
          min-width: 100px;
        }

        .summary-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        .summary-value {
          font-size: 1.375rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .vote-graph {
            padding: 1.25rem;
          }

          .graph-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .graph-legend {
            width: 100%;
            justify-content: space-between;
          }

          .graph-summary {
            flex-direction: column;
            align-items: center;
          }

          .summary-item {
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  )
}

function SummaryItem({ label, value, color }) {
  return (
    <div className="summary-item">
      <span className="summary-label">{label}</span>
      <span className="summary-value" style={{ color }}>{value}</span>
    </div>
  )
}

export default VoteGraph
