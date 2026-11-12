'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const vm = require('node:vm');
const { source, legacySource, vodSource, addonSource, makeAdUrl } = require('./helpers.cjs');

function realm(href = 'https://www.twitch.tv/videos/123456789', framed = false) {
    const calls = [];
    function Xhr() {}
    Xhr.prototype.open = function (...args) { calls.push({ receiver: this, args }); };
    const nativeOpen = Xhr.prototype.open;
    const window = { location: new URL(href) };
    window.self = window;
    window.top = framed ? {} : window;
    const context = vm.createContext({ window, URL, XMLHttpRequest: Xhr });
    return { context, window, Xhr, calls, nativeOpen, run: code => vm.runInContext(code, context) };
}

test('release metadata keeps the existing installation and main update URLs', () => {
    const metadata = name => source.match(new RegExp('^// @' + name + '\\s+(.+)$', 'm'))?.[1].trim();
    assert.equal(metadata('name'), 'TwitchAD VAFT MATTEO12SA');
    assert.equal(metadata('namespace'), 'https://github.com/MATTEO12SA/twitch-vaft-violentmonkey');
    assert.equal(metadata('version'), '37.0.8');
    assert.equal(metadata('updateURL'), 'https://raw.githubusercontent.com/MATTEO12SA/Twitch-Ad-Block-Directs-VOD/main/vaft.user.js');
    assert.equal(metadata('downloadURL'), metadata('updateURL'));
    assert.equal(metadata('run-at'), 'document-start');
    assert.equal(metadata('inject-into'), 'page');
    assert.equal(metadata('grant'), 'none');
    assert.doesNotMatch(source, /^\/\/ @require\s/m);
    new vm.Script(source);
});

test('legacy live engine is byte-identical to 37.0.3 after normalizing line endings', () => {
    const body = legacySource.slice(legacySource.indexOf('// ==/UserScript==') + '// ==/UserScript=='.length).trim();
    assert.equal(crypto.createHash('sha256').update(body).digest('hex'),
        'c8ccd30292db9b7761d29489527a90efcafc5c7a02b95cda26ce0cbffe7003af');
});

test('VOD module differs from the tested add-on only by its documented changes', () => {
    const guard = "    // Keep the scope of the validated companion's @match rules.\n" +
        "    if (window.location.origin !== 'https://www.twitch.tv' && window.location.origin !== 'https://twitch.tv') return;\n\n";
    assert.ok(vodSource.includes(guard));
    // Each pair is [add-on text, module text]; every one must apply exactly once.
    const changes = [
        // 37.0.7: mid-roll placement.
        ["params.get('bp') !== 'preroll'", "!['preroll', 'midroll'].includes(params.get('bp'))"],
        // 37.0.8: the request must name the displayed Twitch page instead of a /videos/<id> page.
        ["    function getVodId(url) {\n",
            "    // Twitch page hosting the player: a VOD page, or a channel page replaying a VOD.\n" +
            "    function getTwitchPagePath(url) {\n"],
        ["        return url.pathname.match(/^\\/videos\\/(\\d+)\\/?$/)?.[1] ?? null;\n",
            "        return url.pathname.replace(/\\/$/, '') || '/';\n"],
        ["            const vodId = getVodId(page);\n            if (!vodId) return false;\n",
            "            const pagePath = getTwitchPagePath(page);\n            if (!pagePath) return false;\n"],
        ["            if (getVodId(new URL(params.get('u'))) !== vodId) return false;\n",
            "            if (getTwitchPagePath(new URL(params.get('u'))) !== pagePath) return false;\n"],
        // 37.0.8: highlights carry the same request with another content type.
        ["details?.v === 'ARCHIVE'", "['ARCHIVE', 'HIGHLIGHT'].includes(details?.v)"]
    ];
    let expected = addonSource;
    for (const [original, candidate] of changes) {
        assert.equal(expected.split(original).length, 2, 'add-on text must occur once: ' + original);
        expected = expected.replace(original, () => candidate);
        assert.equal(vodSource.split(candidate).length, 2, 'module text must occur once: ' + candidate);
    }
    assert.equal(vodSource.replace(guard, '').trim(), expected.trim());
});

for (const placement of ['preroll', 'midroll']) {
test(`matched ${placement} becomes an empty VAST, while this and open arguments are preserved`, () => {
    const r = realm(); r.run(vodSource);
    const xhr = new r.Xhr();
    xhr.open('GET', makeAdUrl({ bp: placement }), false, 'fictional-user', 'fictional-password');
    const call = r.calls[0];
    assert.equal(call.receiver, xhr);
    assert.equal(call.args[0], 'GET');
    assert.deepEqual(call.args.slice(2), [false, 'fictional-user', 'fictional-password']);
    const local = new URL(call.args[1]);
    assert.equal(local.protocol, 'data:');
    assert.equal(decodeURIComponent(call.args[1].split(',')[1]), '<VAST version="3.0"></VAST>');
});
}

