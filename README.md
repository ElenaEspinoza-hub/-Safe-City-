# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
## Revision de fotografias con Cloudflare y OpenAI

El envio de reportes usa el Worker `workers/report-image-review.js`. La clave de
OpenAI permanece en Cloudflare y nunca debe colocarse en `.env.local` ni usar el
prefijo `VITE_`.

1. Instala/inicia sesion en Wrangler y publica el Worker: `npx wrangler deploy`.
2. Guarda la clave: `npx wrangler secret put OPENAI_API_KEY`.
3. Restringe el origen del sitio: `npx wrangler secret put ALLOWED_ORIGIN` e
   ingresa, por ejemplo, `https://safecity.example.com`.
4. Copia la URL publicada del Worker en `VITE_IMAGE_REVIEW_URL` de `.env.local`.

El Worker revisa la imagen ya censurada localmente, usa la API Responses de
OpenAI con un limite de 12 segundos y devuelve si la escena debe pixelarse.
