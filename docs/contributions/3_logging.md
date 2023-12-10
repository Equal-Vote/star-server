---
layout: default
title: logging
nav_order: 6000
parent: Contribution Guide
---

> ⚠️ This article is outdated, and needs to be rewritten for azure

# External Logging Service

When running on Heroku, you are able to pipe all [logs from your Heroku dyno](https://devcenter.heroku.com/articles/logging) to an external service (ex: New Relic, Data Dog, etc).

Currently we are using New Relic, both for its ease of setup, and the attractive price ([$0 while under 100GB per month](https://newrelic.com/pricing))

Here are the steps for setting up logs from Heroku -> New Relic (basically copied from [the New Relic docs](https://docs.newrelic.com/docs/logs/forward-logs/heroku-log-forwarding/))

1. Sign up for a [New Relic account](https://newrelic.com/signup). Confirm your email and all that.

2. In your Heroku CLI, run:
```
heroku drains:add syslog+tls://newrelic.syslog.nr-data.net:6515 -a YOUR_APP_NAME
```
"YOUR_APP_NAME" is probably something like calm-springs-47849

3. Run this command, and copy the token:
```
$ heroku drains -a YOUR_APP_NAME --json
```

4. Log in to [New Relic's Logs UI](https://one.newrelic.com/) and click Add more data sources.
5. Click the Heroku tile under Log ingestion.
6. Paste your newly created Heroku drain token in the Heroku drain token field.
7. Click Add Heroku drain log to complete registration.
