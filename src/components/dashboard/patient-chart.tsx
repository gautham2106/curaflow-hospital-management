
'use client';
import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { subDays, format } from 'date-fns';

const monthData = [
  { name: 'Jan', bookings: 421, noShows: 25 },
  { name: 'Feb', bookings: 356, noShows: 20 },
  { name: 'Mar', bookings: 623, noShows: 40 },
  { name: 'Apr', bookings: 489, noShows: 30 },
  { name: 'May', bookings: 555, noShows: 35 },
  { name: 'Jun', bookings: 734, noShows: 45 },
  { name: 'Jul', bookings: 698, noShows: 50 },
  { name: 'Aug', bookings: 812, noShows: 55 },
  { name: 'Sep', bookings: 750, noShows: 48 },
  { name: 'Oct', bookings: 680, noShows: 42 },
  { name: 'Nov', bookings: 820, noShows: 60 },
  { name: 'Dec', bookings: 930, noShows: 65 },
];

const weekData = Array.from({ length: 7 }).map((_, i) => ({
  name: format(subDays(new Date(), 6 - i), 'EEE'), // Sun, Mon, Tue...
  bookings: Math.floor(Math.random() * 100) + 50,
  noShows: Math.floor(Math.random() * 15) + 2,
}));

const thirtyDayData = Array.from({ length: 30 }).map((_, i) => ({
    name: format(subDays(new Date(), 29 - i), 'MMM d'),
    bookings: Math.floor(Math.random() * 150) + 70,
    noShows: Math.floor(Math.random() * 20) + 5,
}));

interface PatientChartProps {
    filter: '7d' | '30d' | '1y';
}

export function PatientChart({ filter }: PatientChartProps) {
  const data = useMemo(() => {
    switch (filter) {
        case '7d':
            return weekData;
        case '30d':
            return thirtyDayData;
        case '1y':
            return monthData;
        default:
            return weekData;
    }
  }, [filter]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
            cursor={{fill: 'hsl(var(--muted))'}}
            contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))',
                borderRadius: 'var(--radius)'
            }}
        />
        <Legend />
        <Bar dataKey="bookings" name="Bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="noShows" name="No-Shows" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
