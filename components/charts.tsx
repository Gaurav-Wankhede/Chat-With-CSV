import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Radar,
  RadarChart,
  Treemap,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface ChartOptions {
  title?: string;
}

interface ChartProps {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'radial' | 'radar';
  chartData: ChartData[];
  options?: ChartOptions;
}

export const Charts = ({ type, chartData, options }: ChartProps) => {
  const commonProps = {
    height: 250,
    margin: { 
      top: 5, 
      right: 10, 
      left: 5, 
      bottom: 5 
    }
  };

  const chartTypes = {
    bar: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: '0.65rem' }} height={40} interval={0} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: '0.65rem' }} width={40} />
            <Tooltip wrapperStyle={{ fontSize: '0.75rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', marginTop: '10px' }} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ),
    line: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: '0.65rem' }} height={40} interval={0} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: '0.65rem' }} width={40} />
            <Tooltip wrapperStyle={{ fontSize: '0.75rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', marginTop: '10px' }} />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    ),
    pie: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart {...commonProps}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="30%"
              fill="#8884d8"
              label={{ fontSize: '0.65rem' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`hsl(${(index * 360) / chartData.length}, 70%, 50%)`} />
              ))}
            </Pie>
            <Tooltip wrapperStyle={{ fontSize: '0.75rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', marginTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    ),
    scatter: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={chartData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: '0.65rem' }} height={40} interval={0} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: '0.65rem' }} width={40} />
            <Tooltip wrapperStyle={{ fontSize: '0.75rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', marginTop: '10px' }} />
            <Scatter data={chartData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    ),
    area: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: '0.65rem' }} height={40} interval={0} angle={-45} textAnchor="end" />
            <YAxis tick={{ fontSize: '0.65rem' }} width={40} />
            <Tooltip wrapperStyle={{ fontSize: '0.75rem' }} />
            <Legend wrapperStyle={{ fontSize: '0.75rem', marginTop: '10px' }} />
            <Area type="monotone" dataKey="value" fill="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    ),
    radial: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart data={chartData} {...commonProps}>
            <RadialBar dataKey="value" fill="#8884d8" />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    ),
    radar: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} {...commonProps}>
            <Radar dataKey="value" fill="#8884d8" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    ),
    treemap: (
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={chartData} {...commonProps}>
            <Treemap dataKey="value" fill="#8884d8" />
          </Treemap>
        </ResponsiveContainer>
      </div>
    )
  };

  return (
    <div className="my-2 sm:my-3 md:my-4 p-2 sm:p-3 md:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {options?.title && (
        <h4 className="text-center mb-2 sm:mb-3 text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 font-medium">
          {options.title}
        </h4>
      )}
      <div className="w-full min-h-[300px] sm:min-h-[200px] h-[min(60vh,400px)] sm:h-[min(50vh,300px)]">
        {chartTypes[type] || (
          <p className="text-red-500 text-xs sm:text-sm">Unsupported chart type: {type}</p>
        )}
      </div>
    </div>
  );
}; 