// Shared primitives + helpers for CryptoLab
import React from 'react';
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Crypto helpers (conceptual, not production) ----------
const caesarShift = (text, k) => {
  const shift = ((k % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
};

const vigenere = (text, key, encrypt = true) => {
  if (!key) return text;
  const K = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!K.length) return text;
  let j = 0;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = K.charCodeAt(j % K.length) - 65;
    const dir = encrypt ? 1 : -1;
    j++;
    return String.fromCharCode(((c.charCodeAt(0) - base + dir * shift + 260) % 26) + base);
  });
};

// Fake-but-convincing AES: xor with a pseudo-random stream derived from key,
// then base64. Purely for visual effect.
const seedRand = (seed) => {
  let s = 0;
  for (const c of seed) s = (s * 131 + c.charCodeAt(0)) >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s & 0xff; };
};
const fakeAES = (text, key) => {
  const rnd = seedRand(key);
  const bytes = new TextEncoder().encode(text);
  const out = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ rnd();
  return btoa(String.fromCharCode(...out));
};
const fakeAESDecrypt = (b64, key) => {
  try {
    const rnd = seedRand(key);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const out = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ rnd();
    return new TextDecoder().decode(out);
  } catch { return ''; }
};

const bytesToBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (value) => Uint8Array.from(atob(value), (c) => c.charCodeAt(0));

const bytesToHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();

const supportsWebCrypto = () => Boolean(globalThis.crypto?.subtle);

const deriveAesKey = async (secret) => {
  if (!supportsWebCrypto()) throw new Error('Web Crypto API non disponibile');
  const material = new TextEncoder().encode(secret);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', material);
  return globalThis.crypto.subtle.importKey(
    'raw',
    digest,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
};

const encryptAesGcm = async (text, secret) => {
  if (!secret) throw new Error('Chiave segreta mancante');
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(secret);
  const plainBytes = new TextEncoder().encode(text);
  const cipherBuffer = await globalThis.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);
  const cipherBytes = new Uint8Array(cipherBuffer);
  const ivBase64 = bytesToBase64(iv);
  const cipherBase64 = bytesToBase64(cipherBytes);

  return {
    ivBase64,
    ivHex: bytesToHex(iv),
    cipherBase64,
    cipherHex: bytesToHex(cipherBytes),
    payload: `${ivBase64}:${cipherBase64}`,
  };
};

const decryptAesGcm = async (payload, secret) => {
  if (!secret) throw new Error('Chiave segreta mancante');
  const [ivBase64, cipherBase64] = String(payload || '').split(':');
  if (!ivBase64 || !cipherBase64) throw new Error('Pacchetto non valido');
  const iv = base64ToBytes(ivBase64);
  const cipherBytes = base64ToBytes(cipherBase64);
  const key = await deriveAesKey(secret);
  const plainBuffer = await globalThis.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
  return new TextDecoder().decode(plainBuffer);
};

const randomKey = (len = 16) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

// Tiny hash → 8 hex chars, for visual integrity demos
const tinyHash = (s) => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  const out = (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  return out.slice(0, 16);
};

// Simplified RSA-like: use two small primes, real modular math, but kept tiny.
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const modpow = (base, exp, mod) => {
  let r = 1n; base = BigInt(base) % BigInt(mod); exp = BigInt(exp);
  const m = BigInt(mod);
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % m;
    exp >>= 1n;
    base = (base * base) % m;
  }
  return Number(r);
};
const modInverse = (a, m) => {
  let [old_r, r] = [a, m];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  return ((old_s % m) + m) % m;
};
const genToyRSA = () => {
  const primes = [61, 53, 67, 71, 73, 79, 83, 89, 97, 101, 103];
  let p = primes[Math.floor(Math.random() * primes.length)];
  let q = primes[Math.floor(Math.random() * primes.length)];
  while (q === p) q = primes[Math.floor(Math.random() * primes.length)];
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  let e = 17;
  while (gcd(e, phi) !== 1) e += 2;
  const d = modInverse(e, phi);
  return { p, q, n, e, d };
};

// ---------- UI primitives ----------
const Card = ({ children, className = '', ...rest }) => (
  <div className={`bg-white border border-stone-200 rounded-2xl ${className}`} {...rest}>
    {children}
  </div>
);

