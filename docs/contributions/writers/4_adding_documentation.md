---
layout: default
title: 📚 Adding Documentation
nav_order: 4
parent: ✍ ️Writers
---

# Adding Documentation

Want to help improve the documentation on docs.bettervoting.com? Here's how!

TLDR, to update text on docs.bettervoting.com you can change the corresponding files under the [star-server/docs directory](https://github.com/Equal-Vote/star-server/tree/main/docs) using the steps described in GitHub 101.

## Markdown

Documentation is written in markdown. It's simliar to html as it allows you to define headers, bold text, hyperlinks, etc, except Markdown is significantly easier to read than HTML. 

Before making your edits review the [Markdown Cheatsheet](https://www.markdownguide.org/basic-syntax/) for a list of the features.

Note: Unlike the content in the en.yaml files, these documentation pages support full markdown

## Header

Each documentation page will start with a header similar to this one

```
---
layout: default
title: 📚 Adding Documentation
nav_order: 4
parent: ✍️Writers
---
```

These variables indicate the title of the document as well as where it's located in the hierarchy.

* ``layout: default`` is the same for all documents
* ``title: 📚 Adding Documentation`` let you specify the title (we like using emojis)
* ``nav_order: 4`` indicates how it should be ordred relative to the other files in the same "directory". This doesn't have to exactly correspond with it's placement. For example, you could have 3 files with nav order 2, 8, and 200. Then they would just be sorted into the 1st, 2nd, and 3rd slot.
* ``parent: ✍️Writers`` is the title field from the parent document. Make sure this matches exactly otherwise your file won't be accessbile!
* ``has_children: true`` is an optional field that should be added to documents that should be a folder for other documents

## Tips

After you've added new documentation pages, it could be good to link to it from info bubbles so that your page will be more discoverable. Follow [the steps at 'updating website text'](2_updating_website_text#tips-and-info-bubbles) to learn more.