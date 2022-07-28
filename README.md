# Daily TestRTC client

This repository contains everything you need to test [Daily WebRTC calls](https://daily.co) in various configurations in [TestRTC](https://testrtc.com). This consists of a simple Daily client that is able to create rooms and join calls in various configurations and a set of TestRTC scripts set up to test Daily performance by using this client.

It is intended to facilitate quick deployment to [Netlify](https://netlify.com) to get up and running.

## Getting started

### Getting a Daily API key

You will need a Daily API key. To get one, sign up for a free [Daily account](https://dashboard.daily.co/signup). You will find your API key in your [Daily dashboard](https://dashboard.daily.co/developers).

### Deployment

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/daily-co/testrtc-client&stack=cms)

### Using our prebuilt TestRTC scripts

You can copy the scripts from the `testrtc` directory into your TestRTC account. Replace `"[YOUR-DEPLOYMENT-URL]"` with the address of your Netlify deployment.

Check out [TestRTC's testing documentation](https://testrtc.com/article-categories/testingrtc/) for more information on using TestRTC.

### Running locally

Currently, local runs are supported on OS X and Linux (including WSL).

1. `mv env.sample .env`
1. Set your Daily API key in `.env`
1. `npm i`
1. `npm run dev`

⚠️ The above process will result in your local `netlify.toml` file being modified with your Daily API key. This should be set back to `"DAILY_API_KEY_PLACEHOLDER"` automatically when you exit the development environment, but **always double check to make sure you do not commit the file with your API key**!

## Writing your own tests

The test client allows callers to specify their own room creation and call configuration options as query prameters. You can use these if you'd like to modify our bundled tests or write your own:

* `roomParams`: JSON string matching Daily's [room configuration properties](https://docs.daily.co/reference/rest-api/rooms/config)
* `callOptions`: JSON string matching Daily's [call object configuration properties](https://docs.daily.co/reference/daily-js/factory-methods/create-call-object)
* `roomURL`: A string containing the full URL to a Daily room for TestRTC agents to join.

### Example

a `GET` request to the following URL will result in a room being created which will connect to the Sydney signaling server:

```
https://your-deployment.netlifyapp.com/?roomParams={"geo":"ap-southeast-2"}
```

## Contributing and feedback

Please run `npm run fix` to run eslint and prettier.
This will format and auto-fix what it can, outputting any remaining issues you need to handle manually to the console.
