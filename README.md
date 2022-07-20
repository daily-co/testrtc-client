# Daily TestRTC client

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/daily-co/testrtc-client&stack=cms)

This repository is a basic embed of Daily Prebuilt, intended to be optimized as needed for TestRTC perf tests.

It takes a `roomURL` query parameter to detect which room to join. If no `roomURL` is specified, it will create a new room (if the deployment has been set up with a Daily API key).

## Running locally

1. Install the [Netlify CLI](https://docs.netlify.com/cli/get-started/).
1. `mv env.sample .env`
1. Set your Daily API key in `.env`
1. `npm i`
1. `npm run dev`

⚠️ The above process will result in your local `netlify.toml` file being modified with your Daily API key. This should be set back to `"DAILY_API_KEY_PLACEHOLDER"` automatically when you exit the development environment, but **always double check to make sure you do not commit the file with your API key**!

## Contributing and feedback

Please run `npm run fix` to run eslint and prettier.
This will format and auto-fix what it can, outputting any remaining issues you need to handle manually to the console.
