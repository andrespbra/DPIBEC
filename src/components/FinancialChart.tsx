import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { fmtMoeda } from '../lib/calculos';

interface FinancialChartProps {
  data: Array<{
    name: string;
    Receitas: number;
    Despesas: number;
    Folha: number;
  }>;
}

export default function FinancialChart({ data }: FinancialChartProps) {
  // Safe default if no data is provided
  const chartData = data.length > 0 ? data : [
    { name: 'Janeiro', Receitas: 24000, Despesas: 8000, Folha: 12000 },
    { name: 'Fevereiro', Receitas: 27000, Despesas: 9500, Folha: 12000 },
    { name: 'Março', Receitas: 29000, Despesas: 11000, Folha: 12500 },
    { name: 'Abril', Receitas: 32000, Despesas: 13000, Folha: 13000 },
    { name: 'Maio', Receitas: 35000, Despesas: 14500, Folha: 14500 },
    { name: 'Junho', Receitas: 38050, Despesas: 16000, Folha: 15300 },
  ];

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-purple-950 text-white p-3.5 border border-purple-800 rounded-lg shadow-xl text-xs font-mono">
          <p className="font-bold text-amber-400 mb-1.5 font-sans text-sm">{label}</p>
          {payload.map((p: any, i: number) => (
            <div key={i} className="flex justify-between space-x-6 py-0.5">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span className="font-bold">{fmtMoeda(p.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Histórico de Fluxo Comparativo</h3>
          <p className="text-xs text-gray-500">Resultados mensais consolidados da empresa (Regime de Caixa)</p>
        </div>
        <div className="flex space-x-3 mt-3 sm:mt-0 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-purple-750 rounded-full inline-block"></span>
            <span className="text-gray-600">Recepção</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-rose-500 rounded-full inline-block"></span>
            <span className="text-gray-600">Despesas</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 bg-amber-500 rounded-full inline-block"></span>
            <span className="text-gray-605">Salários</span>
          </div>
        </div>
      </div>

      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              dy={10}
            />
            <YAxis 
              tickFormatter={formatYAxis} 
              stroke="#6b7280" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
            />
            <Bar 
              name="Receita Realizada" 
              dataKey="Receitas" 
              fill="#5b21b6" // Brand Purple
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              name="Contas Operacionais" 
              dataKey="Despesas" 
              fill="#f43f5e" // Rose 500
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              name="Folha Líquida" 
              dataKey="Folha" 
              fill="#d97706" // Amber 600
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
