import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getCategoriesWithCourses } from "@/lib/queries";
import { getCalendarRange, monthBounds, monthGrid } from "@/lib/calendar";
import { BookingCalendar } from "@/components/forms/booking-calendar";
import { PageHero } from "@/components/ui";
import { todayISO } from "@/lib/format";

export const metadata: Metadata = {
  title: "Volné termíny lektora",
  description: "Vyberte si volný den lektora a zarezervujte firemní školení Excel, Microsoft 365 nebo Copilot.",
};

const MAX_MONTHS_AHEAD = 12;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ mesic?: string }> }) {
  const { mesic } = await searchParams;
  const [s, { categories }] = await Promise.all([getSettings(), getCategoriesWithCourses()]);
  const today = todayISO();
  const ty = Number(today.slice(0, 4));
  const tm = Number(today.slice(5, 7));
  let y = ty;
  let m = tm;
  if (mesic && /^\d{4}-\d{2}$/.test(mesic)) {
    y = Number(mesic.slice(0, 4));
    m = Number(mesic.slice(5, 7));
  }
  const offset = (y - ty) * 12 + (m - tm);
  if (offset < 0 || offset > MAX_MONTHS_AHEAD || m < 1 || m > 12) {
    y = ty;
    m = tm;
  }
  const curOffset = (y - ty) * 12 + (m - tm);
  const grid = monthGrid(y, m);
  const info = await getCalendarRange(grid[0], grid[grid.length - 1], s.bookingWeekends === "1");
  const { first, last } = monthBounds(y, m);
  const days = info.map((d) => ({ date: d.date, state: d.state, inMonth: d.date >= first && d.date <= last }));
  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    return `/kalendar?mesic=${d.toISOString().slice(0, 7)}`;
  };
  const options = categories.flatMap((c) => c.courses.map((k) => ({ id: k.id, title: k.title, group: c.name })));

  return (
    <>
      <PageHero eyebrow="Rezervace lektora" title="Volné termíny pro firemní školení" text={s.bookingIntro} />
      <div className="container-x py-12">
        <BookingCalendar
          key={`${y}-${m}`}
          year={y}
          month={m}
          days={days}
          courses={options}
          prevHref={curOffset > 0 ? shift(-1) : null}
          nextHref={curOffset < MAX_MONTHS_AHEAD ? shift(1) : null}
        />
      </div>
    </>
  );
}
