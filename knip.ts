import type { KnipConfig } from 'knip'

// A module nothing imports fails the verification suite, the same way a type
// error does. Every exemption below is deliberate; a blanket ignore would make
// the check advisory.
const config: KnipConfig = {
  entry: ['index.html', 'scripts/**/*.mjs'],
  project: ['src/**/*.{ts,tsx,css}', 'scripts/**/*.mjs', '*.config.{js,ts}'],
  ignoreDependencies: [
    // Loaded by the semantic-release CLI from .releaserc.json, never imported.
    '@semantic-release/commit-analyzer',
    '@semantic-release/github',
    '@semantic-release/npm',
    '@semantic-release/release-notes-generator',
    // Used only by the one-off icon generation script, run by hand.
    'sharp',
  ],
}

export default config
