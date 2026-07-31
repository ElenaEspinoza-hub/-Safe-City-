import { readonly, ref } from 'vue'
import { insforge } from './insforgeClient'

const user = ref(null)
const loading = ref(true)
let hydrationPromise = null

export const authUser = readonly(user)
export const authLoading = readonly(loading)

export const initializeAuth = ({ force = false } = {}) => {
  if (hydrationPromise && !force) return hydrationPromise

  loading.value = true
  hydrationPromise = insforge.auth.getCurrentUser()
    .then(({ data, error }) => {
      user.value = error ? null : (data?.user ?? null)
      return { user: user.value, error }
    })
    .catch((error) => {
      user.value = null
      return { user: null, error }
    })
    .finally(() => {
      loading.value = false
      hydrationPromise = null
    })

  return hydrationPromise
}

export const setAuthenticatedUser = (nextUser) => {
  user.value = nextUser ?? null
  loading.value = false
}

export const signOut = async () => {
  const currentUser = user.value
  let auditError = null

  // The event is intentionally recorded before invalidating the session, while
  // auth.uid() is still available for the RLS policy that protects the audit log.
  if (currentUser?.id) {
    const { error } = await insforge.database
      .from('auth_session_events')
      .insert([{ user_id: currentUser.id, event_type: 'sign_out' }])
    auditError = error ?? null
  }

  const { error } = await insforge.auth.signOut()
  if (!error) setAuthenticatedUser(null)

  return { error, auditError }
}
