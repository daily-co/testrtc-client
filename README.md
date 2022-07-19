# Daily TestRTC client

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/daily-co/testrtc-client&stack=cms)

This repository is a basic embed of Daily Prebuilt, intended to be optimized as needed for TestRTC perf tests.

It takes a `roomURL` query parameter to detect which room to join.

## Running locally

1. `npm i`
1. `npm run build`
1. `npm run start`

## Contributing and feedback

Please run `npm run fix` to run eslint and prettier.
This will format and auto-fix what it can, outputting any remaining issues you need to handle manually to the console.
