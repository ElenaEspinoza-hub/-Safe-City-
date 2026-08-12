import { createClient } from 'npm:@insforge/sdk'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024
const MAX_TEXT_LENGTH = 500
const AI_TIMEOUT_MS = 12_000

const response = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: corsHeaders })

const parseReview = (content: string) => {
  const json = content.match(/\{[\s\S]*\}/)?.[0]
  if (!json) throw new Error('La revisión no devolvió un resultado válido.')

  const result = JSON.parse(json)
  return {
    matchesReport: result.matchesReport === true,
    isGraphic: result.isGraphic === true,
    reason: typeof result.reason === 'string' ? result.reason.slice(0, 180) : ''
  }
}

export default async function reviewReportImage(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })
  if (req.method !== 'POST') return response({ error: 'Método no permitido.' }, 405)

  const accessToken = req.headers.get('Authorization')?.replace('Bearer ', '')
  const client = createClient({ baseUrl: Deno.env.get('INSFORGE_BASE_URL'), edgeFunctionToken: accessToken })
  const { data: authData } = await client.auth.getCurrentUser()
  if (!authData?.user?.id) return response({ error: 'Debes iniciar sesión para enviar un reporte.' }, 401)

  try {
    const { imageDataUrl, title, description, category } = await req.json()
    if (typeof imageDataUrl !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/i.test(imageDataUrl)) {
      return response({ error: 'La fotografía no tiene un formato compatible.' }, 400)
    }

    const base64 = imageDataUrl.slice(imageDataUrl.indexOf(',') + 1)
    if ((base64.length * 3) / 4 > MAX_IMAGE_BYTES) {
      return response({ error: 'La fotografía es demasiado grande. Usa una imagen de hasta 5 MB.' }, 400)
    }

    const prompt = `Evalúa la imagen de un reporte ciudadano de tránsito. Compárala con el título, categoría y descripción. Considera que puede ser evidencia de una colisión, atropello, caída, bloqueo vial u otro incidente de seguridad vial. Devuelve SOLO JSON con este formato exacto: {"matchesReport":boolean,"isGraphic":boolean,"reason":"explicación breve en español"}. matchesReport debe ser true solo si la imagen muestra un accidente/incidente vial o es evidencia claramente coherente con el texto. isGraphic debe ser true únicamente si se ve sangre abundante, heridas severas, cadáveres o contenido visual que pueda afectar a personas sensibles. No describas detalles gráficos.\n\nTítulo: ${String(title || '').slice(0, MAX_TEXT_LENGTH)}\nCategoría: ${String(category || '').slice(0, MAX_TEXT_LENGTH)}\nDescripción: ${String(description || '').slice(0, MAX_TEXT_LENGTH)}`

    // La funcion debe fallar rapido: el reporte no depende de esta respuesta y
    // nunca conviene dejar una peticion abierta hasta agotar el worker.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: Deno.env.get('OPENROUTER_VISION_MODEL') || 'google/gemini-2.5-flash-lite',
        temperature: 0,
        max_tokens: 180,
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageDataUrl } }
        ] }]
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    if (!aiResponse.ok) {
      console.error('OpenRouter image review failed:', aiResponse.status)
      return response({ error: 'No fue posible revisar la imagen. Intenta de nuevo.' }, 502)
    }

    const aiResult = await aiResponse.json()
    const content = aiResult.choices?.[0]?.message?.content
    if (typeof content !== 'string') throw new Error('Respuesta de IA vacía.')
    return response(parseReview(content))
  } catch (error) {
    console.error('Image review failed:', error)
    return response({ error: 'No fue posible revisar la imagen. Intenta de nuevo.' }, 500)
  }
}
