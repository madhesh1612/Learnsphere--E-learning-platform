import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, TrendingUp, CheckCircle } from 'lucide-react';

export default function AdminReporting() {
  const stats = [
    { title: 'Total Participants', value: '0', icon: Users },
    { title: 'Yet to Start', value: '0', icon: Clock },
    { title: 'In Progress', value: '0', icon: TrendingUp },
    { title: 'Completed', value: '0', icon: CheckCircle },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Reporting</h1>
        <p className="text-muted-foreground mt-1">Track learner progress across your courses</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learner Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No enrollment data yet. Students will appear here once they enroll in your courses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
