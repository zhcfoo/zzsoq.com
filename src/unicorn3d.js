/* 许愿之后的立体独角兽（Three.js）
 * 源文件；网页用的是打包后的 js/unicorn3d.js（运行 tools/build-3d.sh 生成）。
 *
 * 3D 画布盖在 SVG 蛋糕上，用与 SVG 完全相同的透视（正交相机俯视 asin(K)），
 * 所以立体马的位置、大小和原来的平面马一一对应。
 * 中柱和穹顶放了“只写深度”的隐形遮挡体，转到后面的马会被中柱挡住、头不会穿出穹顶。
 * 变身：每匹马的厚度从接近 0（像一张纸）弹性膨胀到完整立体，同时泛起粉色珠光；
 * 然后背上长出一对珍珠色的翅膀，慢慢扇动，离开立杆，绕着整个蛋糕盘旋飞行：
 * 起伏的航线、转弯时向内侧倾斜、爬升时抬头，腿收起、尾巴飘动，所有动作都是连续的正弦曲线，没有突变。 */
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
    wing: new THREE.MeshPhysicalMaterial({
      color: 0xffffff, roughness: .32, clearcoat: 1, clearcoatRoughness: .2, sheen: 1, sheenColor: new THREE.Color(0xffe3ee),
      iridescence: 1, iridescenceIOR: 1.45, iridescenceThicknessRange: [200, 640], side: THREE.DoubleSide,
    }),
    wingPink: new THREE.MeshPhysicalMaterial({
      color: 0xffd9e6, roughness: .34, clearcoat: .8, sheen: 1, sheenColor: new THREE.Color(0xfff0f5),
      iridescence: .8, iridescenceIOR: 1.4, side: THREE.DoubleSide,
    }),
  };
}

// 一只翅膀：三层羽毛（长飞羽、粉色次级飞羽、根部覆羽）向后扇形展开，沿 +z 方向
function makeWing(M) {
  const w = new THREE.Group();
  const feather = (len, width, angle, offset, y, mat) => {
    const m = new THREE.Mesh(SPHERE, mat);
    m.scale.set(width, .5, len / 2);
    m.rotation.y = angle;                                        // 负角度 = 向后掠
    m.position.set(Math.sin(angle) * (offset + len / 2), y, Math.cos(angle) * (offset + len / 2));
    w.add(m);
  };
  [[34, -.1], [32, -.3], [29, -.5], [25.5, -.7], [21.5, -.9], [17.5, -1.1], [14, -1.28]].forEach(([l, a]) => feather(l, 3.6, a, 2.5, 0, M.wing));
  [[22, -.18], [20, -.42], [17.5, -.66], [14.5, -.9], [11.5, -1.14]].forEach(([l, a]) => feather(l, 3.8, a, 1.8, .65, M.wingPink));
  [[11, -.08], [10, -.4], [9, -.72], [8, -1.04]].forEach(([l, a]) => feather(l, 4, a, .8, 1.25, M.wing));
  const root = new THREE.Mesh(SPHERE, M.gold);
  root.scale.set(2.2, 1.6, 2.2); root.position.y = .7; w.add(root);
  return w;
}