const passthroughCases = [
    ['POST', 'POST', makeAdUrl()],
    ['another domain', 'GET', makeAdUrl().replace('edge.ads.twitch.tv', 'other.example')],
    ['HTTP', 'GET', makeAdUrl().replace('https:', 'http:')],
    ['other endpoint', 'GET', makeAdUrl().replace('/2018-01-01/3p/ads?', '/ads?')],
    ['credentials in URL', 'GET', makeAdUrl().replace('https://', 'https://fictional:password@')],
    ['another format', 'GET', makeAdUrl({ rt: 'json' })],
    ['unsupported placement', 'GET', makeAdUrl({ bp: 'postroll' })],
    ['unknown placement', 'GET', makeAdUrl({ bp: 'unknown' })],
    ['missing placement', 'GET', makeAdUrl().replace('bp=preroll&', '')],
    ['duplicate placement', 'GET', makeAdUrl() + '&bp=midroll'],
    ['other publisher', 'GET', makeAdUrl({ pbid: 'other' })],
    ['another VOD', 'GET', makeAdUrl({ u: 'https://www.twitch.tv/videos/987654321' })],
    ['live playback URL', 'GET', makeAdUrl({ u: 'https://www.twitch.tv/fixture_channel' })],
    ['foreign page URL', 'GET', makeAdUrl({ u: 'https://other.example/videos/123456789' })],
    ['invalid page URL', 'GET', makeAdUrl({ u: 'invalid' })],
    ['live content', 'GET', makeAdUrl({ pj: JSON.stringify({ delivery_type: 'csai', adunit: 'web_csai', v: 'LIVE' }) })],
    ['unvalidated content type', 'GET', makeAdUrl({ pj: JSON.stringify({ delivery_type: 'csai', adunit: 'web_csai', v: 'UPLOAD' }) })],
    ['missing content type', 'GET', makeAdUrl({ pj: JSON.stringify({ delivery_type: 'csai', adunit: 'web_csai' }) })],
    ['unknown insertion type', 'GET', makeAdUrl({ pj: JSON.stringify({ delivery_type: 'unknown', adunit: 'web_csai', v: 'ARCHIVE' }) })],
    ['malformed JSON', 'GET', makeAdUrl({ pj: '{' })],
    ['missing JSON object', 'GET', makeAdUrl({ pj: 'null' })],
    ['oversized metadata', 'GET', makeAdUrl({ pj: ' '.repeat(8193) })],
    ['banner slot', 'GET', makeAdUrl({ slots: JSON.stringify([{ id: 'homepage', mt: 'd' }]) })],
    ['multiple slots', 'GET', makeAdUrl({ slots: JSON.stringify([{ id: 'twitch-player-ui', mt: 'v' }, { id: 'other', mt: 'v' }]) })],
    ['malformed slots', 'GET', makeAdUrl({ slots: '[' })],
    ['duplicate field', 'GET', makeAdUrl() + '&rt=json'],
    ['missing field', 'GET', makeAdUrl().replace('pbid=twitch&', '')]
];
for (const placement of ['preroll', 'midroll']) {
for (const [name, method, originalUrl] of passthroughCases) {
    const parsed = new URL(originalUrl);
    if (parsed.searchParams.getAll('bp').length === 1 && parsed.searchParams.get('bp') === 'preroll') {
        parsed.searchParams.set('bp', placement);
    }
    const url = parsed.href;
    test(`${placement}: leaves ${name} untouched`, () => {
        const r = realm(); r.run(vodSource);
        const xhr = new r.Xhr(); xhr.open(method, url);
        assert.equal(r.calls[0].receiver, xhr);
        assert.deepEqual(r.calls[0].args, [method, url]);
    });
}
}

for (const href of ['https://www.twitch.tv/fixture_channel', 'https://www.twitch.tv/', 'https://www.twitch.tv/videos/987654321']) {
    test(`does not intercept the captured VOD request on ${new URL(href).pathname}`, () => {
        const r = realm(href); r.run(vodSource);
        new r.Xhr().open('GET', makeAdUrl());
        assert.equal(r.calls[0].args[1], makeAdUrl());
    });
}

