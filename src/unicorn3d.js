/* 许愿之后的立体独角兽（Three.js）
 * 源文件；网页用的是打包后的 js/unicorn3d.js（运行 tools/build-3d.sh 生成）。
 *
 * 3D 画布盖在 SVG 蛋糕上，用与 SVG 完全相同的透视（正交相机俯视 asin(K)），
 * 所以立体马的位置、大小和原来的平面马一一对应。
 * 中柱和穹顶放了“只写深度”的隐形遮挡体，转到后面的马会被中柱挡住、头不会穿出穹顶。
 * 变身：每匹马的厚度从接近 0（像一张纸）弹性膨胀到完整立体，同时泛起粉色珠光。 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const Y = new THREE.Vector3(0, 1, 0);
const SPHERE = new THREE.SphereGeometry(1, 36, 22);

function makeMaterials() {
  return {
    porcelain: new THREE.MeshPhysicalMaterial({
      color: 0xfff7f3, roughness: .28, clearcoat: 1, clearcoatRoughness: .12,
      sheen: .7, sheenColor: new THREE.Color(0xffd3e0), sheenRoughness: .5,
      iridescence: .55, iridescenceIOR: 1.3, iridescenceThicknessRange: [180, 520],
      emissive: new THREE.Color(0xffa8c4), emissiveIntensity: 0,
    }),
    pink: new THREE.MeshPhysicalMaterial({
      color: 0xf5a8bf, roughness: .36, clearcoat: .7, clearcoatRoughness: .2,
      sheen: 1, sheenColor: new THREE.Color(0xffe4ec),
    }),
    saddle: new THREE.MeshPhysicalMaterial({ color: 0xf09ab4, roughness: .3, clearcoat: 1, clearcoatRoughness: .1 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe8c27a, metalness: 1, roughness: .2 }),
    eye: new THREE.MeshStandardMaterial({ color: 0x3d262c, roughness: .12, metalness: .1 }),
    pearl: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .12, clearcoat: 1, iridescence: .9, iridescenceIOR: 1.4 }),
  };
}

// 旋转木马独角兽：单位与 SVG 中的马一致（原点在马鞍、x 朝前、y 朝上、z 是左右厚度）
function makeUnicorn(M) {
  const g = new THREE.Group();
  const blob = (pos, scale, mat, rot) => {
    const m = new THREE.Mesh(SPHERE, mat);
    m.position.set(...pos); m.scale.set(...scale);
    if (rot) m.rotation.set(...rot);
    g.add(m); return m;
  };
  const limb = (a, b, r, mat) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, d.length(), 6, 16), mat);
    m.position.copy(A).add(B).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    g.add(m); return m;
  };

  // 身体
  blob([-3, 4, 0], [19, 8.6, 7.6], M.porcelain);
  blob([10.5, 3.4, 0], [8.4, 8.2, 7.4], M.porcelain);
  blob([-15.5, 5.2, 0], [8.8, 8.6, 7.8], M.porcelain);
  // 脖子、头
  limb([11, 5, 0], [20.5, 19.5, 0], 5.3, M.porcelain);
  blob([25, 22.6, 0], [7.4, 4.5, 4.2], M.porcelain, [0, 0, -.72]);
  blob([29.6, 18.6, 0], [3.5, 3.1, 3.4], M.porcelain);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(1.35, 4.4, 14), M.porcelain);
    ear.position.set(22.4, 28.8, 2 * s); ear.rotation.set(.22 * s, 0, .38); g.add(ear);
    blob([26.5, 23.7, 3.5 * s], [.95, .95, .55], M.eye);
    blob([26.9, 24.1, 3.75 * s], [.28, .28, .2], M.pearl);
    blob([27.6, 20.8, 3.2 * s], [1.6, .9, .35], M.pink);           // 腮红
  });
  // 金色独角
  const horn = new THREE.Mesh(new THREE.ConeGeometry(1.4, 10.5, 20), M.gold);
  horn.position.set(25.8, 31.4, 0); horn.rotation.z = -.5; g.add(horn);
  [0, 1, 2].forEach((k) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15 - k * .32, .22, 8, 20), M.gold);
    ring.position.set(25.5 + k * 1.15, 28.4 + k * 2.2, 0); ring.rotation.set(Math.PI / 2, -.5, 0); g.add(ring);
  });
  // 鬃毛（沿脖子背后的一串卷）、额毛
  const n0 = new THREE.Vector3(11, 5, 0), n1 = new THREE.Vector3(20.5, 19.5, 0);
  const back = new THREE.Vector3(-(n1.y - n0.y), n1.x - n0.x, 0).normalize().multiplyScalar(4.6);
  for (let i = 0; i < 8; i++) {
    const t = i / 7, p = n0.clone().lerp(n1, .12 + t * .92).add(back);
    const r = 3.3 - t * 1.1;
    blob([p.x, p.y, (i % 2 ? 1 : -1) * 1.3], [r, r, r * .95], M.pink);
  }
  blob([23.6, 27.6, 0], [2.4, 2, 2.6], M.pink);
  // 尾巴
  const tail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-22, 8, 0), new THREE.Vector3(-28.5, 7, 0), new THREE.Vector3(-31.5, 1, 0),
    new THREE.Vector3(-30.5, -7, 0), new THREE.Vector3(-27, -11.5, 0),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(tail, 40, 2.7, 14), M.pink));
  blob([-27, -11.5, 0], [2.7, 2.7, 2.7], M.pink);
  // 腿：前腿抬起（腾跃），后腿着地
  const leg = (pts, r1, r2) => {
    limb(pts[0], pts[1], r1, M.porcelain);
    limb(pts[1], pts[2], r2, M.porcelain);
    limb(pts[2], pts[3], r2 + .25, M.gold);
  };
  leg([[12, 0, 3.6], [19.5, -1.4, 3.6], [24, -5.6, 3.6], [25.2, -6.9, 3.6]], 2.8, 2.2);
  leg([[9.5, -1.5, -3.6], [14, -8, -3.6], [18.5, -12, -3.6], [19.8, -13.2, -3.6]], 2.8, 2.2);
  leg([[-16, -1, 3.8], [-18.5, -10, 3.8], [-19, -18.4, 3.8], [-19, -20.4, 3.8]], 3.1, 2.25);
  leg([[-12, -1, -3.8], [-11, -9.5, -3.8], [-11.6, -17.4, -3.8], [-11.6, -19.4, -3.8]], 3, 2.25);
  // 马鞍：鞍褥包住身体两侧 + 鞍座 + 金边 + 缰绳
  blob([-1, 7.2, 0], [6.8, 6.5, 8.2], M.saddle);
  blob([-1, 12.7, 0], [6, 1.9, 5.3], M.saddle);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(7, .45, 8, 48), M.gold);
  trim.rotation.x = Math.PI / 2; trim.scale.set(1, 8.25 / 7, 1); trim.position.set(-1, 9.4, 0); g.add(trim);
  const bridle = new THREE.Mesh(new THREE.TorusGeometry(3.3, .38, 8, 28), M.gold);
  bridle.position.set(28.6, 19.6, 0); bridle.rotation.set(0, Math.PI / 2, -.72); g.add(bridle);
  blob([0, 15.4, 0], [2.5, 2.5, 2.5], M.pearl);                      // 立杆上的珍珠
  return g;
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(120,60,70,.55)'); gr.addColorStop(1, 'rgba(120,60,70,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function create(host, L) {
  const canvas = document.createElement('canvas');
  canvas.className = 'ck3d';
  host.appendChild(canvas);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.remove();
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .95;
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-140, 260, 220);
  scene.add(key, new THREE.HemisphereLight(0xfff6f2, 0xf2c4cd, .55));

  // 与 SVG 相同的投影：俯视角 asin(K)，1 世界单位 = 1 个 SVG 单位，世界原点 = 底层蛋糕顶面中心
  const sinA = L.K, cosA = Math.sqrt(1 - sinA * sinA);
  const [vx, vy, vw, vh] = L.viewBox;
  const cam = new THREE.OrthographicCamera(vx - L.cx, vx + vw - L.cx, L.top - vy, L.top - (vy + vh), 1, 5000);
  cam.position.set(0, 2000 * sinA, 2000 * cosA);
  cam.lookAt(0, 0, 0);

  // 隐形遮挡体：中柱、穹顶、檐口
  const occ = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
  const rimH = (L.top - L.domeY) / cosA;
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(L.drumR, L.drumR, rimH + 10, 48), occ);
  drum.position.y = (rimH + 10) / 2;
  const domeM = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), occ);
  domeM.scale.set(L.domeA, L.domeB / cosA, L.domeA); domeM.position.y = rimH;
  const valH = 15 / cosA;
  const valance = new THREE.Mesh(new THREE.CylinderGeometry(L.domeA, L.domeA, valH, 64, 1, true), occ);
  valance.position.y = rimH - valH / 2;
  [drum, domeM, valance].forEach((m) => { m.renderOrder = -1; scene.add(m); });

  // 四匹马 + 立杆 + 投影
  const M = makeMaterials();
  const proto = makeUnicorn(M);
  const poleGeo = new THREE.CylinderGeometry(1.5, 1.5, rimH, 16);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: 0 });
  const shadowGeo = new THREE.PlaneGeometry(64, 34);
  const riders = Array.from({ length: L.horses }, () => {
    const horse = proto.clone();
    const pole = new THREE.Mesh(poleGeo, M.gold);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    scene.add(horse, pole, shadow);
    return { horse, pole, shadow, morph: .03 };
  });

  function resize() {
    const r = host.getBoundingClientRect();
    if (r.width && r.height) renderer.setSize(r.width, r.height, false);
  }
  resize();
  new ResizeObserver(resize).observe(host);

  let active = false;
  function render(frame) {
    if (!active || !frame) return;
    frame.forEach((f, i) => {
      const R = riders[i]; if (!R) return;
      const x = L.ring * Math.sin(f.a), z = L.ring * Math.cos(f.a);
      R.horse.position.set(x, (42 - f.bob) / cosA, z);
      R.horse.rotation.y = f.a;
      R.horse.scale.set(f.sc, f.sc, f.sc * R.morph);
      R.pole.position.set(x, rimH / 2, z);
      R.shadow.position.set(x, .4, z);
      R.shadow.rotation.z = f.a;
      R.shadow.scale.set(f.sc, f.sc, 1);
    });
    renderer.render(scene, cam);
  }

  return {
    canvas,
    render,
    // 变身：纸片 → 立体
    morphIn(gsap) {
      active = true;
      riders.forEach((r) => { r.morph = .03; });
      const tl = gsap.timeline();
      tl.to(canvas, { opacity: 1, duration: .5 }, 0)
        .to(M.porcelain, { emissiveIntensity: .9, duration: .4 }, 0)
        .to(M.porcelain, { emissiveIntensity: 0, duration: 2.4, ease: 'power2.out' }, .6)
        .to(M.porcelain, { iridescence: 1, duration: .6 }, 0)
        .to(M.porcelain, { iridescence: .55, duration: 2.2 }, 1.2)
        .to(shadowMat, { opacity: .35, duration: 1.2 }, .6);
      riders.forEach((r, i) => tl.to(r, { morph: 1, duration: 1.8, ease: 'elastic.out(1, .45)' }, .35 + i * .18));
      return tl;
    },
    reset(gsap) {
      gsap.to(canvas, { opacity: 0, duration: .6, onComplete: () => { active = false; } });
      shadowMat.opacity = 0;
    },
  };
}
