import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getCategoriesWithCourses } from "@/lib/queries";
import { firstBookableDay, getCalendarRange, monthGrid } from "@/lib/calendar";
import { BookingCalendar, MAX_BOOKING_DAYS } from "@/components/forms/booking-calendar";
import { PageHero } from "@/components/ui";
import { addDays, todayISO } from "@/lib/format";

export const metadata: Metadata = {
  title: "Volné termíny lektora",
  description: "Vyberte si volné dny lektora a zarezervujte firemní školení Excel, Microsoft 365 nebo Copilot.",
};

const MONTHS_AHEAD = 12;

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ mesic?: string }> }) {
  const { mesic } = await searchParams;
  const [s, { categories }] = await Promise.all([getSettings(), getCategoriesWithCourses()]);
  const today = todayISO();
  const ty = Number(today.slice(0, 4));
  const tm = Number(today.slice(5, 7));
  const months = Array.from({ length: MONTHS_AHEAD + 1 }, (_, i) => {
    const d = new Date(Date.UTC(ty, tm - 1 + i, 1));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  });
  const lastMonth = months[months.length - 1];
  const lastGrid = monthGrid(lastMonth.year, lastMonth.month);
  // Celý rok najednou – výběr dnů tak přežije přepínání měsíců. Pár dní navíc kvůli „kde jsem den předem“.
  const from = addDays(monthGrid(ty, tm)[0], -4);
  const to = addDays(lastGrid[lastGrid.length - 1], 4);
  const info = await getCalendarRange(from, to, s.bookingWeekends === "1", firstBookableDay());
  // Veřejně jen stav a město – žádné jméno klienta ani poznámky
  const days = Object.fromEntries(info.map((d) => [d.date, { state: d.state, city: d.state === "past" ? "" : d.city }]));
  const initial = mesic ? Math.max(0, months.findIndex((m) => `${m.year}-${String(m.month).padStart(2, "0")}` === mesic)) : 0;
  const options = categories.flatMap((c) => c.courses.map((k) => ({ id: k.id, title: k.title, group: c.name })));

  return (
    <>
      <PageHero eyebrow="Rezervace lektora" title="Volné termíny pro firemní školení" text={s.bookingIntro} />
      <div className="container-x py-12">
        <BookingCalendar
          months={months}
          initialMonth={initial}
          days={days}
          travelNote={s.bookingTravelNote}
          courses={options}
          maxDays={MAX_BOOKING_DAYS}
        />
      </div>
    </>
  );
}
