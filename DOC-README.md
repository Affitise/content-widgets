Welcome to the Affitise Javascript Client Documentation Site.

The Affitise JS Client is quite simple at the moment and just requires 2 lines to work:
* var a = new {@link Affitise.feed|Affitise.feed()} - passing in your {@link https://affitise.com/user/api|api key} and {@link https://affitise.com/user/feed|feed id}
* {@link Affitise.feed#display|a.display()} - with optional size and other options

The client will then display your feed discounts in the element id `affitise-display` (e.g. `<div id="affitise-display"></div>`),
or whichever override you pass in.
