import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatsCard = ({ title, value, change, icon: Icon, trend = 'neutral' }: StatsCardProps) => {
  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  const trendBg = {
    up: 'bg-green-50 text-green-700',
    down: 'bg-red-50 text-red-700',
    neutral: 'bg-gray-50 text-gray-700'
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className={trendBg[trend]}>
              {change.value > 0 ? '+' : ''}{change.value}%
            </Badge>
            <p className="text-xs text-muted-foreground">
              vs {change.period}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};