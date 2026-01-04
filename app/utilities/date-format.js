// Normalize date values for display to avoid off-by-one issues.
// Postgres `date` via Supabase returns 'YYYY-MM-DD' (UTC). Parsing this
// directly in JS can shift the day in non-UTC timezones. We coerce such
// strings to local midnight by appending 'T00:00:00' (no timezone).

export function normalizeDate(input) {
	if (!input) return input
	if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
		return `${input}T00:00:00`
	}
	return input
}

// Get current week's local start/end as 'YYYY-MM-DD' strings.
function toYmd(d) {
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}

export function getCurrentWeekRange(options = {}) {
	const { startOnMonday = false } = options
	const today = new Date()
	const dow = today.getDay() // 0=Sun..6=Sat in local time
	const offset = startOnMonday ? (dow === 0 ? -6 : 1) : 0
	// Compute start-of-week local date (midnight) without timezone involvement
	const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (startOnMonday ? ((dow + 6) % 7) : dow))
	const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
	return { startYmd: toYmd(start), endYmd: toYmd(end) }
}

export function getCurrentMonthRange() {
	const now = new Date()
	const start = new Date(now.getFullYear(), now.getMonth(), 1)
	const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
	return { startYmd: toYmd(start), endYmd: toYmd(end) }
}
