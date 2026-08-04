import { configure } from 'storybook/test'
import '../tests/mocks/require-context'

// coverage instrumentation slows lazy chunks and fetches past the 1s default
configure({ asyncUtilTimeout: 10000 })
