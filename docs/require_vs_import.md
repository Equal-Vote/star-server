---
layout: default
title: require vs import
nav_order: 5000
---

# What's the difference between require and import?

I've been hitting a lot of confusion on when to use require vs import, so I figured I'd do a little write up

TLDR: ``require``/``module.exports`` are the older commonjs syntax, and ``import``/``export`` are the ES6 (also called ES2015?) version. In general people seem to recommend moving to ES6

# What are we using? 

Our backend uses mostly commonjs, and our frontend uses ES6

We may decide to migrate our backend to ES6 later, but I'm not sure if it super matters so we can table that discussion for now (that's why I'm doing a write up instead of a task item)

# Why does our tsconfig show both es6 and commonjs?

tsconfig.json snippet

```
...
    "target": "es6",
    "module": "commonjs",
...
```

With ``require`` vs ``import`` we're refering to the module system, so ``"module": "commonjs"`` is the relevant line here, and ``"module": "es2015",`` would be the ES6 alternative

# Can I use ES6 and commonjs modules together?

YES! but you'll need to install babel

For example, with babel you can install modules that use the commonjs syntax (i.e. ``module.exports``), and then you can import from them using the ES6 syntax (i.e. ``import``). 

Babel also supports all other combinations of import/export pairing, with the exception af ES6 ``export`` + commonjs ``require`` (scenario B in the diagram). This will require a minor workaround but you can read more details [here](https://medium.com/codeclan/mocking-es-and-commonjs-modules-with-jest-mock-37bbb552da43)

![](https://miro.medium.com/max/1400/1*94KOmRXFKc68R5yRoM-MOA.png)

# I'm still confused!?!?

Here are some more resources

* [overview article](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)
* [a slower video going through the details](https://www.youtube.com/watch?v=mK54Cn4ceac)
* [a snappier video listing the pros and cons](https://www.youtube.com/watch?v=8O_H2JgV7EQ)
* [mocking commonjs vs es6 in jest](https://medium.com/codeclan/mocking-es-and-commonjs-modules-with-jest-mock-37bbb552da43)
* [an example of an issue we hit](https://starvoting.slack.com/archives/C01EBAT283H/p1645214615443049)