const STORAGE_KEY = 'safecity-reports'
const REPORTS_API_URL = import.meta.env.VITE_SUPABASE_NEWS_URL || 'https://faczibrwcktjypkxxvgo.supabase.co/rest/v1/safecity-noticias'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const normalizeReport = (report) => ({
  id: report.id || `report-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  title: report.title || report.titulo || 'Sin título',
  category: report.category || report.categoria || 'otro',
  severity: report.severity || report.gravedad || 'media',
  description: report.description || report.descripcion || '',
  contact: report.contact || report.contacto || '',
  lat: report.lat || report.latitude || report.latitud || '',
  lng: report.lng || report.longitude || report.longitud || '',
  consent: Boolean(report.consent ?? report.consentimiento),
  photoDataUrl: report.photoDataUrl || report.photo_data_url || report.imagen || '',
  createdAt: report.createdAt || report.created_at || report.fecha || new Date().toISOString()
})

const getCachedReports = () => {
  if (typeof window === 'undefined') return []

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    const parsed = saved ? JSON.parse(saved) : []
    return Array.isArray(parsed) ? parsed.map(normalizeReport) : []
  } catch (error) {
    console.warn('No se pudieron leer los reportes guardados localmente.', error)
    return []
  }
}

const saveCachedReports = (reports) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
  }
}

const getHeaders = (includeJson = false) => {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Falta configurar VITE_SUPABASE_ANON_KEY para conectar los reportes.')
  }

  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Accept: 'application/json',
    ...(includeJson ? { 'Content-Type': 'application/json' } : {})
  }
}

const cacheReport = (report) => {
  const reports = getCachedReports().filter((item) => item.id !== report.id)
  saveCachedReports([report, ...reports])
}

// La caché permite mostrar el detalle del reporte recién creado; Supabase es la fuente principal.
export const getReports = () => getCachedReports()

export const fetchReports = async (limit = 10) => {
  // El contacto se conserva al registrar el reporte, pero no se publica en las noticias.
  const publicFields = 'id,title,category,severity,description,lat,lng,photo_data_url,created_at'
  const response = await fetch(`${REPORTS_API_URL}?select=${publicFields}&order=created_at.desc&limit=${limit}`, {
    headers: getHeaders()
  })

  if (!response.ok) {
    throw new Error('No se pudieron cargar los reportes desde la base de datos.')
  }

  const reports = (await response.json()).map(normalizeReport)
  saveCachedReports(reports)
  return reports
}

export const addReport = async (report) => {
  const normalized = normalizeReport(report)
  const payload = {
    title: normalized.title,
    category: normalized.category,
    severity: normalized.severity,
    description: normalized.description,
    contact: normalized.contact,
    lat: Number(normalized.lat),
    lng: Number(normalized.lng),
    consent: normalized.consent,
    photo_data_url: normalized.photoDataUrl,
    created_at: normalized.createdAt
  }

  const response = await fetch(REPORTS_API_URL, {
    method: 'POST',
    // No solicitamos la fila completa al guardar: el contacto no debe volver al navegador.
    headers: { ...getHeaders(true), Prefer: 'return=minimal' },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || 'No se pudo guardar el reporte en la base de datos.')
  }

  const savedReports = await response.json().catch(() => [])
  const [savedReport] = savedReports
  const result = normalizeReport(savedReport || normalized)
  cacheReport(result)
  return result
}

export const getReportById = (id) => getCachedReports().find((report) => report.id === id) || null
