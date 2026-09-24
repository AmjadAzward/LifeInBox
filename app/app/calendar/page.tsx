'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Download,
} from 'lucide-react';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { MobileHeader } from '@/components/app/mobile-header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLifeItems } from '@/hooks/use-life-items';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/category-icons';
import { CATEGORY_LABELS, type LifeItemCategory } from '@/lib/types';
import { getPrimaryDate } from '@/lib/format';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

export default function CalendarPage() {
  const { items: mockLifeItems } = useLifeItems();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('month');

  const events = useMemo(() => {
    const result: {
      date: Date;
      lifeItemId: string;
      title: string;
      category: LifeItemCategory;
      dateType: string;
    }[] = [];

    mockLifeItems.forEach((item) => {
      const dates = [
        { date: item.dueDate, type: 'Due' },
        { date: item.eventDate, type: 'Event' },
        { date: item.expiryDate, type: 'Expiry' },
      ].filter((d) => d.date);

      dates.forEach(({ date, type }) => {
        if (date) {
          try {
            const d = parseISO(date);
            result.push({
              date: d,
              lifeItemId: item.id,
              title: item.title,
              category: item.category,
              dateType: type,
            });
          } catch {
            /* skip */
          }
        }
      });
    });

    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [mockLifeItems]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(e.date, day));

  const agendaEvents = events.filter(
    (e) => e.date >= monthStart && e.date <= monthEnd
  );
  const weekStart=startOfWeek(currentDate,{weekStartsOn:1}),weekEnd=endOfWeek(currentDate,{weekStartsOn:1});
  const visibleAgenda=view==='day'?events.filter((event)=>isSameDay(event.date,currentDate)):view==='week'?events.filter((event)=>event.date>=weekStart&&event.date<=weekEnd):agendaEvents;

  return (
    <div>
      <MobileHeader title="Calendar" showBack={false} />

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your important dates at a glance.
            </p>
          </div>
          <div className="flex gap-1 p-1 rounded-lg bg-muted">
            <Button variant="outline" size="sm" asChild><a href="/api/calendar/ics"><Download className="mr-1 h-4 w-4"/>Export</a></Button>
            <button
              onClick={() => setView('month')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'month'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              Month
            </button>
            <button onClick={()=>setView('week')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',view==='week'?'bg-card text-foreground shadow-sm':'text-muted-foreground')}>Week</button>
            <button onClick={()=>setView('day')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',view==='day'?'bg-card text-foreground shadow-sm':'text-muted-foreground')}>Day</button>
            <button
              onClick={() => setView('agenda')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                view === 'agenda'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              <List className="h-4 w-4" />
              Agenda
            </button>
          </div>
        </div>

        {/* Mobile view toggle */}
        <div className="lg:hidden flex gap-1 p-1 rounded-lg bg-muted mb-4">
          <button
            onClick={() => setView('month')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              view === 'month'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            Month
          </button>
          <button onClick={()=>setView('week')} className={cn('flex-1 rounded-md px-2 py-1.5 text-sm',view==='week'?'bg-card shadow-sm':'text-muted-foreground')}>Week</button>
          <button onClick={()=>setView('day')} className={cn('flex-1 rounded-md px-2 py-1.5 text-sm',view==='day'?'bg-card shadow-sm':'text-muted-foreground')}>Day</button>
          <button
            onClick={() => setView('agenda')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              view === 'agenda'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            <List className="h-4 w-4" />
            Agenda
          </button>
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="px-3"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === 'month' ? (
          <MonthView
            days={days}
            currentDate={currentDate}
            getEventsForDay={getEventsForDay}
          />
        ) : (
          <AgendaView events={visibleAgenda} />
        )}
      </div>
    </div>
  );
}

function MonthView({
  days,
  currentDate,
  getEventsForDay,
}: {
  days: Date[];
  currentDate: Date;
  getEventsForDay: (day: Date) => {
    date: Date;
    lifeItemId: string;
    title: string;
    category: LifeItemCategory;
    dateType: string;
  }[];
}) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[11px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[64px] sm:min-h-[80px] p-1 border-b border-r border-border last:border-r-0',
                !inMonth && 'bg-muted/30',
                idx >= 7 && idx < 14 ? '' : ''
              )}
            >
              <Link
                href={`/app/remember?date=${format(day,'yyyy-MM-dd')}`}
                aria-label={`Add item on ${format(day,'MMMM d, yyyy')}`}
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs',
                  today
                    ? 'bg-primary text-primary-foreground font-bold'
                    : inMonth
                    ? 'text-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                {format(day, 'd')}
              </Link>

              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e, i) => {
                  const colors = CATEGORY_COLORS[e.category];
                  return (
                    <Link
                      key={i}
                      href={`/app/my-life/${e.lifeItemId}`}
                      className="block"
                    >
                      <div
                        className={cn(
                          'flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate hover:opacity-80 transition-opacity',
                          colors.bg,
                          colors.text
                        )}
                      >
                        <span
                          className={cn(
                            'h-1.5 w-1.5 rounded-full shrink-0',
                            colors.dot
                          )}
                        />
                        <span className="truncate">{e.title}</span>
                      </div>
                    </Link>
                  );
                })}
                {dayEvents.length > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaView({
  events,
}: {
  events: {
    date: Date;
    lifeItemId: string;
    title: string;
    category: LifeItemCategory;
    dateType: string;
  }[];
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No events this month.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((e, idx) => {
        const colors = CATEGORY_COLORS[e.category];
        const Icon = CATEGORY_ICONS[e.category];
        return (
          <Link
            key={idx}
            href={`/app/my-life/${e.lifeItemId}`}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all"
          >
            <div className="flex flex-col items-center justify-center w-14 shrink-0">
              <span className="text-xs text-muted-foreground">
                {format(e.date, 'EEE')}
              </span>
              <span className="text-lg font-bold text-foreground">
                {format(e.date, 'd')}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {format(e.date, 'MMM')}
              </span>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colors.bg, colors.text)}>
              <Icon className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {e.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {CATEGORY_LABELS[e.category]} · {e.dateType}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
