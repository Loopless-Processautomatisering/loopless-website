"use client";

import { useEffect, useRef, type RefObject } from "react";

// Stoflus (oktober 2026): de ∞ uit het aangeleverde beeld (public/loop-infinity.png),
// getekend in ~150.000 deeltjes, techniek naar de Marmor-referentie (puntenwolk met eigen
// belichting, curl-drift, adem van de muis).
//
// Vorm: het stof wordt verdeeld over precies de zwarte vorm van het beeld, dus ook de
// onderbreking op het kruispunt klopt. Een afstandsveld binnen de vorm geeft elke plek een
// bolling als van een ronde buis (diepte + normaal voor de belichting), zodat het 3D oogt
// terwijl hij recht van voren blijft. Hij kantelt alleen een paar graden mee met de muis.
//
// Breken: de muis trekt een spoor door het stof; waar je doorheen gaat valt een gat in de
// loop, daarna veren de deeltjes terug.
//
// Scroll (`progressRef`, 0 → 1 over hero + logo-sectie): de ∞ knapt open vanaf het
// kruispunt, het stof waait naar de volgende sectie en vormt daar het Loopless-logo
// (public/logo-definitief-icon-trimmed.png), in de kleuren van het logo zelf.
// Op een telefoon gebeurt hetzelfde; alleen het muisspoor ontbreekt daar.
//
// Kleur: hemelsblauw met een verloop naar het lichtblauw van de pijl op de boog rechtsboven.
// Bij het scrollen wordt ~62% van het stof een levende lichtblauwe wolk over de hele
// logo-sectie; de rest vormt het logo in wit (dat wordt als laatste getekend, dus bovenop).
// De ∞ staat gecentreerd achter de kop; het stof wordt daar ijler (`avoidRef`), zodat de
// tekst leesbaar is en de loop als achtergrond zichtbaar blijft.
//
// Licht thema: gewone alfa-menging op wit. prefers-reduced-motion: geen drift en geen
// binnenkomst; scroll werkt wel.

const TRAIL = 8;

type Layout = { infX: number; infY: number; infW: number; logoX: number; logoY: number; logoW: number };

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

async function loadImage(src: string) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

