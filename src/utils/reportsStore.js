const STORAGE_KEY = 'safecity-reports'

const normalizeReport = (report) => ({
  id: report.id || `report-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: report.title || 'Sin título',
  category: report.category || 'otro',
  severity: report.severity || 'media',
  description: report.description || '',
  contact: report.contact || '',
  lat: report.lat || '',
  lng: report.lng || '',
  consent: Boolean(report.consent),
  photoDataUrl: report.photoDataUrl || '',
  createdAt: report.createdAt || new Date().toISOString()
})

export const getReports = () => {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []

    if (!Array.isArray(parsed)) return []

    return parsed.map(normalizeReport)
  } catch (error) {
    console.warn('No se pudieron leer los reportes guardados.', error)
    return []
  }
}

export const saveReports = (reports) => {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

export const addReport = (report) => {
  const reports = getReports()
  const normalized = normalizeReport(report)
  const nextReports = [normalized, ...reports]

  saveReports(nextReports)
  return normalized
}

export const getReportById = (id) => {
  return getReports().find((report) => report.id === id) || null
}
