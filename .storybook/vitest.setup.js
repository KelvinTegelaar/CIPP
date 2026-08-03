import { configure } from 'storybook/test'

// coverage instrumentation slows lazy chunks and fetches past the 1s default
configure({ asyncUtilTimeout: 10000 })