// Verdeel `count` deeltjes over de vorm in een beeld. Breedte van de vorm wordt 2 (x van -1
// tot 1), midden op 0. Geeft positie, normaal, kleur en afstand tot het midden terug.
function sampleShape(
  img: HTMLImageElement,
  count: number,
  inside: (r: number, g: number, b: number, a: number) => boolean,
  seed: number,
) {
  const size = 560;
  const s = size / Math.max(img.width, img.height);
  const w = Math.round(img.width * s), h = Math.round(img.height * s);
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const cx = cv.getContext("2d", { willReadFrequently: true })!;
  cx.drawImage(img, 0, 0, w, h);
  const px = cx.getImageData(0, 0, w, h).data;

  // Masker + afstandsveld (chamfer, twee doorgangen): hoe ver ligt elke pixel van de rand.
  const dist = new Float32Array(w * h);
  let minX = w, minY = h, maxX = 0, maxY = 0;
  const cells: number[] = [];
  for (let i = 0; i < w * h; i++) {
    const on = inside(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]);
    dist[i] = on ? 1e6 : 0;
    if (on) {
      cells.push(i);
      const x = i % w, y = (i / w) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const D = Math.SQRT2;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!dist[i]) continue;
      let d = dist[i];
      if (x > 0) d = Math.min(d, dist[i - 1] + 1);
      if (y > 0) {
        d = Math.min(d, dist[i - w] + 1);
        if (x > 0) d = Math.min(d, dist[i - w - 1] + D);
        if (x < w - 1) d = Math.min(d, dist[i - w + 1] + D);
      }
      dist[i] = d;
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      if (!dist[i]) continue;
      let d = dist[i];
      if (x < w - 1) d = Math.min(d, dist[i + 1] + 1);
      if (y < h - 1) {
        d = Math.min(d, dist[i + w] + 1);
        if (x < w - 1) d = Math.min(d, dist[i + w + 1] + D);
        if (x > 0) d = Math.min(d, dist[i + w - 1] + D);
      }
      dist[i] = d;
    }
  // Halve lijndikte: bijna het maximum van het afstandsveld.
  const ds = cells.map((i) => dist[i]).sort((a, b) => a - b);
  const hw = Math.max(ds[Math.floor(ds.length * 0.995)] || 1, 1);

  const half = (maxX - minX + 1) / 2;
  const ox = (minX + maxX + 1) / 2, oy = (minY + maxY + 1) / 2;
  const rnd = mulberry32(seed);
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const key = new Float32Array(count);
  let maxR = 0;
  for (let n = 0; n < count; n++) {
    const i = cells[Math.floor(rnd() * cells.length)];
    const x = (i % w) + rnd(), y = ((i / w) | 0) + rnd();
    const d = dist[i];
    const xi = i % w, yi = (i / w) | 0;
    let gx = (xi < w - 1 ? dist[i + 1] : d) - (xi > 0 ? dist[i - 1] : d);
    let gy = (yi < h - 1 ? dist[i + w] : d) - (yi > 0 ? dist[i - w] : d);
    const gl = Math.hypot(gx, gy) || 1;
    gx /= gl;
    gy /= gl;
    // u = 0 op de middellijn, 1 op de rand: doorsnede van een ronde buis
    const u = Math.min(Math.max(1 - d / hw, 0), 1);
    const nz = Math.sqrt(1 - u * u);
    const X = (x - ox) / half, Y = -(y - oy) / half, Z = (nz * hw) / half;
    pos.set([X, Y, Z], n * 3);
    nor.set([-gx * u, gy * u, nz], n * 3);
    col.set([toLinear(px[i * 4] / 255), toLinear(px[i * 4 + 1] / 255), toLinear(px[i * 4 + 2] / 255)], n * 3);
    const r = Math.hypot(X, Y);
    key[n] = r;
    if (r > maxR) maxR = r;
  }
  for (let n = 0; n < count; n++) key[n] /= maxR || 1;
  // Verloop zoals de lus in het logo: navy, op de boog rechtsboven naar blauwgroen.
  const tint = new Float32Array(count);
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };
  for (let n = 0; n < count; n++) {
    const X = pos[n * 3], Y = pos[n * 3 + 1];
    tint[n] = sm(-0.05, 0.75, X) * sm(-0.15, 0.55, Y);
  }
  return { pos, nor, col, key, tint, aspect: (maxY - minY + 1) / (maxX - minX + 1) };
}

