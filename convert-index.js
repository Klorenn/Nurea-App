const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/i) || html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
let body = bodyMatch ? bodyMatch[1] : html;

// Extract script
let script = '';
body = body.replace(/<script>([\s\S]*?)<\/script>/i, (m, p1) => {
  script = p1;
  return '';
});

// Remove comments
body = body.replace(/<!--[\s\S]*?-->/g, '');

// Quick HTML to JSX conversions
body = body.replace(/class="/g, 'className="');
body = body.replace(/for="/g, 'htmlFor="');
body = body.replace(/stroke-width="/g, 'strokeWidth="');
body = body.replace(/stroke-linecap="/g, 'strokeLinecap="');
body = body.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
body = body.replace(/fill-rule="/g, 'fillRule="');
body = body.replace(/clip-rule="/g, 'clipRule="');

// Self close void tags
body = body.replace(/<img([^>]+)>/g, (m, p1) => {
  if (p1.endsWith('/')) return m;
  return `<img${p1}/>`;
});
body = body.replace(/<br>/g, '<br/>');
body = body.replace(/<hr>/g, '<hr/>');
body = body.replace(/<input([^>]+)>/g, (m, p1) => {
  if (p1.endsWith('/')) return m;
  return `<input${p1}/>`;
});

body = body.replace(/style="([^"]+)"/g, (m, p1) => {
  const parts = p1.split(';').filter(Boolean);
  const obj = {};
  for (let p of parts) {
    let [k, ...v] = p.split(':');
    if (!k || !v.length) continue;
    k = k.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    obj[k] = v.join(':').trim();
  }
  return `style={${JSON.stringify(obj)}}`;
});

// Escape `{` and `}` that might conflict in JSX if they are text
// But mostly they are fine if not used inside text. Actually we don't have to worry too much unless it's an issue.

// Extract styles from head
const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i) || html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
let styles = '';
if (headMatch) {
  const styleMatch = headMatch[1].match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  if (styleMatch) {
    styles = styleMatch[1];
  }
}

fs.writeFileSync('app/landing.css', styles);

const output = `
"use client"
import React, { useEffect } from 'react';
import Link from 'next/link';
import './landing.css';

export default function Page() {
  useEffect(() => {
    ${script}
  }, []);

  return (
    <>
      ${body}
    </>
  );
}
`;

fs.writeFileSync('app/page.tsx', output);
console.log('Converted index.html to app/page.tsx');
