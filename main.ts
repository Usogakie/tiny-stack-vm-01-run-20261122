import fs from "node:fs";
import path from "node:path";
const IN = process.env.MAKEFUN_INPUT_DIR || "/input";
const OUT = process.env.MAKEFUN_OUTPUT_DIR || "/output";
function run(p, inp) {
  const s = [], c = [], m = new Int32Array(256), o = [];
  let pc = 0, n = 0, ip = 0, ex = 0, j = false;
  const trap = (k) => { ex = k; return true; };
  for (;;) {
    if (n >= 1e6) { trap(10); break; }
    if (pc < 0 || pc >= p.length) { trap(9); break; }
    const op = p[pc];
    let im = 0, nx = pc + 1;
    if (op === 1 || op === 2 || (op >= 48 && op <= 51)) {
      const need = op === 2 ? 4 : op === 1 ? 1 : 2;
      if (pc + 1 + need > p.length) { trap(9); break; }
      nx = pc + 1 + need;
      if (op === 1) { im = p[pc + 1]; if (im >= 128) im -= 256; }
      else if (op === 2) im = p[pc + 1] | p[pc + 2] << 8 | p[pc + 3] << 16 | p[pc + 4] << 24;
      else if (op === 51) im = p[pc + 1] | p[pc + 2] << 8;
      else { im = p[pc + 1] | p[pc + 2] << 8; if (im >= 32768) im -= 65536; }
    } else if (!((op <= 7) || (op >= 16 && op <= 34) || (op >= 48 && op <= 52) || (op >= 64 && op <= 65) || (op >= 80 && op <= 83))) {
      trap(5); break;
    }
    n++;
    j = false;
    if (op === 0) { ex = 0; break; }
    if (op === 1 || op === 2) {
      if (s.length + 1 > 256) { trap(3); break; }
      s.push(im | 0);
    } else if (op === 3) {
      if (s.length < 1) { trap(2); break; }
      s.pop();
    } else if (op === 4) {
      if (s.length < 1) { trap(2); break; }
      if (s.length + 1 > 256) { trap(3); break; }
      s.push(s[s.length - 1]);
    } else if (op === 5) {
      if (s.length < 2) { trap(2); break; }
      const a = s[s.length - 1];
      s[s.length - 1] = s[s.length - 2]; s[s.length - 2] = a;
    } else if (op === 6) {
      if (s.length < 2) { trap(2); break; }
      if (s.length + 1 > 256) { trap(3); break; }
      s.push(s[s.length - 2]);
    } else if (op === 7) {
      if (s.length < 3) { trap(2); break; }
      const a = s[s.length - 3];
      s[s.length - 3] = s[s.length - 2]; s[s.length - 2] = s[s.length - 1]; s[s.length - 1] = a;
    } else if (op >= 16 && op <= 22) {
      if (s.length < 2) { trap(2); break; }
      const b = s.pop(), a = s.pop();
      let r = 0;
      if (op === 16) r = (a + b) | 0;
      else if (op === 17) r = (a - b) | 0;
      else if (op === 18) r = Math.imul(a, b);
      else if (op === 19) { if (b === 0) { trap(4); break; } r = (a / b) | 0; }
      else if (op === 20) { if (b === 0) { trap(4); break; } r = (a % b) | 0; }
      else if (op === 21) { if (b === 0) { trap(4); break; } r = ((a >>> 0) / (b >>> 0)) | 0; }
      else { if (b === 0) { trap(4); break; } r = ((a >>> 0) % (b >>> 0)) | 0; }
      s.push(r);
    } else if (op === 23) {
      if (s.length < 1) { trap(2); break; }
      s.push((-s.pop()) | 0);
    } else if (op >= 24 && op <= 26) {
      if (s.length < 2) { trap(2); break; }
      const b = s.pop(), a = s.pop();
      s.push(op === 24 ? (a & b) | 0 : op === 25 ? (a | b) | 0 : (a ^ b) | 0);
    } else if (op === 27) {
      if (s.length < 1) { trap(2); break; }
      s.push((~s.pop()) | 0);
    } else if (op >= 28 && op <= 30) {
      if (s.length < 2) { trap(2); break; }
      const b = s.pop(), a = s.pop(), k = b & 31;
      s.push(op === 28 ? (a << k) | 0 : op === 29 ? (a >> k) | 0 : (a >>> k) | 0);
    } else if (op >= 32 && op <= 34) {
      if (s.length < 2) { trap(2); break; }
      const b = s.pop(), a = s.pop();
      s.push(op === 32 ? (a === b ? 1 : 0) : op === 33 ? (a < b ? 1 : 0) : ((a >>> 0) < (b >>> 0) ? 1 : 0));
    } else if (op === 48) {
      pc = nx + im; j = true;
    } else if (op === 49 || op === 50) {
      if (s.length < 1) { trap(2); break; }
      const v = s.pop();
      if ((op === 49 && v === 0) || (op === 50 && v !== 0)) { pc = nx + im; j = true; }
    } else if (op === 51) {
      if (c.length >= 64) { trap(7); break; }
      c.push(nx); pc = im; j = true;
    } else if (op === 52) {
      if (c.length === 0) { trap(8); break; }
      pc = c.pop(); j = true;
    } else if (op === 64) {
      if (s.length < 1) { trap(2); break; }
      const a = s.pop();
      if (a < 0 || a > 255) { trap(6); break; }
      s.push(m[a]);
    } else if (op === 65) {
      if (s.length < 2) { trap(2); break; }
      const a = s.pop(), v = s.pop();
      if (a < 0 || a > 255) { trap(6); break; }
      m[a] = v | 0;
    } else if (op === 80) {
      if (s.length < 1) { trap(2); break; }
      const v = s.pop(), t = String(v);
      if (o.length + t.length > 65536) { trap(11); break; }
      for (let i = 0; i < t.length; i++) o.push(t.charCodeAt(i));
    } else if (op === 81) {
      if (s.length < 1) { trap(2); break; }
      const v = s.pop();
      if (o.length + 1 > 65536) { trap(11); break; }
      o.push(v & 255);
    } else if (op === 82) {
      if (s.length + 1 > 256) { trap(3); break; }
      s.push(ip < inp.length ? inp[ip++] : -1);
    } else if (op === 83) {
      if (s.length < 1) { trap(2); break; }
      ex = s.pop() & 255;
      return { out: Buffer.from(o), exit: ex };
    }
    if (!j) pc = nx;
  }
  return { out: Buffer.from(o), exit: ex };
}
for (let n = 1; n <= 40; n++) {
  const id = "i" + String(n).padStart(3, "0");
  let prog = Buffer.alloc(0), input = Buffer.alloc(0);
  try { prog = fs.readFileSync(path.join(IN, id, "program.bin")); } catch {}
  try { input = fs.readFileSync(path.join(IN, id, "input.bin")); } catch {}
  const r = run(prog, input);
  const dir = path.join(OUT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "stdout.bin"), r.out);
  fs.writeFileSync(path.join(dir, "exit.txt"), String(r.exit));
}