const Pill = ({ children, tone = 'neutral', className = '' }) => {
  const tones = {
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    coral: 'bg-rose-50 text-rose-700 border-rose-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    ink: 'bg-stone-900 text-white border-stone-900',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled, ...rest }) => {
  const variants = {
    primary: 'bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300',
    secondary: 'bg-white text-stone-900 border border-stone-300 hover:bg-stone-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  };
  const sizes = { sm: 'px-3 py-1.5 text-[12px]', md: 'px-4 py-2 text-[13px]', lg: 'px-5 py-2.5 text-[14px]' };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

const SectionShell = ({ eyebrow, title, intro, children, summary }) => (
  <div className="max-w-[1100px] mx-auto px-8 py-10">
    <div className="mb-8">
      <div className="text-[11px] uppercase tracking-[0.14em] text-stone-500 mb-2">{eyebrow}</div>
      <h1 className="text-[34px] font-semibold text-stone-900 tracking-tight mb-3">{title}</h1>
      <p className="text-[15px] text-stone-600 leading-relaxed max-w-[640px]">{intro}</p>
    </div>
    <div className="space-y-6">{children}</div>
    {summary && (
      <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-900 text-stone-100 p-6">
        <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-3">Cosa hai imparato</div>
        <ul className="space-y-2">
          {summary.map((s, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed">
              <span className="text-amber-300 font-mono">0{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Little character avatars — geometric, not cartoon SVG
const Avatar = ({ who }) => {
  const config = {
    alice: { bg: '#DCE9FF', ring: '#2563eb', label: 'A', name: 'Alice' },
    bob:   { bg: '#E8F5EC', ring: '#059669', label: 'B', name: 'Bob' },
    trudy: { bg: '#FFE1DC', ring: '#E0543A', label: 'T', name: 'Trudy' },
  }[who];
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-14 h-14 rounded-full grid place-items-center font-semibold text-[18px]"
        style={{ background: config.bg, color: config.ring, boxShadow: `inset 0 0 0 2px ${config.ring}` }}
      >
        {config.label}
      </div>
      <div className="text-[12px] font-medium text-stone-700">{config.name}</div>
    </div>
  );
};

// Shared monospace output chip
const MonoBlock = ({ children, tone = 'neutral', className = '' }) => {
  const tones = {
    neutral: 'bg-stone-50 border-stone-200 text-stone-900',
    ink:     'bg-stone-900 border-stone-900 text-stone-100',
    blue:    'bg-blue-50 border-blue-200 text-blue-900',
    coral:   'bg-rose-50 border-rose-200 text-rose-900',
    green:   'bg-emerald-50 border-emerald-200 text-emerald-900',
  };
  return (
    <div className={`font-mono text-[13px] leading-relaxed break-all p-3 rounded-lg border ${tones[tone]} ${className}`}>
      {children || <span className="text-stone-400">—</span>}
    </div>
  );
};

const Pane = ({ label, tone, children }) => {
  const tones = {
    blue:  'bg-blue-50 border-blue-200',
    ink:   'bg-stone-900 border-stone-900',
    green: 'bg-emerald-50 border-emerald-200',
    coral: 'bg-rose-50 border-rose-200',
    amber: 'bg-amber-50 border-amber-200',
  };
  const labelTones = {
    blue: 'text-blue-700',
    ink: 'text-stone-400',
    green: 'text-emerald-700',
    coral: 'text-rose-700',
    amber: 'text-amber-800',
  };
  return (
    <div className={`rounded-xl border ${tones[tone]} p-3`}>
      <div className={`text-[10px] uppercase tracking-wider mb-2 ${labelTones[tone]}`}>{label}</div>
      {children}
    </div>
  );
};

const Arrow = ({ label }) => (
  <div className="flex flex-col items-center">
    <div className="text-[10px] uppercase tracking-wider text-stone-500 mb-1">{label}</div>
    <div className="w-12 h-[2px] bg-stone-400 relative">
      <div className="absolute -right-1 -top-[3px] w-0 h-0 border-l-[6px] border-l-stone-400 border-y-[4px] border-y-transparent" />
    </div>
  </div>
);

Object.assign(window, {
  // React
  React, useState, useEffect, useRef, useMemo, useCallback,
  // helpers
  caesarShift, vigenere, fakeAES, fakeAESDecrypt, randomKey, tinyHash,
  bytesToBase64, base64ToBytes, bytesToHex, supportsWebCrypto, encryptAesGcm, decryptAesGcm,
  genToyRSA, modpow,
  // UI
  Card, Pill, Button, SectionShell, Avatar, MonoBlock, Pane, Arrow,
});
