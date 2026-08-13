const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_TEXT_LENGTH = 500
const OPENAI_TIMEOUT_MS = 12_000

const json = (body, status = 200, origin = '*') => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  }
})

const allowedOrigin = (request, env) => {
  const origin = request.headers.get('Origin')
  return env.ALLOWED_ORIGIN && origin === env.ALLOWED_ORIGIN ? origin : env.ALLOWED_ORIGIN || '*'
}

const parseReview = (content) => {
  const value = JSON.parse(content.match(/\{[\s\S]*\}/)?.[0] || '')
  return {
    matchesReport: value.matchesReport === true,
    isGraphic: value.isGraphic === true,
    reason: typeof value.reason === 'string' ? value.reason.slice(0, 180) : ''
  }
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env)
    if (env.ALLOWED_ORIGIN && request.headers.get('Origin') !== env.ALLOWED_ORIGIN) {
      return json({ error: 'Origen no autorizado.' }, 403, env.ALLOWED_ORIGIN)
    }
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    } })
    if (request.method === 'GET') return json({
      service: 'SafeCity image review API',
      status: 'ok',
      message: 'El servicio esta activo. Envia solicitudes POST para revisar fotografias.'
    }, 200, origin)
    if (request.method !== 'POST') return json({ error: 'Metodo no permitido.' }, 405, origin)
    if (!env.OPENAI_API_KEY) return json({ error: 'El servicio de revision no esta configurado.' }, 503, origin)

    try {
      const { imageDataUrl, title, description, category } = await request.json()
      if (typeof imageDataUrl !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/i.test(imageDataUrl)) {
        return json({ error: 'La fotografia no tiene un formato compatible.' }, 400, origin)
      }
      const base64 = imageDataUrl.slice(imageDataUrl.indexOf(',') + 1)
      if ((base64.length * 3) / 4 > MAX_IMAGE_BYTES) return json({ error: 'La fotografia es demasiado grande. Usa una imagen de hasta 5 MB.' }, 400, origin)

      const prompt = `Evalua la imagen de un reporte ciudadano de transito. Devuelve SOLO JSON valido: {"matchesReport":boolean,"isGraphic":boolean,"reason":"explicacion breve en espanol"}. matchesReport es true si la imagen muestra un incidente vial o evidencia coherente con el texto. isGraphic es true si se aprecia sangre abundante, heridas severas, cadaveres o contenido que debe ocultarse. No describas detalles graficos.\n\nTitulo: ${String(title || '').slice(0, MAX_TEXT_LENGTH)}\nCategoria: ${String(category || '').slice(0, MAX_TEXT_LENGTH)}\nDescripcion: ${String(description || '').slice(0, MAX_TEXT_LENGTH)}`
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), OPENAI_TIMEOUT_MS)
      const openAIResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: env.OPENAI_VISION_MODEL || 'gpt-4.1-mini',
          max_output_tokens: 160,
          input: [{ role: 'user', content: [
            { type: 'input_text', text: prompt },
            { type: 'input_image', image_url: imageDataUrl, detail: 'low' }
          ] }]
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout))

      if (!openAIResponse.ok) {
        console.error('OpenAI image review failed:', openAIResponse.status)
        return json({ error: 'No fue posible revisar la fotografia.' }, 502, origin)
      }
      const result = await openAIResponse.json()
      if (typeof result.output_text !== 'string') throw new Error('Respuesta de IA vacia.')
      return json(parseReview(result.output_text), 200, origin)
    } catch (error) {
      console.error('Image review failed:', error)
      return json({ error: 'No fue posible revisar la fotografia.' }, 500, origin)
    }
  }
}
