---
layout: default
title: 🔡 Adding Translations
nav_order: 5
parent: Contribution Guide
has_children: true
---

# Adding Translations

So you want to help add more languages to bettervoting.com? Amazing! You've come to the right place.

This will walk you though how to add your translations and get them approved.

## Who should be translating?

People adding translations don't necessarily need to be native speakers, but they should at least be proficient in the language. 

After adding translations we will have other contributors proof read your work, and at least one of them will need to be a native speaker. 

## GitHub Setup

This will require a github account. Once you've made an account [drop an email to arendpeter@equal.vote](mailto:arendpeter@equal.vote?subject=Triage%20Permissions%20Request&body=Hi%20there!%20Please%20add%20triage%20permissions%20for%20INSERT_GITHUB_USER_NAME.) with your github user name so that you can be given the permissions for issue assignment in the future (although all steps on this page will be possible without permissions).

## Adding translated text

All localizations are stored in the [i18n folder on the project](https://github.com/Equal-Vote/star-server/tree/main/packages/frontend/src/i18n). We have one yaml file per language, and an i18n.ts file for connecting the files to the app.

> **Please Only Translate Priority 0!** Priority 0 represents the majority of the text that a voter will see. The rest of the English text is still subject to change so in order to avoid excessive revisions we ask that translators limit themselves to Priority 0 for now.

Follow these steps to add a new translation file

1. Select the en.yaml file (for English), and copy the priority 0 section (at time of writing that would be the first 300 lines).
1. Paste it in your local file editor and apply your translations. In general you only need to translate the text after the colon on any line, the rest is just for the code to identify the text.
1. Go back to the i18n folder, and select ``Add file`` -> ``Create new file``.
1. Select "Fork this repository" (if prompted).
1. Use ``<your language code>.yaml`` as the filename (you can check [wikipedia's language code list](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) for reference)
1. Paste your translated text.
1. Click a bunch of buttons...
    1. Click "Commit Changes..."
    1. Update commit message and description as desired
    1. Click "Sign off and propose changes"
    1. Click "Create pull request"
1. Once your pull request is created a maintainer will review it shortly (ping [arendpeter@equal.vote](mailto:arendpeter@equal.vote) if it's not reviewed within a few days).

## Review Process

The reviewer on the pull request will merge as long as there are no technical issues with the file. They will also deploy a an update to i18n.ts so that your file will be linked to the code. Once that's complete it will be live on the bettervoting.com 🥳. The maintainer will also add you to the bettervoting.com/about page since you're now officially a BetterVoting contributor!

You can view the site in your language by adding ``?lng=<your language code>`` at the end of the URL. Keep in mind that **the site will remember your selection**, so make sure to add ``?lng=en`` to the end of the URL if you ever want to change it back to English.

One or two other contributors will then proof read your translations as a quality check. The creator of the pull request doesn't necessarily need to be a native speaker, but at least one of the proof readers should be a native speaker. 

## Updating your translations 

Usually there will be a few rounds of feedback before the translations are finalized. Here's how you make edits.

1. Go back to the [i18n folder on github](https://github.com/Equal-Vote/star-server/tree/main/packages/frontend/src/i18n).
1. Select your newly translated file, and click the edit icon in the top right.
1. Apply your edits
1. Click "Commit Changes..." and proceed with the series of buttons just like last time
1. A maintainer will review from there.

And that's it. Congratulations your language is now officially supported by BetterVoting!

Let us know if you're interested in doing more translations. We can reach out to you in the future, when we're ready for the next phase.