// 独角兽：单位与 SVG 中的马一致（原点在马鞍、x 朝前、y 朝上、z 是左右厚度）
// 带简单骨骼：身体(body) → 脖子(neck，含头)、尾巴(tail)、四条腿（大腿 → 膝 → 小腿 + 马蹄），用来跑步。
function makeUnicorn(M) {
  const root = new THREE.Group();
  const group = (parent, name, origin) => {
    const g = new THREE.Group();
    g.name = name;
    g.userData.o = origin;                                       // 这个关节在马身上的绝对位置
    const po = parent.userData.o || [0, 0, 0];
    g.position.set(origin[0] - po[0], origin[1] - po[1], origin[2] - po[2]);
    parent.add(g); return g;
  };
  const rel = (parent, v) => { const o = parent.userData.o || [0, 0, 0]; return [v[0] - o[0], v[1] - o[1], v[2] - o[2]]; };
  const blob = (parent, pos, scale, mat, rot) => {
    const m = new THREE.Mesh(SPHERE, mat);
    m.position.set(...rel(parent, pos)); m.scale.set(...scale);
    if (rot) m.rotation.set(...rot);
    parent.add(m); return m;
  };
  const limb = (parent, a, b, r, mat) => {
    const A = new THREE.Vector3(...rel(parent, a)), B = new THREE.Vector3(...rel(parent, b)), d = B.clone().sub(A);
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, d.length(), 6, 16), mat);
    m.position.copy(A).add(B).multiplyScalar(.5);
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    parent.add(m); return m;
  };
  root.userData.o = [0, 0, 0];
  const body = group(root, 'body', [0, 0, 0]);

  // 身体 + 马鞍
  blob(body, [-3, 4, 0], [19, 8.6, 7.6], M.porcelain);
  blob(body, [10.5, 3.4, 0], [8.4, 8.2, 7.4], M.porcelain);
  blob(body, [-15.5, 5.2, 0], [8.8, 8.6, 7.8], M.porcelain);
  blob(body, [-1, 7.2, 0], [6.8, 6.5, 8.2], M.saddle);
  blob(body, [-1, 12.7, 0], [6, 1.9, 5.3], M.saddle);
  const trim = new THREE.Mesh(new THREE.TorusGeometry(7, .45, 8, 48), M.gold);
  trim.rotation.x = Math.PI / 2; trim.scale.set(1, 8.25 / 7, 1); trim.position.set(-1, 9.4, 0); body.add(trim);
  // 翅膀（右翼朝 +z 展开，左翼是镜像）；变身前缩成 0
  [1, -1].forEach((side) => {
    const w = group(body, side > 0 ? 'wingR' : 'wingL', [4, 12.5, 5.2 * side]);
    w.add(makeWing(M));
    w.scale.set(0.001, 0.001, 0.001 * side);
  });

  // 脖子 + 头（一起点头）
  const neck = group(body, 'neck', [11, 5, 0]);
  limb(neck, [11, 5, 0], [20.5, 19.5, 0], 5.3, M.porcelain);
  blob(neck, [25, 22.6, 0], [7.4, 4.5, 4.2], M.porcelain, [0, 0, -.72]);
  blob(neck, [29.6, 18.6, 0], [3.5, 3.1, 3.4], M.porcelain);
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(1.35, 4.4, 14), M.porcelain);
    ear.position.set(...rel(neck, [22.4, 28.8, 2 * s])); ear.rotation.set(.22 * s, 0, .38); neck.add(ear);
    blob(neck, [26.5, 23.7, 3.5 * s], [.95, .95, .55], M.eye);
    blob(neck, [26.9, 24.1, 3.75 * s], [.28, .28, .2], M.pearl);
    blob(neck, [27.6, 20.8, 3.2 * s], [1.6, .9, .35], M.pink);
  });
  const horn = new THREE.Mesh(new THREE.ConeGeometry(1.4, 10.5, 20), M.gold);
  horn.position.set(...rel(neck, [25.8, 31.4, 0])); horn.rotation.z = -.5; neck.add(horn);
  [0, 1, 2].forEach((k) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15 - k * .32, .22, 8, 20), M.gold);
    ring.position.set(...rel(neck, [25.5 + k * 1.15, 28.4 + k * 2.2, 0])); ring.rotation.set(Math.PI / 2, -.5, 0); neck.add(ring);
  });
  const n0 = new THREE.Vector3(11, 5, 0), n1 = new THREE.Vector3(20.5, 19.5, 0);
  const back = new THREE.Vector3(-(n1.y - n0.y), n1.x - n0.x, 0).normalize().multiplyScalar(4.6);
  for (let i = 0; i < 8; i++) {
    const t = i / 7, p = n0.clone().lerp(n1, .12 + t * .92).add(back), r = 3.3 - t * 1.1;
    blob(neck, [p.x, p.y, (i % 2 ? 1 : -1) * 1.3], [r, r, r * .95], M.pink);
  }
  blob(neck, [23.6, 27.6, 0], [2.4, 2, 2.6], M.pink);
  const bridle = new THREE.Mesh(new THREE.TorusGeometry(3.3, .38, 8, 28), M.gold);
  bridle.position.set(...rel(neck, [28.6, 19.6, 0])); bridle.rotation.set(0, Math.PI / 2, -.72); neck.add(bridle);

  // 尾巴（随步伐甩动）
  const tail = group(body, 'tail', [-22, 8, 0]);
  const curve = new THREE.CatmullRomCurve3([[-22, 8], [-28.5, 7], [-31.5, 1], [-30.5, -7], [-27, -11.5]].map(([x, y]) => new THREE.Vector3(...rel(tail, [x, y, 0]))));
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 2.7, 14), M.pink));
  blob(tail, [-27, -11.5, 0], [2.7, 2.7, 2.7], M.pink);

  // 四条腿：大腿关节在肩/髋，膝关节在中间
  const LEGS = [
    { name: 'FL', hip: [11.5, .5, 3.6], L1: 9.4, L2: 9, r1: 2.8, r2: 2.2, front: true },
    { name: 'FR', hip: [11.5, .5, -3.6], L1: 9.4, L2: 9, r1: 2.8, r2: 2.2, front: true },
    { name: 'HL', hip: [-15.5, 1, 3.8], L1: 9.8, L2: 9.4, r1: 3.1, r2: 2.25, front: false },
    { name: 'HR', hip: [-15.5, 1, -3.8], L1: 9.8, L2: 9.4, r1: 3.1, r2: 2.25, front: false },
  ];
  LEGS.forEach((l) => {
    const upper = group(body, 'u' + l.name, l.hip);
    limb(upper, l.hip, [l.hip[0], l.hip[1] - l.L1, l.hip[2]], l.r1, M.porcelain);
    const knee = group(upper, 'k' + l.name, [l.hip[0], l.hip[1] - l.L1, l.hip[2]]);
    const ko = knee.userData.o;
    limb(knee, ko, [ko[0], ko[1] - l.L2, ko[2]], l.r2, M.porcelain);
    limb(knee, [ko[0], ko[1] - l.L2, ko[2]], [ko[0], ko[1] - l.L2 - 1.6, ko[2]], l.r2 + .3, M.gold);
  });
  root.userData.legs = LEGS;
  return root;
}

