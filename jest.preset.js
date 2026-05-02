const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  passWithNoTests: true,
  // uuid@14 ships ESM under dist-node; allow ts-jest to transform it in CJS test runs
  transformIgnorePatterns: [String.raw`node_modules/(?!uuid/)`],
};
