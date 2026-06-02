import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Calendar that supports either selecting one day or multiple days, depending
// on the multiSelect prop. Dates are exchanged as 'YYYY-MM-DD' strings so they
// serialize cleanly to Firestore.

interface CalendarProps {
  selected: string[];
  onChange: (dates: string[]) => void;
  multiSelect: boolean;
  minDate?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function toDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function todayKey(): string {
  const t = new Date();
  return toDateKey(t.getFullYear(), t.getMonth(), t.getDate());
}

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onChange,
  multiSelect,
  minDate,
}) => {
  const initial = useMemo(() => {
    const ref = selected[0] ? new Date(selected[0]) : new Date();
    return { year: ref.getFullYear(), month: ref.getMonth() };
  }, []);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const floor = minDate ?? todayKey();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function go(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  }

  function pick(day: number) {
    const key = toDateKey(year, month, day);
    if (key < floor) return;
    if (!multiSelect) {
      onChange([key]);
      return;
    }
    if (selected.includes(key)) {
      onChange(selected.filter((d) => d !== key).sort());
    } else {
      onChange([...selected, key].sort());
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => go(-1)} style={styles.navBtn}>
          <Text style={styles.navText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <TouchableOpacity onPress={() => go(1)} style={styles.navBtn}>
          <Text style={styles.navText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={styles.weekday}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={i} style={styles.cell} />;
          }
          const key = toDateKey(year, month, day);
          const isSelected = selected.includes(key);
          const isDisabled = key < floor;
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                styles.dayCell,
                isSelected && styles.dayCellSelected,
                isDisabled && styles.dayCellDisabled,
              ]}
              onPress={() => pick(day)}
              disabled={isDisabled}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                  isDisabled && styles.dayTextDisabled,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected.length > 0 && (
        <Text style={styles.summary}>
          {multiSelect
            ? `${selected.length} day${selected.length === 1 ? '' : 's'} selected`
            : `Selected: ${selected[0]}`}
        </Text>
      )}
    </View>
  );
};

const CELL = `${100 / 7}%`;

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#eef2ff',
  },
  navText: {
    fontSize: 18,
    color: '#1a4ed6',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    width: CELL,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: CELL,
    aspectRatio: 1,
    padding: 2,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellSelected: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: '#111',
    fontSize: 14,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextDisabled: {
    color: '#999',
  },
  summary: {
    marginTop: 8,
    color: '#374151',
    fontSize: 12,
  },
});