// 飞行姿态：phase 为扇翅相位（弧度），fly 为飞行程度（0 = 原来的站姿，1 = 完全飞起来），wings 为翅膀长出的程度
const lerp = (x, y, t) => x + (y - x) * t;
function pose(R, phase, fly, wings) {
  const j = R.joints, sn = Math.sin(phase);
  // 翅膀：上扇幅度大、下扇有力，正弦连续；上扇时略微向后收
  const flap = (.22 + .62 * sn) * wings;
  j.wingR.rotation.set(-flap, .14 * Math.sin(phase - .6) * wings, 0);
  j.wingL.rotation.set(flap, -.14 * Math.sin(phase - .6) * wings, 0);
  const ws = Math.max(.001, wings);
  j.wingR.scale.set(ws, ws, ws);
  j.wingL.scale.set(ws, ws, -ws);
  // 下扇时身体被托起
  j.body.position.y = -1.3 * sn * fly;
  j.body.rotation.z = .035 * Math.sin(phase + .8) * fly;
  j.neck.rotation.z = lerp(0, .1, fly) + .05 * Math.sin(phase + .9) * fly;
  j.tail.rotation.z = lerp(0, -.5, fly) + .12 * Math.sin(phase * .5 + 1) * fly;
  // 前腿收起、后腿向后伸展，随扇翅轻轻摆动
  ['FL', 'FR'].forEach((n, k) => {
    j['u' + n].rotation.z = lerp(0, .95, fly) + .07 * Math.sin(phase + k * .4) * fly;
    j['k' + n].rotation.z = lerp(0, -1.75, fly);
  });
  ['HL', 'HR'].forEach((n, k) => {
    j['u' + n].rotation.z = lerp(-.12, -.85, fly) + .06 * Math.sin(phase + 1 + k * .4) * fly;
    j['k' + n].rotation.z = lerp(.2, .45, fly);
  });
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
  // 画布比蛋糕大一圈（与 CSS 里 .ck3d 的外扩比例一致），独角兽可以飞到蛋糕外面
  const EX = { l: .3, r: .3, t: .12, b: .08 };
  const cam = new THREE.OrthographicCamera(vx - vw * EX.l - L.cx, vx + vw * (1 + EX.r) - L.cx, L.top - (vy - vh * EX.t), L.top - (vy + vh * (1 + EX.b)), 1, 5000);
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

  // 四匹独角兽
  const M = makeMaterials();
  const proto = makeUnicorn(M);
  const riders = Array.from({ length: L.horses }, (_, i) => {
    const horse = proto.clone();
    horse.rotation.order = 'YXZ';                                // 先朝向，再倾斜、俯仰
    const joints = {};
    horse.traverse((o) => { if (o.name) joints[o.name] = o; });
    scene.add(horse);
    const R = { horse, joints, i, morph: .03, wings: 0, fly: 0, phase: i * 1.7, a: null };
    pose(R, 0, 0, 0);
    return R;
  });

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (r.width && r.height) renderer.setSize(r.width, r.height, false);
  }
  resize();
  new ResizeObserver(resize).observe(canvas);

  const FLY = { r: 122, h: 64, wave: 11, speed: .55, flapHz: 1.45 };
  let active = false, last = performance.now();
  function render(frame) {
    const now = performance.now(), dt = Math.min(.05, (now - last) / 1000);
    last = now;
    if (!active || !frame) return;
    const cs = (window.Carousel && window.Carousel.state) ? window.Carousel.state.speed : .5;
    frame.forEach((f, i) => {
      const R = riders[i]; if (!R) return;
      if (R.a == null) R.a = f.a;
      const fly = R.fly;
      // 角速度：从八音盒的转速平滑过渡到飞行速度
      R.a += (cs + (FLY.speed - cs) * fly) * dt;
      R.phase += Math.PI * 2 * FLY.flapHz * dt;
      const a = R.a, ca = Math.cos(a);
      const r = L.ring + (FLY.r - L.ring) * fly;
      // 高度：从立杆上的位置，平滑升到起伏的航线
      const wave = 2 * a + i * 1.7;
      const onPole = (42 - f.bob) / cosA, inAir = FLY.h + FLY.wave * Math.sin(wave);
      const h = onPole + (inAir - onPole) * fly;
      const sc = (.78 + .22 * (ca + 1) / 2) * 1.42 * (1 - .1 * fly);
      R.horse.position.set(r * Math.sin(a), h, r * ca);
      R.horse.rotation.y = a;
      R.horse.rotation.x = -.24 * fly;                                           // 转弯时向圆心倾斜
      R.horse.rotation.z = Math.atan(2 * FLY.wave * Math.cos(wave) / r) * fly;   // 爬升时抬头、下降时低头
      R.horse.scale.set(sc, sc, sc * R.morph);
      pose(R, R.phase, fly, R.wings);
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
        .to(M.porcelain, { iridescence: .55, duration: 2.2 }, 1.2);
      riders.forEach((r, i) => {
        r.fly = 0; r.wings = 0; r.a = null;
        tl.to(r, { morph: 1, duration: 1.8, ease: 'elastic.out(1, .45)' }, .35 + i * .18)
          .to(r, { wings: 1, duration: 1.4, ease: 'back.out(1.4)' }, 1 + i * .2)    // 长出翅膀
          .to(r, { fly: 1, duration: 3.4, ease: 'sine.inOut' }, 1.5 + i * .25);     // 离开立杆，飞起来
      });
      return tl;
    },
    reset(gsap) {
      gsap.to(canvas, { opacity: 0, duration: .6, onComplete: () => { active = false; riders.forEach((r) => { r.fly = 0; r.wings = 0; r.a = null; }); } });
    },
  };
}
