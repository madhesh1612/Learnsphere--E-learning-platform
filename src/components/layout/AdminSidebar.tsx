import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Settings,
  ChevronLeft,
  Users,
  FileQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/quizzes', label: 'Quizzes', icon: FileQuestion },
  { href: '/admin/reporting', label: 'Reporting', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              LearnSphere
            </span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.href || 
            (link.href !== '/admin' && location.pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Link
          to="/"
          className={cn(
            'flex items-center gap-3 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <Users className="h-4 w-4" />
          {!collapsed && <span>View Website</span>}
        </Link>
      </div>
    </aside>
  );
}