// 37.0.8: shapes observed on Twitch on 12 November 2026 that 37.0.7 let through.
const channelPage = 'https://www.twitch.tv/fixture_channel';
const withContent = v => JSON.stringify({ delivery_type: 'csai', adunit: 'web_csai', v });
for (const placement of ['preroll', 'midroll']) {
    test(`${placement}: a highlight is handled like an archive`, () => {
        const r = realm(); r.run(vodSource);
        new r.Xhr().open('GET', makeAdUrl({ bp: placement, pj: withContent('HIGHLIGHT') }));
        assert.ok(r.calls[0].args[1].startsWith('data:'));
    });

    for (const content of ['ARCHIVE', 'HIGHLIGHT']) {
        test(`${placement}: ${content} replayed on a channel page is handled`, () => {
            const r = realm(channelPage); r.run(vodSource);
            new r.Xhr().open('GET', makeAdUrl({ bp: placement, u: channelPage, pj: withContent(content) }));
            assert.ok(r.calls[0].args[1].startsWith('data:'));
        });
    }

    test(`${placement}: live content on a channel page is left untouched`, () => {
        const r = realm(channelPage); r.run(vodSource);
        const url = makeAdUrl({ bp: placement, u: channelPage, pj: withContent('LIVE') });
        new r.Xhr().open('GET', url);
        assert.equal(r.calls[0].args[1], url);
    });

    test(`${placement}: a request naming another channel page is left untouched`, () => {
        const r = realm(channelPage); r.run(vodSource);
        const url = makeAdUrl({ bp: placement, u: 'https://www.twitch.tv/another_channel' });
        new r.Xhr().open('GET', url);
        assert.equal(r.calls[0].args[1], url);
    });
}

test('page and request may differ by a trailing slash, a query string or the www prefix', () => {
    const r = realm('https://www.twitch.tv/videos/123456789/?filter=archives&sort=time'); r.run(vodSource);
    new r.Xhr().open('GET', makeAdUrl({ u: 'https://twitch.tv/videos/123456789?t=1h' }));
    assert.ok(r.calls[0].args[1].startsWith('data:'));
});

for (const href of ['http://www.twitch.tv/videos/123456789', 'https://clips.twitch.tv/videos/123456789', 'https://player.twitch.tv/videos/123456789']) {
    test(`does not install VOD hooks at ${new URL(href).origin}`, () => {
        const r = realm(href); r.run(vodSource);
        assert.equal(r.Xhr.prototype.open, r.nativeOpen);
    });
}

test('does not install VOD hooks in an iframe', () => {
    const r = realm(undefined, true); r.run(vodSource);
    assert.equal(r.Xhr.prototype.open, r.nativeOpen);
});

for (const placement of ['preroll', 'midroll']) {
test(`${placement}: SPA navigation reads the current VOD on each call`, () => {
    const r = realm(); r.run(vodSource);
    const url = makeAdUrl({ bp: placement });
    const xhr = new r.Xhr(); xhr.open('GET', url);
    r.window.location = new URL('https://www.twitch.tv/fixture_channel');
    xhr.open('GET', url);
    r.window.location = new URL('https://www.twitch.tv/videos/123456789');
    xhr.open('GET', url);
    assert.deepEqual(r.calls.map(c => c.args[1].startsWith('data:')), [true, false, true]);
});
}

test('legacy companion loaded first still owns the guard and must be disabled for mid-roll support', () => {
    const r = realm(); r.run(addonSource); r.run(vodSource);
    const url = makeAdUrl({ bp: 'midroll' });
    new r.Xhr().open('GET', url);
    assert.equal(r.calls[0].args[1], url);
});

test('candidate loaded first keeps mid-roll support when the legacy companion starts later', () => {
    const r = realm(); r.run(vodSource); r.run(addonSource);
    new r.Xhr().open('GET', makeAdUrl({ bp: 'midroll' }));
    assert.ok(r.calls[0].args[1].startsWith('data:'));
});

test('page fetch remains untouched, including pause-ad calls to /ads', () => {
    const r = realm();
    const fetch = () => {};
    r.window.fetch = fetch;
    r.run(vodSource);
    assert.equal(r.window.fetch, fetch);
});

for (const [label, first, second] of [
    ['old add-on then integrated module', addonSource, vodSource],
    ['integrated module then old add-on', vodSource, addonSource],
    ['integrated module twice', vodSource, vodSource]
]) {
    test(`only one XHR wrapper with ${label}`, () => {
        const r = realm(); r.run(first);
        const installed = r.Xhr.prototype.open;
        r.run(second);
        assert.equal(r.Xhr.prototype.open, installed);
        new r.Xhr().open('GET', makeAdUrl());
        assert.equal(r.calls.length, 1);
        assert.ok(r.calls[0].args[1].startsWith('data:'));
    });
}

test('pass-through preserves native arity and unusual arguments', () => {
    const r = realm(); r.run(vodSource);
    new r.Xhr().open('GET');
    assert.deepEqual(r.calls[0].args, ['GET']);
    const unusual = { toString() { throw new Error('should be left to native XHR'); } };
    new r.Xhr().open('GET', unusual);
    assert.equal(r.calls[1].args[1], unusual);
});