const VERT = /* glsl */ `
attribute vec3 aPosA, aNorA, aPosB, aNorB;
attribute vec4 aRand; attribute float aKey, aTint, aRole; // aRole: 0 = logo, 1 = wolk
attribute vec2 aCloud;
uniform float uTime, uForm, uMorph, uSize, uPR, uAlpha, uMotion, uPushR;
uniform vec3 uA, uB; // (x, y, schaal) van de ∞ en van het logo
uniform vec3 uKeyDir, uRimDir, uNavy, uTeal, uRayO;
uniform vec4 uAvoid; // tekstvak in canvas-pixels (x0, y0, x1, y1), y omhoog
uniform vec2 uView, uHalf;
uniform vec3 uCloudLo, uCloudHi;
uniform vec3 uTrailD[${TRAIL}]; uniform float uTrailA[${TRAIL}];
varying vec3 vCol; varying float vA;

vec3 curl(vec3 p, float t){
  vec3 c = vec3(0.); float f = 1.;
  for(int o=0;o<2;o++){
    vec3 q = p*f + vec3(t*.21, t*.17, -t*.13);
    float s1=sin(q.y*1.3), c1=cos(q.y*1.3), s2=sin(q.z*1.7), c2=cos(q.z*1.7), s3=sin(q.x*1.1), c3=cos(q.x*1.1);
    c += vec3(-1.3*s3*s1 - 1.7*c2*c3, -1.7*s1*s2 - 1.1*c3*c1, -1.1*s2*s3 - 1.3*c1*c2) / f;
    f *= 2.13;
  }
  return c;
}

void main(){
  float t = uTime;

  // ∞ → logo, per deeltje verschoven: het kruispunt breekt eerst, de buitenkant als laatste
  float e = clamp((uMorph * 1.7 - aKey * .55 - aRand.w * .15) / .9, 0., 1.);
  e = e * e * (3. - 2. * e);
  float mid = sin(3.14159 * e);
  vec3 pa = aPosA * uA.z + vec3(uA.xy, 0.);
  // doel: of een plek in het witte logo, of een plek in de wolk over de hele sectie
  vec3 pbLogo = aPosB * uB.z + vec3(uB.xy, 0.);
  vec3 pbCloud = vec3(aCloud * uHalf * 1.08, aRand.z * .5 * uA.z);
  vec3 pb = mix(pbLogo, pbCloud, aRole);
  vec3 lp = mix(pa, pb, e);
  float sc = mix(uA.z, uB.z, e);
  lp += (curl(lp / sc * .8 + aRand.xyz * .2, t * .3) * .35 + aRand.xyz * .3 + vec3(-.2, -.35, .25)) * mid * uA.z;
  // de wolk blijft leven: trage curl-drift
  lp += curl(lp / uA.z * .35 + aRand.xyz, t * .12) * .18 * uA.z * e * aRole * uMotion;
  vec3 n = normalize(mix(aNorA, mix(aNorB, vec3(0., 0., 1.), aRole), e) + 1e-4);

  vec3 wp = (modelMatrix * vec4(lp, 1.)).xyz;
  vec3 wn = normalize(mat3(modelMatrix) * n);
  vec3 V = normalize(cameraPosition - wp);
  vec3 off = vec3(0.);
  float alpha = 1.;

  // levend: kleine drift
  off += (wn.zxy * sin(t*(.6+.8*aRand.w) + aRand.x*6.28) - wn.yzx * cos(t*(.5+.7*aRand.z) + aRand.y*6.28)) * .0025 * sc * uMotion;

  // de rand stuift: af en toe drijft stof van de omtrek af en komt terug
  float edge = 1. - abs(dot(wn, V));
  float s = smoothstep(0., .04, smoothstep(.75, .99, edge) * .2 - aRand.w * .8) * uMotion * (1. - mid);
  if (s > 0.) {
    float ph = fract(t * (.05 + .05 * fract(aRand.x * 7.1)) + aRand.y * 3.7);
    vec3 fl = curl(wp * 1.2 + aRand.xyz * .3, t * .5) * .06 + wn * .1 + vec3(.03, .05, 0.);
    off += s * fl * sc * (ph * ph * 2.4 + ph * .3);
    alpha *= mix(1., smoothstep(0., .14, ph) * (1. - smoothstep(.45, 1., ph)), s);
  }

  // binnenkomst: een wolk stof die samentrekt tot de lus
  float k = clamp((1. - uForm) * 1.7 - aRand.w * .7, 0., 1.);
  k = k * k * (3. - 2. * k);
  if (k > 0.) {
    vec3 cl = curl(wp * .5 + aRand.xyz * .06, t * .3);
    off += (cl * .4 + aRand.xyz * .3 + wn * .15) * k * sc * (.7 + .6 * aRand.w);
    alpha *= 1. - .5 * k;
  }

  // de breuk onder de muis: het spoor blaast deeltjes weg, daarna vallen ze terug
  float hover = 1. - smoothstep(0., .1, uMorph);
  for (int i = 0; i < ${TRAIL}; i++) {
    float a = uTrailA[i] * hover;
    if (a < .002) continue;
    vec3 dir = uTrailD[i];
    vec3 rel = wp - uRayO;
    vec3 away = rel - dir * dot(rel, dir);
    float dd = length(away);
    float f = 1. - smoothstep(0., uPushR, dd);
    f *= f;
    vec3 push = normalize(away + aRand.xyz * .25 + 1e-5);
    off += (push + curl(wp * 1.5, t) * .15) * f * a * (.55 + .45 * aRand.w);
  }

  vec3 p = wp + off;
  vec4 mv = viewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;

  // belichting ∞ in de kleuren van de logolus: navy met een blauwgroen verloop; het licht
  // maakt alleen lichter of donkerder binnen die kleur. Logo: zijn eigen pixelkleur.
  float key = pow(clamp((dot(wn, uKeyDir) + .15) / 1.15, 0., 1.), 1.4);
  float rim = pow(clamp(dot(wn, uRimDir), 0., 1.), 1.6) * (.3 + .9 * edge);
  vec3 baseA = mix(uNavy, uTeal, aTint);
  vec3 colA = baseA * (.68 + .6 * key);
  colA = mix(colA, uTeal * 1.15, clamp(rim, 0., 1.) * .3);
  // glanslijn langs de buis: maakt de bolling zichtbaar
  float spec = pow(max(dot(reflect(-uKeyDir, wn), V), 0.), 18.);
  colA = mix(colA, vec3(.88, .95, 1.), spec * .6);
  // logo wit, wolk in lichte en diepere blauwen door elkaar
  vec3 colLogo = vec3(.93 + .07 * key);
  vec3 colCloud = mix(uCloudLo, uCloudHi, aRand.w) * (.9 + .2 * key);
  vec3 colB = mix(colLogo, colCloud, aRole);
  vec3 col = mix(colA, colB, e);
  alpha *= (.85 + .15 * key) * (1. - .35 * mid);
  alpha *= mix(1., mix(1., .4, aRole), e); // wolk ijler dan het logo

  // het stof wijkt voor de tekst: binnen het tekstvak ijl, met een zachte rand
  vec2 sp = (gl_Position.xy / gl_Position.w * .5 + .5) * uView;
  vec2 dq = max(max(uAvoid.xy - sp, sp - uAvoid.zw), 0.);
  float inText = 1. - smoothstep(0., 70., length(dq));
  alpha *= 1. - .5 * inText * (1. - e);

  float sz = uSize * uPR * (.8 + .4 * aRand.w) * (1. + .4 * k + .3 * mid + .5 * e * aRole) / -mv.z;
  float px = max(sz, 1.2);
  alpha *= clamp(sz * sz / (px * px), .25, 1.);
  gl_PointSize = px;
  vCol = col;
  vA = alpha * uAlpha;
}`;

