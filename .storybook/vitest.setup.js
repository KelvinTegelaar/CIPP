import { configure } from 'storybook/test'
import '../tests/mocks/require-context'

// coverage instrumentation and vite 8's slower module serving push lazy chunks
// and fetches past the 1s default (and past 10s when the full suite runs)
configure({ asyncUtilTimeout: 30000 })
