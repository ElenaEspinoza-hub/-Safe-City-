<script setup>
const emergencyDirectory = [
  {
    institution: 'Policía Nacional Civil',
    phone: '911',
    link: 'tel:911',
    type: 'Emergencia policial'
  },
  {
    institution: 'Sistema de Emergencias Médicas',
    phone: '132',
    link: 'tel:132',
    type: 'Ambulancia y emergencias médicas'
  },
  {
    institution: 'Cuerpo de Bomberos',
    phone: '913',
    link: 'tel:913',
    type: 'Incendios y rescates'
  },
  {
    institution: 'Cruz Roja Salvadoreña',
    phone: '+503 2239-4930',
    link: 'tel:+50322394930',
    type: 'Emergencias y ambulancias'
  },
  {
    institution: 'Cruz Verde Salvadoreña',
    phone: '+503 2284-5792',
    link: 'tel:+50322845792',
    type: 'Asistencia médica de urgencia'
  },
  {
    institution: 'Comandos de Salvamento',
    phone: '+503 2133-0000',
    link: 'tel:+50321330000',
    type: 'Rescates y emergencias especiales'
  },
  {
    institution: 'Protección Civil',
    phone: '+503 2281-0888',
    link: 'tel:+50322810888',
    type: 'Protección y atención de desastres'
  },
  {
    institution: 'Hospital Nacional Rosales',
    phone: '+503 2231-9200',
    link: 'tel:+50322319200',
    type: 'Hospital nacional de referencia'
  },
  {
    institution: 'Hospital Nacional San Rafael',
    phone: '+503 2594-4000',
    link: 'tel:+50325944000',
    type: 'Hospital nacional de La Libertad'
  },
  {
    institution: 'Hospital Nacional Zacamil',
    phone: '+503 2559-0000',
    link: 'tel:+50325590000',
    type: 'Hospital nacional del área metropolitana'
  },
  {
    institution: 'Hospital General del ISSS',
    phone: '+503 2591-4500',
    link: 'tel:+50325914500',
    type: 'Hospital del ISSS'
  },
  {
    institution: 'Hospital ISSS 1 de Mayo',
    phone: '+503 2591-4700',
    link: 'tel:+50325914700',
    type: 'Hospital del ISSS'
  },
  {
    institution: 'ISSS Zacamil Policlínico',
    phone: '+503 2591-6200',
    link: 'tel:+50325916200',
    type: 'Hospital del ISSS'
  },
  {
    institution: 'Clínicas Santa Elena',
    phone: '+503 7729-8530',
    link: 'tel:+50377298530',
    type: 'Clínica privada importante'
  },
  {
    institution: 'Hospital de Diagnóstico',
    phone: '+503 2200-0000',
    link: 'tel:+50322000000',
    type: 'Clínica privada importante'
  },
  {
    institution: 'Alcaldía de San Salvador',
    phone: '+503 2511-6000',
    link: 'tel:+50325116000',
    type: 'Atención municipal y apoyo comunitario'
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
    <div class="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl sm:p-6 lg:p-8">
      <div class="mb-6">
        <p class="mb-2 text-sm uppercase tracking-[0.3em] text-cyan-400">SafeCity</p>
        <h1 class="text-3xl font-bold text-white sm:text-4xl">Directorio de emergencias de El Salvador</h1>
        <p class="mt-3 text-sm text-slate-300 sm:text-base">
          Toca cualquier número para llamar directamente desde tu teléfono móvil. Los enlaces usan el formato compatible con celulares.
        </p>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="min-w-full divide-y divide-slate-800 text-sm">
          <thead class="bg-slate-800/80">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-slate-200">Institución</th>
              <th class="px-4 py-3 text-left font-semibold text-slate-200">Número telefónico</th>
              <th class="px-4 py-3 text-left font-semibold text-slate-200">Enlace para llamar</th>
              <th class="px-4 py-3 text-left font-semibold text-slate-200">Tipo de emergencia</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800 bg-slate-900">
            <tr v-for="item in emergencyDirectory" :key="item.institution" class="hover:bg-slate-800/60">
              <td class="px-4 py-3 font-medium text-white">{{ item.institution }}</td>
              <td class="px-4 py-3 text-slate-300">{{ item.phone }}</td>
              <td class="px-4 py-3">
                <a
                  :href="item.link"
                  class="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-cyan-500"
                >
                  📞 Llamar
                </a>
              </td>
              <td class="px-4 py-3 text-slate-300">{{ item.type }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 rounded-xl border border-cyan-900/40 bg-cyan-950/40 p-4 text-sm text-cyan-100">
        <p class="font-semibold">Nota</p>
        <p class="mt-1">
          En una página web o aplicación móvil, el enlace se ve como <span class="font-mono text-cyan-300">tel:+50322394930</span> y al tocarlo desde un celular se abrirá el marcador automáticamente.
        </p>
      </div>
    </div>
  </div>
</template>
