import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateAddress, assertPublic, fetchPublic } from '../lib/public-url.js';

const dns = table => async host => {
  if (!(host in table)) throw new Error('ENOTFOUND ' + host);
  return [].concat(table[host]).map(address => ({ address, family: address.includes(':') ? 6 : 4 }));
};

test('private, loopback, link-local and mapped addresses are not public', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '224.0.0.1',
    '::1', '::', 'fc00::1', 'fd12::1', 'fe80::1', '::ffff:127.0.0.1', '::ffff:7f00:1', '64:ff9b::a00:1', 'not-an-ip',
    '::7f00:1', '::127.0.0.1', '::ffff:0:127.0.0.1', '2002:7f00:1::1', '2002:a9fe:a9fe::', 'fec0::1'])
    assert.equal(isPrivateAddress(ip), true, ip);
  for (const ip of ['93.184.216.34', '1.1.1.1', '172.32.0.1', '2606:4700::1111', '2002:5db8:d822::1'])
    assert.equal(isPrivateAddress(ip), false, ip);
});

test('a name that resolves to a private address is refused (127.0.0.1.nip.io)', async () => {
  const resolve = dns({ '127.0.0.1.nip.io': '127.0.0.1', 'shop.example': ['93.184.216.34', '10.0.0.5'], 'ok.example': '93.184.216.34' });
  await assert.rejects(assertPublic(new URL('https://127.0.0.1.nip.io/'), resolve), /private/);
  await assert.rejects(assertPublic(new URL('https://shop.example/'), resolve), /private/);   // any private answer refuses
  await assertPublic(new URL('https://ok.example/'), resolve);
  await assert.rejects(assertPublic(new URL('file:///etc/passwd'), resolve), /not http/);
  await assert.rejects(assertPublic(new URL('http://[::1]/'), resolve), /private/);
});

test('a public site that redirects to a private address is stopped at the redirect', async () => {
  const resolve = dns({ 'public.example': '93.184.216.34', 'next.example': '93.184.216.35' });
  const hits = [];
  const fetchImpl = async (url, init) => {
    hits.push(url); assert.equal(init.redirect, 'manual');
    if (url === 'https://public.example/') return new Response(null, { status: 302, headers: { location: 'https://next.example/a' } });
    if (url === 'https://next.example/a') return new Response(null, { status: 301, headers: { location: 'http://169.254.169.254/latest/meta-data/' } });
    return new Response('should not get here');
  };
  await assert.rejects(fetchPublic('https://public.example/', {}, { resolve, fetchImpl }), /private/);
  assert.deepEqual(hits, ['https://public.example/', 'https://next.example/a']);
});

test('ordinary redirects are followed and the final url is reported', async () => {
  const resolve = dns({ 'brand.example': '93.184.216.34', 'www.brand.example': '93.184.216.34' });
  const fetchImpl = async url => url === 'https://brand.example/'
    ? new Response(null, { status: 301, headers: { location: 'https://www.brand.example/home' } })
    : new Response('<title>Brand</title>', { status: 200 });
  const res = await fetchPublic('https://brand.example/', {}, { resolve, fetchImpl });
  assert.equal(res.status, 200);
  assert.equal(res.url, 'https://www.brand.example/home');
  assert.equal(await res.text(), '<title>Brand</title>');
});

test('redirect loops stop', async () => {
  const resolve = dns({ 'loop.example': '93.184.216.34' });
  const fetchImpl = async () => new Response(null, { status: 302, headers: { location: 'https://loop.example/' } });
  await assert.rejects(fetchPublic('https://loop.example/', {}, { resolve, fetchImpl }), /too many redirects/);
});
