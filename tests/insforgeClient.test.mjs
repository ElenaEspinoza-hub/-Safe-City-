import test from 'node:test'
import assert from 'node:assert/strict'
import { getInsforgeConfigError } from '../src/utils/insforgeClient.js'

test('returns a friendly error when InsForge env vars are missing', () => {
  const message = getInsforgeConfigError('', '')
  assert.match(message, /VITE_INSFORGE_URL/)
  assert.match(message, /VITE_INSFORGE_ANON_KEY/)
})

test('returns null when InsForge env vars are present', () => {
  const message = getInsforgeConfigError('https://example.insforge.app', 'public-key')
  assert.equal(message, null)
})