const FRAG = /* glsl */ `
varying vec3 vCol; varying float vA;
void main(){
  vec2 c = gl_PointCoord - .5;
  float r = dot(c, c) * 4.;
  float m = smoothstep(1., .25, r);
  if (m < .01) discard;
  gl_FragColor = vec4(vCol, vA * m);
  #include <colorspace_fragment>
}`;

export function LoopDust({
  className,
  progressRef,
  avoidRef,
}: {
  className?: string;
  /** Scrollvoortgang 0–1 over hero + logo-sectie. */
  progressRef: RefObject<number>;
  /** Tekstvak waar het stof voor wijkt (de kop in de hero). */
  avoidRef?: RefObject<HTMLElement | null>;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const [THREE, infImg, logoImg] = await Promise.all([
        import("three"),
        loadImage("/loop-infinity.png"),
        loadImage("/logo-definitief-icon-trimmed.png"),
      ]).catch(() => [null, null, null] as const);
      if (disposed || !THREE || !infImg || !logoImg) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const phone = !canHover && Math.min(window.innerWidth, window.innerHeight) < 700;
      const cores = navigator.hardwareConcurrency || 4;
      const COUNT = phone ? 95000 : window.innerWidth >= 1680 && cores >= 8 ? 260000 : 210000;
      const DPR = Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 1.75);

      const inf = sampleShape(infImg, COUNT, (r, g, b) => r * 0.2126 + g * 0.7152 + b * 0.0722 < 128, 1891);
      const logo = sampleShape(
        logoImg,
        COUNT,
        (r, g, b, a) => a > 128 && !(r > 232 && g > 232 && b > 232),
        41,
      );
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
      } catch {
        return;
      }
      renderer.setPixelRatio(DPR);
      renderer.setClearColor(0x000000, 0);
      Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
      const camDist = 10;
      camera.position.set(0, 0, camDist);
      camera.lookAt(0, 0, 0);

      const rnd = mulberry32(7);
      const rand = new Float32Array(COUNT * 4);
      for (let i = 0; i < COUNT; i++) rand.set([rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1, rnd()], i * 4);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(inf.pos, 3));
      geo.setAttribute("aPosA", new THREE.BufferAttribute(inf.pos, 3));
      geo.setAttribute("aNorA", new THREE.BufferAttribute(inf.nor, 3));
      geo.setAttribute("aPosB", new THREE.BufferAttribute(logo.pos, 3));
      geo.setAttribute("aNorB", new THREE.BufferAttribute(logo.nor, 3));
      geo.setAttribute("aKey", new THREE.BufferAttribute(inf.key, 1));
      geo.setAttribute("aTint", new THREE.BufferAttribute(inf.tint, 1));
      geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
      // Rol per deeltje: de eerste ~62% wordt wolk, de rest het logo. Het logo komt zo als
      // laatste getekend en ligt bovenop de wolk.
      const role = new Float32Array(COUNT);
      const cloudPos = new Float32Array(COUNT * 2);
      const cloudCount = Math.floor(COUNT * 0.62);
      for (let i = 0; i < COUNT; i++) {
        role[i] = i < cloudCount ? 1 : 0;
        cloudPos[i * 2] = rnd() * 2 - 1;
        cloudPos[i * 2 + 1] = rnd() * 2 - 1;
      }
      geo.setAttribute("aRole", new THREE.BufferAttribute(role, 1));
      geo.setAttribute("aCloud", new THREE.BufferAttribute(cloudPos, 2));

      const uni = {
        uTime: { value: 0 },
        uForm: { value: reduce ? 1 : 0 },
        uMorph: { value: 0 },
        uSize: { value: 1 },
        uPR: { value: DPR },
        uAlpha: { value: 0.95 },
        uMotion: { value: reduce ? 0 : 1 },
        uPushR: { value: 0.35 },
        uA: { value: new THREE.Vector3(0, 0, 1) },
        uB: { value: new THREE.Vector3(0, 0, 1) },
        uKeyDir: { value: new THREE.Vector3(-0.6, 0.65, 0.45).normalize() },
        uRimDir: { value: new THREE.Vector3(0.75, -0.55, 0.2).normalize() },
        uNavy: { value: new THREE.Color("#7fb2f0") }, // hemelsblauw
        uTeal: { value: new THREE.Color("#22b8cf") }, // lichtblauw van de pijl
        uCloudLo: { value: new THREE.Color("#a8cbf7") },
        uCloudHi: { value: new THREE.Color("#2f6fd6") },
        uHalf: { value: new THREE.Vector2(1, 1) },
        uAvoid: { value: new THREE.Vector4(-1, -1, -1, -1) },
        uView: { value: new THREE.Vector2(1, 1) },
        uRayO: { value: new THREE.Vector3() },
        uTrailD: { value: Array.from({ length: TRAIL }, () => new THREE.Vector3(0, 0, -1)) },
        uTrailA: { value: new Float32Array(TRAIL) },
      };
      const mat = new THREE.ShaderMaterial({
        uniforms: uni,
        vertexShader: VERT,
        fragmentShader: FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const cloud = new THREE.Points(geo, mat);
      cloud.frustumCulled = false;
      const tiltGroup = new THREE.Group();
      tiltGroup.add(cloud);
      scene.add(tiltGroup);

      // --- Plek en maat: de ∞ in de hero, het logo links in de volgende sectie ---
      const layout = () => {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        const viewH = 2 * camDist * Math.tan((camera.fov * Math.PI) / 360);
        const viewW = viewH * camera.aspect;
        const wide = w >= 768;
        const L: Layout = wide
          ? {
              infX: 0, infY: -viewH * 0.02,
              infW: Math.min(viewW * 0.72, (viewH * 0.78) / inf.aspect),
              logoX: -viewW * 0.2, logoY: 0,
              logoW: Math.min(viewW * 0.34, (viewH * 0.5) / logo.aspect),
            }
          : {
              infX: 0, infY: 0,
              infW: Math.min(viewW * 1.05, (viewH * 0.5) / inf.aspect),
              logoX: 0, logoY: viewH * 0.25,
              logoW: Math.min(viewW * 0.72, (viewH * 0.3) / logo.aspect),
            };
        uni.uA.value.set(L.infX, L.infY, L.infW / 2);
        uni.uB.value.set(L.logoX, L.logoY, L.logoW / 2);
        uni.uHalf.value.set(viewW / 2, viewH / 2);
        // puntgrootte: dicht genoeg dat het een strakke vorm is, ongeacht scherm of aantal
        uni.uSize.value = (phone ? 13 : 15) * Math.sqrt(150000 / COUNT) * (h / 950) * (L.infW / (viewW * 0.62 || 1)) ** 0.5;
      };
      layout();
      const ro = new ResizeObserver(layout);
      ro.observe(host);

      // --- Muis ---
      const ptr = { nx: 0, ny: 0, lx: 0, ly: 0, has: false, over: false, speed: 0 };
      const tilt = { x: 0, y: 0 };
      const trail = Array.from({ length: TRAIL }, () => ({ d: new THREE.Vector3(0, 0, -1), a: 0, a0: 0, age: 99 }));
      let trailHead = 0, trailClock = 0;
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const onMove = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        ptr.nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ptr.ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        if (!ptr.has) {
          ptr.has = true;
          ptr.lx = ptr.nx;
          ptr.ly = ptr.ny;
        }
        ptr.over = e.clientY >= rect.top && e.clientY <= rect.bottom;
      };
      const onLeave = () => {
        ptr.over = false;
      };
      if (canHover && !reduce) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
      }

      let visible = true;
      let raf = 0;
      let prev = performance.now();
      let T = 0;
      let morph = progressRef.current ?? 0;
      const formT0 = performance.now() + 120;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        if (!reduce) T += dt;
        uni.uTime.value = T;
        if (!reduce) uni.uForm.value = 1 - 2 ** (-10 * Math.min(Math.max((now - formT0) / 2600, 0), 1));

        // scroll volgen op tijd, niet per beeldje
        const target = Math.min(Math.max(((progressRef.current ?? 0) - 0.06) / 0.84, 0), 1);
        morph += (target - morph) * (1 - Math.exp(-dt * 7));
        uni.uMorph.value = morph;

        // alleen meekantelen met de muis, verder recht van voren
        const k1 = 1 - Math.exp(-dt * 3);
        tilt.x += ((ptr.has ? ptr.nx : 0) - tilt.x) * k1;
        tilt.y += ((ptr.has ? ptr.ny : 0) - tilt.y) * k1;
        tiltGroup.rotation.set(-tilt.y * 0.09, tilt.x * 0.14, 0);
        tiltGroup.updateMatrixWorld(true);

        if (canHover && ptr.has) {
          ray.setFromCamera(ndc.set(ptr.nx, ptr.ny), camera);
          uni.uRayO.value.copy(ray.ray.origin);
          const mv = Math.hypot(ptr.nx - ptr.lx, ptr.ny - ptr.ly) / Math.max(dt, 1e-3);
          ptr.speed += (mv - ptr.speed) * (1 - Math.exp(-dt * 10));
          ptr.lx = ptr.nx;
          ptr.ly = ptr.ny;
          trailClock += dt;
          if (trailClock > 0.045 && ptr.over) {
            trailClock = 0;
            trailHead = (trailHead + 1) % TRAIL;
            const tr = trail[trailHead];
            tr.d.copy(ray.ray.direction);
            tr.age = 0;
            tr.a0 = 0.4 + 0.35 * Math.min(ptr.speed / 2.5, 1);
          }
          trail[trailHead].d.copy(ray.ray.direction);
          if (ptr.over) trail[trailHead].a0 = Math.max(trail[trailHead].a0, 0.42);
        }
        trail.forEach((tr, i) => {
          tr.age += dt;
          const rise = 1 - Math.exp(-tr.age * 18);
          const fall = i === trailHead && ptr.over ? 1 : Math.exp(-Math.max(0, tr.age - 0.05) / 0.5);
          tr.a = tr.a0 * rise * fall;
          uni.uTrailD.value[i].copy(tr.d);
          uni.uTrailA.value[i] = tr.a * uni.uForm.value;
        });

        // tekstvak volgen (schuift mee met de pagina)
        const box = renderer.domElement.getBoundingClientRect();
        uni.uView.value.set(box.width, box.height);
        const el = avoidRef?.current;
        if (el) {
          const r = el.getBoundingClientRect();
          const pad = 18;
          uni.uAvoid.value.set(r.left - box.left - pad, box.bottom - r.bottom - pad, r.right - box.left + pad, box.bottom - r.top + pad);
        }

        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);

      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        prev = performance.now();
      });
      io.observe(host);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        geo.dispose();
        mat.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
      if (disposed) cleanup();
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [progressRef, avoidRef]);

  return <div ref={hostRef} aria-hidden className={className} />;
}
