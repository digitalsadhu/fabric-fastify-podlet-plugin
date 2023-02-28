# Fabric Fasitfy Podlet Plugin

This plugin is intended for use with `@podium/experimental-fastify-podlet-server`
This hooks into Esbuild and replaces @fabric-css placeholders in content or fallback files with inlined, purged fabric CSS.

## How to use

Install
```
npm install fabric-fastify-podlet-plugin
```

Import
```js
// build.js
import fabricPlugin from 'fabric-fastify-podlet-plugin'
```

Register
```js
// build.js
import fabricPlugin from 'fabric-fastify-podlet-plugin';
export default () => [fabricPlugin()];
```

Add placeholder
```js
// content.js
import { html, css } from "lit";
import { PodiumPodletElement } from "@podium/experimental-lit-base-class";

export default class Content extends PodiumPodletElement {
    static styles = css`
        @fabric-css
    `;
    render() { ... }
}
```
