// Time utility
// - to convert 24 hour time functions to 12-hour format
// - parse opening hours string into structured format (moved from clinic-info.tsx)
// - extract closing time from hours
// - determine if clinic is currently open based on operating hours
// - convert time string to minutes since midnight


// convert 24-hour time to 12-hour format
export function convertTo12Hour(time24: string): string {
    if (!time24 || !time24.includes(':')) {
        return time24;
    }

    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const min = minutes;

    if (isNaN(hour) || hour < 0 || hour > 23) {
        return time24; // Return original if invalid
    }

    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${hour12}:${min} ${ampm}`;
}

// convert time range to 12-hour format
export function convertTimeRangeTo12Hour(timeRange: string): string {
    if (!timeRange || timeRange === 'Closed' || timeRange === '24 hours') {
        return timeRange;
    }

    if (timeRange.includes('-')) {
        const [start, end] = timeRange.split('-');
        return `${convertTo12Hour(start.trim())} - ${convertTo12Hour(end.trim())}`;
    }

    return timeRange;
}

// parse opening hours string into structured format
export function parseOpeningHours(hours?: string) {
    if (!hours || hours === "N/A" || hours === "Unknown" || hours.trim() === "") {
        return null;
    }

    try {
        const daysMap: { [key: string]: string } = {
            'Mo': 'Monday',
            'Tu': 'Tuesday',
            'We': 'Wednesday',
            'Th': 'Thursday',
            'Fr': 'Friday',
            'Sa': 'Saturday',
            'Su': 'Sunday'
        };

        // handle 24/7
        if (hours === "24/7") {
            return Array(7).fill(0).map((_, i) => ({
                day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
                hours: "24 hours"
            }));
        }

        // handle "Mo-Fr HH:MM-HH:MM" format
        const weekdayPattern = /^Mo-Fr\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/;
        const weekdayMatch = hours.match(weekdayPattern);
        if (weekdayMatch) {
            const [, startHour, startMin, endHour, endMin] = weekdayMatch;
            const timeStr = `${startHour}:${startMin} - ${endHour}:${endMin}`;
            return [
                { day: "Monday", hours: timeStr },
                { day: "Tuesday", hours: timeStr },
                { day: "Wednesday", hours: timeStr },
                { day: "Thursday", hours: timeStr },
                { day: "Friday", hours: timeStr },
                { day: "Saturday", hours: "Closed" },
                { day: "Sunday", hours: "Closed" },
            ];
        }

        // handle "Mo-Su HH:MM-HH:MM" format (all days same hours)
        const allDaysPattern = /^Mo-Su\s+(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/;
        const allDaysMatch = hours.match(allDaysPattern);
        if (allDaysMatch) {
            const [, startHour, startMin, endHour, endMin] = allDaysMatch;
            const timeStr = `${startHour}:${startMin} - ${endHour}:${endMin}`;
            return Array(7).fill(0).map((_, i) => ({
                day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
                hours: timeStr
            }));
        }

        // handle semicolon-separated format like "Mo 09:00-17:00; Tu 09:00-17:00; We off"
        if (hours.includes(';')) {
            const schedule = [
                { day: "Monday", hours: "Closed" },
                { day: "Tuesday", hours: "Closed" },
                { day: "Wednesday", hours: "Closed" },
                { day: "Thursday", hours: "Closed" },
                { day: "Friday", hours: "Closed" },
                { day: "Saturday", hours: "Closed" },
                { day: "Sunday", hours: "Closed" },
            ];

            const parts = hours.split(';');
            parts.forEach(part => {
                const trimmed = part.trim();

                // handle day ranges like "Mo-Fr 09:00-17:00"
                const rangePattern = /^(Mo|Tu|We|Th|Fr|Sa|Su)-(Mo|Tu|We|Th|Fr|Sa|Su)\s+(.+)$/;
                const rangeMatch = trimmed.match(rangePattern);
                if (rangeMatch) {
                    const [, startDay, endDay, timeStr] = rangeMatch;
                    const dayOrder = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
                    const startIdx = dayOrder.indexOf(startDay);
                    const endIdx = dayOrder.indexOf(endDay);

                    if (startIdx !== -1 && endIdx !== -1) {
                        for (let i = startIdx; i <= endIdx; i++) {
                            const dayName = daysMap[dayOrder[i]];
                            const scheduleIdx = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(dayName);
                            if (scheduleIdx !== -1) {
                                schedule[scheduleIdx].hours = timeStr.includes('off') ? 'Closed' : timeStr;
                            }
                        }
                    }
                    return;
                }

                // handle individual days like "Mo 09:00-17:00" or "We off"
                for (const [abbrev, fullDay] of Object.entries(daysMap)) {
                    if (trimmed.startsWith(abbrev + ' ')) {
                        const timeOnly = trimmed.substring(abbrev.length + 1);
                        const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(fullDay);
                        if (dayIndex !== -1) {
                            schedule[dayIndex].hours = timeOnly.includes('off') ? 'Closed' : timeOnly;
                        }
                        break;
                    }
                }
            });

            return schedule;
        }

        // handle simple time ranges like "09:00-17:00" (apply to all days)
        const simpleTimePattern = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
        if (simpleTimePattern.test(hours)) {
            return Array(7).fill(0).map((_, i) => ({
                day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
                hours: hours
            }));
        }

        // handle formats like "Mo,Tu,We,Th,Fr 09:00-17:00"
        const commaPattern = /^([A-Za-z,]+)\s+(\d{1,2}:\d{2}-\d{1,2}:\d{2})$/;
        const commaMatch = hours.match(commaPattern);
        if (commaMatch) {
            const [, daysList, timeStr] = commaMatch;
            const schedule = [
                { day: "Monday", hours: "Closed" },
                { day: "Tuesday", hours: "Closed" },
                { day: "Wednesday", hours: "Closed" },
                { day: "Thursday", hours: "Closed" },
                { day: "Friday", hours: "Closed" },
                { day: "Saturday", hours: "Closed" },
                { day: "Sunday", hours: "Closed" },
            ];

            const days = daysList.split(',');
            days.forEach(day => {
                const trimmedDay = day.trim();
                if (daysMap[trimmedDay]) {
                    const fullDay = daysMap[trimmedDay];
                    const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(fullDay);
                    if (dayIndex !== -1) {
                        schedule[dayIndex].hours = timeStr;
                    }
                }
            });

            return schedule;
        }

        // if we get here, we have some format but couldn't parse it
        // return a generic schedule showing the raw hours for each day
        return Array(7).fill(0).map((_, i) => ({
            day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i],
            hours: hours
        }));

    } catch (error) {
        console.error('Error parsing opening hours:', error);
        return null;
    }
}

// extract closing time from operating hours
export function extractClosingTime(hours?: string): string | null {
    if (!hours || hours === "N/A" || hours === "Unknown" || hours.trim() === "") {
        return null;
    }

    // handle 24/7
    if (hours === "24/7") {
        return "24 hours";
    }

    // get current day
    const today = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[today.getDay()];

    // parse the hours and find today's schedule
    const parsed = parseOpeningHours(hours);
    if (parsed) {
        const todaySchedule = parsed.find(s => s.day === currentDay);
        if (todaySchedule && todaySchedule.hours !== 'Closed') {
            if (todaySchedule.hours === '24 hours') {
                return '24 hours';
            }
            // Extract closing time from range like "9:00 AM - 5:00 PM"
            if (todaySchedule.hours.includes('-')) {
                const [, endTime] = todaySchedule.hours.split('-');
                return convertTo12Hour(endTime.trim());
            }
        }
    }

    // fallback: try to extract from simple formats
    if (hours.includes('-')) {
        const parts = hours.split('-');
        if (parts.length === 2) {
            const endTime = parts[1].trim();
            return convertTo12Hour(endTime);
        }
    }

    return null;
}

// determine if clinic is currently open based on operating hours
export function determineOpenStatus(hours?: string): { isOpen: boolean; hasData: boolean } {
    if (!hours || hours === "N/A" || hours === "Unknown" || hours.trim() === "") {
        return { isOpen: false, hasData: false };
    }

    // handle 24/7
    if (hours === "24/7") {
        return { isOpen: true, hasData: true };
    }

    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    // parse the hours
    const parsed = parseOpeningHours(hours);
    if (parsed) {
        const todaySchedule = parsed.find(s => s.day === currentDay);
        if (todaySchedule) {
            if (todaySchedule.hours === 'Closed') {
                return { isOpen: false, hasData: true };
            }
            if (todaySchedule.hours === '24 hours') {
                return { isOpen: true, hasData: true };
            }

            // Parse time range
            if (todaySchedule.hours.includes('-')) {
                const timeRange = todaySchedule.hours.replace(/AM|PM/gi, '').trim();
                const [startStr, endStr] = timeRange.split('-');

                const startTime = parseTimeToMinutes(startStr.trim());
                const endTime = parseTimeToMinutes(endStr.trim());

                if (startTime !== -1 && endTime !== -1) {
                    // Handle overnight hours (e.g., 22:00-06:00)
                    if (endTime < startTime) {
                        return {
                            isOpen: currentTime >= startTime || currentTime <= endTime,
                            hasData: true
                        };
                    } else {
                        return {
                            isOpen: currentTime >= startTime && currentTime <= endTime,
                            hasData: true
                        };
                    }
                }
            }
        }
        return { isOpen: false, hasData: true };
    }

    // fallback for simple formats
    if (hours.includes('-')) {
        const [startStr, endStr] = hours.split('-');
        const startTime = parseTimeToMinutes(startStr.trim());
        const endTime = parseTimeToMinutes(endStr.trim());

        if (startTime !== -1 && endTime !== -1) {
            if (endTime < startTime) {
                return {
                    isOpen: currentTime >= startTime || currentTime <= endTime,
                    hasData: true
                };
            } else {
                return {
                    isOpen: currentTime >= startTime && currentTime <= endTime,
                    hasData: true
                };
            }
        }
    }

    return { isOpen: false, hasData: false };
}

// convert time string to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return -1;

    const parts = timeStr.split(':');
    if (parts.length !== 2) return -1;

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return -1;
    }

    return hours * 60 + minutes;
}