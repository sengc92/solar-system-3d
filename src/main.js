import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { earthLayers, marsLayers, planets, moon, earthFunFacts } from './data.js';

// 当前展示的行星内部结构（默认地球，可切换到火星）
let currentLayers = earthLayers;

// ===== 纹理加载器 =====
const textureLoader = new THREE.TextureLoader();
const TEX = {
  sun: textureLoader.load('/textures/sun.jpg'),
  mercury: textureLoader.load('/textures/mercury.jpg'),
  venus: textureLoader.load('/textures/venus_atmosphere.jpg'),
  earth: textureLoader.load('/textures/earth_daymap.jpg'),
  earthClouds: textureLoader.load('/textures/earth_clouds.jpg'),
  earthNight: textureLoader.load('/textures/earth_nightmap.jpg'),
  mars: textureLoader.load('/textures/mars.jpg'),
  jupiter: textureLoader.load('/textures/jupiter.jpg'),
  saturn: textureLoader.load('/textures/saturn.jpg'),
  saturnRing: textureLoader.load('/textures/saturn_ring.png'),
  uranus: textureLoader.load('/textures/uranus.jpg'),
  neptune: textureLoader.load('/textures/neptune.jpg'),
  milkyWay: textureLoader.load('/textures/milky_way.jpg'),
  moon: textureLoader.load('/textures/moon.jpg'),
};
// 设置颜色空间，让纹理颜色更真实 + 各向异性过滤让斜视角更锐利
Object.values(TEX).forEach((t) => {
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16; // 各向异性过滤，提升斜视角纹理清晰度
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
});

// ===== 纹理加载完成检测（淡出加载遮罩） =====
const loaderEl = document.getElementById('loader');
let loadedTextures = 0;
const totalTextures = Object.keys(TEX).length;
function onTextureLoaded() {
  loadedTextures++;
  if (loadedTextures >= totalTextures && loaderEl) {
    setTimeout(() => loaderEl.classList.add('hidden'), 400);
  }
}
Object.values(TEX).forEach((t) => {
  t.addEventListener ? t.addEventListener('load', onTextureLoaded) : null;
});
// 兜底：如果事件未触发，5 秒后强制隐藏
setTimeout(() => { if (loaderEl) loaderEl.classList.add('hidden'); }, 5000);

// ===== 场景初始化 =====
const canvas = document.getElementById('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x030308);

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  800
);
camera.position.set(0, 26, 58);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.localClippingEnabled = true; // 启用材质级裁剪平面

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 6;
controls.maxDistance = 150;
controls.target.set(0, 0, 0);

// ===== 银河星空背景（等距柱状投影纹理球体） =====
const skyGeo = new THREE.SphereGeometry(250, 64, 64);
const skyMat = new THREE.MeshBasicMaterial({
  map: TEX.milkyWay,
  side: THREE.BackSide,
  depthWrite: false,
});
const skySphere = new THREE.Mesh(skyGeo, skyMat);
scene.add(skySphere);

// 额外的前景星星（立体感）
function createStars(count, radiusRange, size, opacity) {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = radiusRange[0] + Math.random() * (radiusRange[1] - radiusRange[0]);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const t = Math.random();
    if (t < 0.7) { colors[i*3]=1; colors[i*3+1]=1; colors[i*3+2]=1; }
    else if (t < 0.85) { colors[i*3]=0.75; colors[i*3+1]=0.8; colors[i*3+2]=1; }
    else { colors[i*3]=1; colors[i*3+1]=0.88; colors[i*3+2]=0.65; }
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size,
    transparent: true,
    opacity,
    sizeAttenuation: true,
    vertexColors: true,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}
scene.add(createStars(1200, [40, 140], 0.3, 0.85));

// ===== 光照系统（太阳光在真空中几乎不衰减，保证所有行星均匀照亮） =====
// 太阳中心点光源（decay=0 使光不随距离衰减，模拟真空中的太阳光）
const sunLight = new THREE.PointLight(0xfff5e0, 3.0, 0, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// 环境光（让暗面可见）
const ambient = new THREE.AmbientLight(0xaabbdd, 0.6);
scene.add(ambient);

// 半球光（模拟宇宙散射光，让行星更有立体感）
const hemi = new THREE.HemisphereLight(0xaabbdd, 0x334455, 0.5);
scene.add(hemi);

// ===== 太阳（真实纹理 + 体积日冕光晕） =====
const sunGroup = new THREE.Group();
const sunGeo = new THREE.SphereGeometry(4, 96, 96);
const sunMat = new THREE.MeshBasicMaterial({ map: TEX.sun });
const sun = new THREE.Mesh(sunGeo, sunMat);
sunGroup.add(sun);

// 使用自定义 shader 实现柔和的日冕光晕（Fresnel 径向渐隐）
function createShaderGlow(radius, color, opacityMul) {
  const g = new THREE.SphereGeometry(radius, 64, 64);
  const m = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: new THREE.Color(color) },
      tOpacity: { value: opacityMul },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 tColor;
      uniform float tOpacity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Fresnel：边缘发光，中心透明（适合做日冕）
        float fresnel = 1.0 - abs(dot(normalize(vNormal), normalize(vViewDir)));
        float intensity = pow(fresnel, 2.5) * tOpacity;
        gl_FragColor = vec4(tColor, intensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  return new THREE.Mesh(g, m);
}

// 多层日冕光晕（外→内，亮度逐层递增）
const glowLayers = [
  createShaderGlow(4.4, 0xffaa30, 0.55),
  createShaderGlow(5.2, 0xff7700, 0.38),
  createShaderGlow(6.6, 0xff4400, 0.22),
];
glowLayers.forEach((g) => sunGroup.add(g));

// 日冕粒子
const coronaGeo = new THREE.BufferGeometry();
const coronaCount = 1200;
const coronaPos = new Float32Array(coronaCount * 3);
for (let i = 0; i < coronaCount; i++) {
  const r = 4.0 * (1.02 + Math.random() * 0.5);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  coronaPos[i*3] = r * Math.sin(phi) * Math.cos(theta);
  coronaPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  coronaPos[i*3+2] = r * Math.cos(phi);
}
coronaGeo.setAttribute('position', new THREE.BufferAttribute(coronaPos, 3));
const coronaMat = new THREE.PointsMaterial({
  color: 0xffaa40,
  size: 0.06,
  transparent: true,
  opacity: 0.45,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const corona = new THREE.Points(coronaGeo, coronaMat);
sunGroup.add(corona);

scene.add(sunGroup);

// ===== 轨道线（优雅的细线，带淡蓝灰色彩） =====
function createOrbit(radius) {
  const points = [];
  const segments = 256;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: 0x556688,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  return new THREE.Line(geo, mat);
}

// ===== 行星（使用 NASA 真实纹理） =====
const planetGroups = [];
const earthRef = { group: null, mesh: null, basePosition: null };

// 行星英文名 -> 纹理映射
const textureMap = {
  Mercury: TEX.mercury,
  Venus: TEX.venus,
  Earth: TEX.earth,
  Mars: TEX.mars,
  Jupiter: TEX.jupiter,
  Saturn: TEX.saturn,
  Uranus: TEX.uranus,
  Neptune: TEX.neptune,
};

planets.forEach((p) => {
  const orbit = createOrbit(p.distance);
  scene.add(orbit);

  const group = new THREE.Group();
  const geo = new THREE.SphereGeometry(p.size, 96, 96);

  const texture = textureMap[p.en] || null;
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff,
    roughness: p.isEarth ? 0.55 : 0.85,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // 土星环（真实透明环纹理）
  if (p.hasRing) {
    const ringGeo = new THREE.RingGeometry(p.size * 1.2, p.size * 2.4, 128);
    // 修改 UV 让环纹理径向显示
    const pos = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      const len = (v3.length() - p.size * 1.2) / (p.size * 2.4 - p.size * 1.2);
      uv.setXY(i, 0, len);
    }
    const ringMat = new THREE.MeshStandardMaterial({
      map: TEX.saturnRing,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    group.add(ring);
  }

  // 地球：云层 + 自转倾斜
  if (p.isEarth) {
    mesh.userData.planetName = '地球';

    // 云层（真实云纹理）
    const cloudGeo = new THREE.SphereGeometry(p.size * 1.02, 96, 96);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: TEX.earthClouds,
      transparent: true,
      opacity: 0.7,
      roughness: 1,
      metalness: 0,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    cloudMesh.userData.isCloud = true;
    group.add(cloudMesh);

    // 地球大气层（Fresnel 边缘发光，蓝色散射）
    const atmoGeo = new THREE.SphereGeometry(p.size * 1.08, 96, 96);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: {
        tColor: { value: new THREE.Color(0x4a8fe0) },
        tIntensity: { value: 0.9 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 tColor;
        uniform float tIntensity;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          float fresnel = 1.0 - abs(dot(normalize(vNormal), normalize(vViewDir)));
          float alpha = pow(fresnel, 3.0) * tIntensity;
          gl_FragColor = vec4(tColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    group.add(atmoMesh);

    earthRef.mesh = mesh;
    earthRef.group = group;
    earthRef.cloud = cloudMesh;
    earthRef.atmosphere = atmoMesh;
    earthRef.basePosition = new THREE.Vector3(p.distance, 0, 0);

    // 创建月球（绕地球运行）
    const moonGeo = new THREE.SphereGeometry(moon.size, 48, 48);
    const moonMat = new THREE.MeshStandardMaterial({
      map: TEX.moon,
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.userData.planetName = '月球';
    group.add(moonMesh); // 作为地球子对象，自动跟随地球
    earthRef.moon = moonMesh;
    earthRef.moonAngle = 0;
  }

  scene.add(group);
  planetGroups.push({
    group,
    mesh,
    data: p,
    angle: Math.random() * Math.PI * 2,
    baseSize: p.size,
    // 真实比例：以地球=0.12 为基准（整体缩小到场景可容纳，但相对比例真实）
    realSize: p.realDiameter ? p.realDiameter * 0.12 : p.size,
  });
});

// ===== 真实比例切换 =====
let isRealScale = false;
const scaleBtn = document.getElementById('scaleBtn');
const SUN_BASE_SIZE = 4; // 太阳示意半径
// 真实比例下太阳适度放大（不能吞没水星轨道 7），保持"行星相对大小真实"
// 太阳真实是地球 109 倍，但为可视性，太阳与行星距离分开处理
const SUN_REAL_SIZE = 6.5;

scaleBtn.addEventListener('click', () => {
  isRealScale = !isRealScale;
  scaleBtn.textContent = isRealScale ? '📏 示意比例' : '📏 真实比例';
  scaleBtn.classList.toggle('real-active', isRealScale);

  // 缩放太阳（真实比例：太阳是地球的 109 倍）
  const sunTargetScale = isRealScale ? SUN_REAL_SIZE / SUN_BASE_SIZE : 1;
  animateScale(sun, sunTargetScale, 900);
  // 太阳光晕和日冕粒子也跟随缩放
  glowLayers.forEach((g) => animateScale(g, sunTargetScale, 900));
  animateScale(corona, sunTargetScale, 900);

  // 缩放每个行星（主体、环、云层、大气层；跳过标签 Sprite）
  planetGroups.forEach((pg) => {
    const targetSize = isRealScale ? pg.realSize : pg.baseSize;
    const targetScale = targetSize / pg.baseSize;
    pg.group.children.forEach((child) => {
      if (child.type === 'Mesh') {
        animateScale(child, targetScale, 900);
      }
    });
  });

  // 如果切到真实比例，调整相机距离
  if (isRealScale) {
    controls.maxDistance = 400;
  } else {
    controls.maxDistance = 150;
  }
});

// ===== 行星名称标签（Sprite，NASA 风格） =====
function createLabel(text, subtext = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');

  // 主文字
  ctx.font = 'bold 42px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 6;
  ctx.fillText(text, 128, 48);

  // 副文字（中文）
  if (subtext) {
    ctx.font = '22px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#c0c5d0';
    ctx.fillText(subtext, 128, 80);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  return sprite;
}

// 为每个行星添加标签
planetGroups.forEach((pg) => {
  const nameEn = pg.data.en.toUpperCase();
  const nameCn = pg.data.name;
  const label = createLabel(nameEn, nameCn);
  label.scale.set(pg.data.size * 3.5, pg.data.size * 1.3, 1);
  label.position.y = pg.data.size + 0.8;
  pg.group.add(label);
  pg.label = label;

  // 关联地球标签
  if (pg.data.isEarth) {
    earthRef.label = label;
  }
});

// ===== 行星内部剖切视图（1/4 扇形剖切，标准科普剖面图风格） =====
const earthExplodedGroup = new THREE.Group();
earthExplodedGroup.visible = false;
scene.add(earthExplodedGroup);

const layerMeshes = []; // 存储每层的 mesh，用于 raycast 和高亮
const EARTH_DISPLAY_RADIUS = 4.5; // 展示时行星的显示半径

// 创建行星内部各层（3/4 实心球嵌套，展示真实的同心圆实心剖面）
// 每层是实心球（从球心到该层半径），层层嵌套，缺口处自然露出各层截面
function buildLayers(layers) {
  // 清空旧层
  layerMeshes.forEach((m) => earthExplodedGroup.remove(m));
  layerMeshes.length = 0;

  layers.forEach((layer, index) => {
    const outerR = EARTH_DISPLAY_RADIUS * layer.radiusRatio;
    const isOuter = layer.radiusRatio === 1.0;
    const isEarth = layers === earthLayers;

    // 每层是实心 3/4 球体（从球心 0 到半径 outerR）
    const geo = new THREE.SphereGeometry(outerR, 128, 128, 0, Math.PI * 1.5, 0, Math.PI);
    const mat = new THREE.MeshStandardMaterial({
      color: isOuter && isEarth ? 0xffffff : layer.color,
      map: isOuter && isEarth ? TEX.earth : null,
      roughness: isOuter ? 0.6 : 0.5,
      metalness: 0.05,
      emissive: isOuter ? new THREE.Color(0x000000) : new THREE.Color(layer.color),
      emissiveIntensity: isOuter ? 0 : 0.25,
      side: THREE.DoubleSide, // 双面：球面内外都可见，缺口处露出各层
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.layerId = layer.id;
    mesh.userData.layerIndex = index;
    earthExplodedGroup.add(mesh);
    layerMeshes.push(mesh);
  });
}
buildLayers(currentLayers);

// 给地壳加一层大气层光晕（3/4 球体，跟随剖切形状）
const atmoGeo = new THREE.SphereGeometry(EARTH_DISPLAY_RADIUS * 1.04, 96, 96, 0, Math.PI * 1.5, 0, Math.PI);
const atmoMat = new THREE.MeshBasicMaterial({
  color: 0x4488ff,
  transparent: true,
  opacity: 0.15,
  side: THREE.BackSide,
  depthWrite: false,
});
const atmo = new THREE.Mesh(atmoGeo, atmoMat);
earthExplodedGroup.add(atmo);

// ===== 内核高温粒子特效 =====
const coreParticlesGeo = new THREE.BufferGeometry();
const coreParticleCount = 300;
const corePositions = new Float32Array(coreParticleCount * 3);
for (let i = 0; i < coreParticleCount; i++) {
  // 粒子分布在内核球体表面附近
  const r = EARTH_DISPLAY_RADIUS * 0.19 * (0.9 + Math.random() * 0.3);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  corePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
  corePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  corePositions[i * 3 + 2] = r * Math.cos(phi);
}
coreParticlesGeo.setAttribute('position', new THREE.BufferAttribute(corePositions, 3));
const coreParticlesMat = new THREE.PointsMaterial({
  color: 0xffcc00,
  size: 0.08,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const coreParticles = new THREE.Points(coreParticlesGeo, coreParticlesMat);
earthExplodedGroup.add(coreParticles);

// ===== 地震波可视化（P波/S波） =====
// 当爆炸图由内核向外展示时，模拟地震波从“震源”（内核）向外传播
const seismicWaveGroup = new THREE.Group();
seismicWaveGroup.visible = false;
scene.add(seismicWaveGroup);

const pWaves = []; // P波（纵向，传播快）
const sWaves = []; // S波（横向，传播慢）
const WAVE_COUNT = 6;

for (let i = 0; i < WAVE_COUNT; i++) {
  const ringGeo = new THREE.TorusGeometry(1, 0.06, 8, 64);
  // P波：蓝色
  const pMat = new THREE.MeshBasicMaterial({
    color: 0x44aaff,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const pWave = new THREE.Mesh(ringGeo, pMat);
  pWave.rotation.x = Math.PI / 2;
  pWave.userData = { type: 'P', speed: 0.012, radius: 0.5, maxRadius: 12, active: false };
  seismicWaveGroup.add(pWave);
  pWaves.push(pWave);

  // S波：红色
  const sMat = new THREE.MeshBasicMaterial({
    color: 0xff5555,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
  });
  const sWave = new THREE.Mesh(ringGeo, sMat);
  sWave.rotation.x = Math.PI / 2;
  sWave.userData = { type: 'S', speed: 0.007, radius: 0.3, maxRadius: 14, active: false };
  seismicWaveGroup.add(sWave);
  sWaves.push(sWave);
}

// 地震波发射
function emitSeismicWaves() {
  pWaves.forEach((w, i) => {
    setTimeout(() => {
      w.userData.active = true;
      w.userData.radius = 0.5;
      w.visible = true;
    }, i * 400);
  });
  sWaves.forEach((w, i) => {
    setTimeout(() => {
      w.userData.active = true;
      w.userData.radius = 0.3;
      w.visible = true;
    }, i * 400 + 200);
  });
}

function resetSeismicWaves() {
  [...pWaves, ...sWaves].forEach((w) => {
    w.userData.active = false;
    w.visible = false;
  });
}

// ===== 射线检测 =====
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let isEarthExploded = false;

// ===== UI 元素 =====
const infoPanel = document.getElementById('infoPanel');
const panelContent = document.getElementById('panelContent');
const closePanelBtn = document.getElementById('closePanel');
const hint = document.getElementById('hint');
const layerNav = document.getElementById('layerNav');

// 构建层级导航按钮
function buildLayerNav() {
  layerNav.innerHTML = '';
  // 从内到外显示
  [...currentLayers].reverse().forEach((layer) => {
    const btn = document.createElement('button');
    btn.className = 'layer-btn';
    btn.innerHTML = `
      <span class="dot" style="background:#${layer.color.toString(16).padStart(6, '0')}"></span>
      <span class="label-text">${layer.emoji} ${layer.name}</span>
    `;
    btn.addEventListener('click', () => {
      highlightLayer(layer);
      showLayerInfo(layer);
    });
    layerNav.appendChild(btn);
  });
}
buildLayerNav();

// 更新导航高亮状态
function updateNavActive(activeId) {
  const btns = layerNav.querySelectorAll('.layer-btn');
  btns.forEach((btn, i) => {
    // 倒序对应
    const layer = [...currentLayers].reverse()[i];
    btn.classList.toggle('active', layer.id === activeId);
  });
}

// 高亮某层（剖切视图下用 emissive 增强高亮）
function highlightLayer(layer) {
  // 恢复所有层到基础状态
  layerMeshes.forEach((mesh) => {
    const baseColor = currentLayers.find((l) => l.id === mesh.userData.layerId);
    const isOuter = (baseColor && baseColor.radiusRatio === 1.0);
    mesh.material.emissive = isOuter ? new THREE.Color(0x000000) : new THREE.Color(baseColor ? baseColor.color : 0x000000);
    mesh.material.emissiveIntensity = isOuter ? 0 : 0.12;
  });
  // 高亮选中层（增强自发光）
  const mesh = layerMeshes.find((m) => m.userData.layerId === layer.id);
  if (mesh) {
    mesh.material.emissive = new THREE.Color(layer.color);
    mesh.material.emissiveIntensity = 0.6;
  }
  updateNavActive(layer.id);
}

// 剖切展示动画：淡入缩放过渡（3/4 球体直接展示，无需裁剪切入）
function toggleExploded(explode) {
  isEarthExploded = explode;
  earthExplodedGroup.visible = true;

  // 收起时恢复各层基础状态
  if (!explode) {
    layerMeshes.forEach((mesh) => {
      const baseColor = currentLayers.find((l) => l.id === mesh.userData.layerId);
      const isOuter = (baseColor && baseColor.radiusRatio === 1.0);
      mesh.material.emissive = isOuter ? new THREE.Color(0x000000) : new THREE.Color(baseColor ? baseColor.color : 0x000000);
      mesh.material.emissiveIntensity = isOuter ? 0 : 0.12;
    });
    updateNavActive(null);
  }
}

// 缩放松动动画（统一缩放）
function animateScale(obj, targetScale, duration) {
  const startScale = obj.scale.x;
  const startTime = performance.now();
  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease out cubic
    const s = startScale + (targetScale - startScale) * eased;
    obj.scale.set(s, s, s);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// 语音朗读（Web Speech API）
let speechSynth = window.speechSynthesis;
let isSpeaking = false;

function speak(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('浏览器不支持语音朗读');
    return;
  }
  // 停止当前朗读
  speechSynth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.9; // 稍慢，适合小朋友
  utter.pitch = 1.1;
  speechSynth.speak(utter);
  isSpeaking = true;
  utter.onend = () => { isSpeaking = false; };
}

function stopSpeak() {
  if (speechSynth) {
    speechSynth.cancel();
    isSpeaking = false;
  }
}

// 显示层级信息
function showLayerInfo(layer) {
  panelContent.innerHTML = `
    <button class="speak-btn" id="speakBtn" title="朗读讲解">🔊 朗读</button>
    <span class="layer-emoji">${layer.emoji}</span>
    <div class="layer-name">${layer.name}</div>
    <div class="layer-en">${layer.en}</div>
    <div class="kid-sentence">${layer.kidFriendly}</div>
    <div class="description">${layer.description}</div>
    <div class="info-row"><span class="label">📍 深度</span><span class="value">${layer.depth}</span></div>
    <div class="info-row"><span class="label">🌡️ 温度</span><span class="value">${layer.temperature}</span></div>
    <div class="info-row"><span class="label">🧱 组成</span><span class="value">${layer.material}</span></div>
    <div class="info-row"><span class="label">💪 状态</span><span class="value">${layer.state}</span></div>
    <div class="info-row"><span class="label">⚖️ 密度</span><span class="value">${layer.density}</span></div>
    <div class="fact">${layer.fact}</div>
    <div class="fun-compare">${layer.funCompare}</div>
  `;
  infoPanel.classList.add('active');
  hint.classList.add('hidden');

  // 绑定朗读按钮
  const speakBtn = document.getElementById('speakBtn');
  if (speakBtn) {
    speakBtn.addEventListener('click', () => {
      if (isSpeaking) {
        stopSpeak();
        speakBtn.textContent = '🔊 朗读';
      } else {
        const textToSpeak = `${layer.name}。${layer.kidFriendly} ${layer.description} ${layer.fact}`;
        speak(textToSpeak);
        speakBtn.textContent = '⏹ 停止';
        // 朗读结束后恢复按钮
        const checkEnd = setInterval(() => {
          if (!isSpeaking) {
            speakBtn.textContent = '🔊 朗读';
            clearInterval(checkEnd);
          }
        }, 500);
      }
    });
  }
}

// 关闭面板
function closePanel() {
  stopSpeak();
  infoPanel.classList.remove('active');
  if (isEarthExploded) {
    // 收起爆炸图
    toggleExploded(false);
    // 恢复地球行星位置
  }
  // 如果重新聚焦，显示 hint
  hint.classList.remove('hidden');
}

closePanelBtn.addEventListener('click', closePanel);

// ===== 随机趣味小知识 =====
function showRandomFact() {
  const fact = earthFunFacts[Math.floor(Math.random() * earthFunFacts.length)];
  const popup = document.createElement('div');
  popup.className = 'fact-popup';
  popup.textContent = fact;
  document.getElementById('app').appendChild(popup);
  setTimeout(() => popup.remove(), 4000);
}

// 每隔 12 秒显示一个随机小知识
setInterval(showRandomFact, 12000);
// 初始 5 秒后显示第一个
setTimeout(showRandomFact, 5000);

// ===== 鼠标交互 =====
canvas.addEventListener('pointerdown', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  // 检测内部层
  const layerHits = raycaster.intersectObjects(layerMeshes);
  if (layerHits.length > 0 && isEarthExploded) {
    const hit = layerHits[0].object;
    const layer = currentLayers.find((l) => l.id === hit.userData.layerId);
    if (layer) {
      // 游戏模式下优先处理游戏逻辑
      if (isGameMode) {
        handleGameClick(layer.id);
        return;
      }
      highlightLayer(layer);
      showLayerInfo(layer);
      return;
    }
  }

  // 检测地球行星
  const earthHits = raycaster.intersectObject(earthRef.mesh);
  if (earthHits.length > 0 && !isEarthExploded) {
    // 点击地球：确保展示地球结构，切换到爆炸图模式
    if (currentLayers !== earthLayers) {
      switchPlanetLayers(earthLayers);
    }
    showEarthExploded();
    return;
  }

  // 点击其他行星：火星显示内部结构，其他行星显示小知识 + 高亮轮廓
  planetGroups.forEach((pg) => {
    if (pg.mesh === earthRef.mesh) return;
    const hits = raycaster.intersectObject(pg.mesh);
    if (hits.length > 0) {
      // 火星：展示内部结构
      if (pg.data.en === 'Mars') {
        switchPlanetLayers(marsLayers);
        showEarthExploded();
        return;
      }

      const fact = pg.data.fact || `${pg.data.name}：${pg.data.en}`;
      const popup = document.createElement('div');
      popup.className = 'fact-popup';
      popup.textContent = `${pg.data.name} · ${fact}`;
      document.getElementById('app').appendChild(popup);
      setTimeout(() => popup.remove(), 3500);

      // 高亮选中的行星（描边效果）
      highlightPlanet(pg);
    }
  });

  // 点击太阳或空白处：如果爆炸图展开中，则关闭并回到太阳系
  if (isEarthExploded) {
    // 检测是否点到了太阳
    const sunHits = raycaster.intersectObject(sun);
    if (sunHits.length > 0) {
      closePanel();
      hideEarthExploded();
      return;
    }
    // 点击其他空白处也关闭（可选，但这里保守处理：只点太阳关闭）
  }
});

// 切换行星内部结构数据并重建层
function switchPlanetLayers(layers) {
  currentLayers = layers;
  buildLayers(layers);
  buildLayerNav(); // 重建左侧导航按钮
}

// ===== 行星选中高亮（描边轮廓） =====
let activePlanetOutline = null;

function highlightPlanet(pg) {
  // 清除旧的高亮
  if (activePlanetOutline) {
    activePlanetOutline.parent?.remove(activePlanetOutline);
    activePlanetOutline = null;
  }

  // 创建描边壳（略大于行星的 backside 球体，形成边缘光）
  const outlineGeo = new THREE.SphereGeometry(pg.mesh.geometry.parameters.radius * 1.06, 64, 64);
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const outline = new THREE.Mesh(outlineGeo, outlineMat);
  pg.group.add(outline);
  activePlanetOutline = outline;

  // 2 秒后自动移除高亮
  setTimeout(() => {
    if (activePlanetOutline === outline) {
      outline.parent?.remove(outline);
      activePlanetOutline = null;
    }
  }, 2000);
}

// ===== 相机平滑飞行（缓动动画） =====
let cameraAnim = null;
function flyCameraTo(targetPos, targetLookAt, duration = 1200) {
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  cameraAnim = {
    startPos, targetPos,
    startTarget, targetLookAt,
    startTime, duration,
  };
}

function updateCameraAnim(now) {
  if (!cameraAnim) return;
  const { startPos, targetPos, startTarget, targetLookAt, startTime, duration } = cameraAnim;
  const t = Math.min((now - startTime) / duration, 1);
  // ease in-out cubic
  const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  camera.position.lerpVectors(startPos, targetPos, eased);
  controls.target.lerpVectors(startTarget, targetLookAt, eased);

  if (t >= 1) cameraAnim = null;
}

// 展示地球爆炸图
// 记录当前展开展示的是哪个行星（用于隐藏/恢复其本体）
let activePlanetMesh = null;
let activePlanetExtraMeshes = []; // 该行星的云层、大气层、标签等
let explodedWorldPos = new THREE.Vector3(0, 0, 0); // 剖切视图的世界位置

function showEarthExploded() {
  // 记录当前行星的位置，剖切视图在该位置展示（而非场景原点=太阳）
  let planetWorldPos = new THREE.Vector3(0, 0, 0);
  if (currentLayers === earthLayers) {
    planetWorldPos.copy(earthRef.group.position);
  } else if (currentLayers === marsLayers) {
    const marsPg = planetGroups.find((pg) => pg.data.en === 'Mars');
    if (marsPg) planetWorldPos.copy(marsPg.group.position);
  }

  earthExplodedGroup.position.copy(planetWorldPos);
  earthExplodedGroup.visible = true;
  isEarthExploded = true;
  // 存储剖切展示位置，供动画循环固定使用
  explodedWorldPos = planetWorldPos.clone();
  toggleExploded(true);

  // 隐藏当前行星本体及其附加层
  if (currentLayers === earthLayers) {
    activePlanetMesh = earthRef.mesh;
    activePlanetExtraMeshes = [earthRef.cloud, earthRef.atmosphere, earthRef.label];
  } else if (currentLayers === marsLayers) {
    const marsPg = planetGroups.find((pg) => pg.data.en === 'Mars');
    activePlanetMesh = marsPg?.mesh || null;
    activePlanetExtraMeshes = [marsPg?.label];
  }
  if (activePlanetMesh) activePlanetMesh.visible = false;
  activePlanetExtraMeshes.forEach((m) => { if (m) m.visible = false; });

  // 隐藏太阳，避免剖切视图中太阳干扰观看
  sun.visible = false;
  glowLayers.forEach((g) => g.visible = false);
  corona.visible = false;

  // 地震波可视化默认关闭（避免环形波浪干扰剖面视图）
  seismicWaveGroup.visible = false;
  resetSeismicWaves();

  // 旋转剖切组，让 1/4 缺口（扇形剖面）朝向相机（+Z 方向）
  earthExplodedGroup.rotation.y = Math.PI * 0.75; // 135°

  // 相机平滑飞向剖切视图位置
  flyCameraTo(
    planetWorldPos.clone().add(new THREE.Vector3(0, 4, 14)),
    planetWorldPos.clone(),
    1300
  );

  // 自动高亮并展示最外层
  const outer = currentLayers[currentLayers.length - 1];
  highlightLayer(outer);
  showLayerInfo(outer);
}

// 关闭爆炸图（回到行星视角）
function hideEarthExploded() {
  // 恢复之前隐藏的行星本体
  if (activePlanetMesh) activePlanetMesh.visible = true;
  activePlanetExtraMeshes.forEach((m) => { if (m) m.visible = true; });
  activePlanetMesh = null;
  activePlanetExtraMeshes = [];

  // 恢复太阳显示
  sun.visible = true;
  glowLayers.forEach((g) => g.visible = true);
  corona.visible = true;

  toggleExploded(false);
  isEarthExploded = false;
  earthExplodedGroup.visible = false;
  seismicWaveGroup.visible = false;
  resetSeismicWaves();
  stopGame();
  updateNavActive(null);

  // 相机平滑飞回太阳系全景视角
  flyCameraTo(
    new THREE.Vector3(0, 26, 58),
    new THREE.Vector3(0, 0, 0),
    1300
  );
}

// 关闭面板时也收起爆炸图
closePanelBtn.addEventListener('click', () => {
  closePanel();
  hideEarthExploded();
});

// ===== 时间控制（时间加速） =====
let timeScale = 1; // 当前时间倍率
const timePanel = document.getElementById('timePanel');
const timeValueEl = document.getElementById('timeValue');

document.querySelectorAll('.time-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    timeScale = parseFloat(btn.dataset.rate);
    timeValueEl.textContent = timeScale === 0 ? '⏸' : timeScale + '×';
    document.querySelectorAll('.time-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ===== 动画循环 =====
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();
  // 帧间时间增量（秒），乘以时间倍率实现加速/暂停
  const deltaTime = clock.getDelta();
  const scaledDelta = deltaTime * timeScale;

  // 行星公转（开普勒轨道：倾角 + 偏心率）
  planetGroups.forEach((pg) => {
    const { distance, orbitSpeed, inclination = 0, eccentricity = 0 } = pg.data;
    // 角度增量 = 基础角速度 × 时间倍率（0.09 保持 1× 时与原版观感一致）
    pg.angle += orbitSpeed * 0.09 * scaledDelta;

    const a = distance; // 半长轴
    const b = a * Math.sqrt(1 - eccentricity * eccentricity); // 半短轴
    // 椭圆轨道
    const x = Math.cos(pg.angle) * a;
    const z = Math.sin(pg.angle) * b;

    // 轨道倾角（绕 X 轴旋转）
    const inclRad = (inclination * Math.PI) / 180;
    const y = Math.sin(inclRad) * z;
    const zFinal = Math.cos(inclRad) * z;

    pg.group.position.set(x, y, zFinal);
    // 自转（同样受时间倍率影响，60 保持 1× 时与原版一致）
    pg.mesh.rotation.y += pg.data.rotationSpeed * scaledDelta * 60;
  });

  // 地球云层单独自转（受时间倍率影响）
  if (earthRef.cloud) {
    earthRef.cloud.rotation.y += 0.12 * scaledDelta;
  }

  // 月球绕地球公转
  if (earthRef.moon) {
    earthRef.moonAngle = (earthRef.moonAngle || 0) + moon.orbitSpeed * 0.09 * scaledDelta;
    earthRef.moon.position.set(
      Math.cos(earthRef.moonAngle) * moon.distance,
      0,
      Math.sin(earthRef.moonAngle) * moon.distance
    );
    earthRef.moon.rotation.y += moon.rotationSpeed * scaledDelta * 60;
  }

  // 剖切视图固定在展开时的行星位置（不随地球公转移动）
  if (isEarthExploded) {
    earthExplodedGroup.position.copy(explodedWorldPos);
    seismicWaveGroup.position.copy(explodedWorldPos);
  }

  // 太阳自转 + 日冕粒子旋转 + 光晕脉动
  sun.rotation.y += 0.0015;
  corona.rotation.y += 0.001;
  corona.material.opacity = 0.5 + Math.sin(elapsed * 2) * 0.15;
  sunLight.intensity = 3.0 + Math.sin(elapsed * 1.5) * 0.25;
  // 日冕光晕呼吸效果（半径微调）
  glowLayers.forEach((g, i) => {
    const scale = 1 + Math.sin(elapsed * 1.8 + i) * 0.03;
    g.scale.setScalar(scale);
  });

  // 剖切视图：不整体自转（保持剖面朝向稳定），只让内核粒子独立旋转
  if (earthExplodedGroup.visible) {
    coreParticles.rotation.y += 0.008;
    coreParticles.material.opacity = 0.7 + Math.sin(elapsed * 3) * 0.25;
  }

  // 地震波传播动画
  if (seismicWaveGroup.visible) {
    [...pWaves, ...sWaves].forEach((w) => {
      if (!w.userData.active) return;
      w.userData.radius += w.userData.speed;
      if (w.userData.radius > w.userData.maxRadius) {
        w.userData.active = false;
        w.visible = false;
        return;
      }
      // 更新环的大小
      const s = w.userData.radius;
      w.scale.set(s, s, s);
      // 半径越大越透明
      const t = 1 - w.userData.radius / w.userData.maxRadius;
      w.material.opacity = t * 0.8;
    });
  }

  // 更新相机飞行动画
  updateCameraAnim(performance.now());

  controls.update();
  renderer.render(scene, camera);
}

animate();

// ===== 窗口大小调整 =====
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== 键盘快捷键：ESC 关闭 =====
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closePanel();
    hideEarthExploded();
  }
});

// ===== 拼装游戏 =====
const gameBtn = document.getElementById('gameBtn');
let isGameMode = false;
let gameProgress = 0; // 已正确点击的层数
let gameOrder = []; // 正确的顺序（从内到外 = currentLayers 顺序）

// 初始化游戏：提示按顺序识别各层（剖切视图下无需打乱，考验的是层的识别顺序）
function startGame() {
  if (!isEarthExploded) {
    showEarthExploded();
  }
  isGameMode = true;
  gameProgress = 0;
  gameOrder = currentLayers.map((l) => l.id); // 从内到外：内核 → ... → 地壳

  gameBtn.classList.add('active');
  gameBtn.textContent = '🧩 按顺序点击各层！';
  const first = currentLayers[0];
  hint.textContent = `🎮 从最里面开始：先点 ${first.emoji} ${first.name}`;
  hint.classList.remove('hidden');
  updateNavActive(null);
}

// 处理游戏中的点击
function handleGameClick(layerId) {
  if (!isGameMode) return false;
  const expectedId = gameOrder[gameProgress];
  if (layerId === expectedId) {
    // 点对了
    gameProgress++;
    const mesh = layerMeshes.find((m) => m.userData.layerId === layerId);
    if (mesh) {
      // 该层闪绿光
      mesh.material.emissive = new THREE.Color(0x44ff44);
      mesh.material.emissiveIntensity = 0.8;
      setTimeout(() => {
        const baseColor = currentLayers.find((l) => l.id === layerId);
        const isOuter = baseColor && baseColor.radiusRatio === 1.0;
        mesh.material.emissive = isOuter ? new THREE.Color(0x000000) : new THREE.Color(baseColor ? baseColor.color : 0x000000);
        mesh.material.emissiveIntensity = isOuter ? 0 : 0.12;
      }, 500);
    }

    if (gameProgress >= gameOrder.length) {
      winGame();
    } else {
      const nextLayer = currentLayers.find((l) => l.id === gameOrder[gameProgress]);
      hint.textContent = `✅ 正确！下一层：${nextLayer.emoji} ${nextLayer.name}`;
    }
    return true;
  } else {
    // 点错了
    hint.textContent = '❌ 不对哦，按从内到外的顺序来。';
    const mesh = layerMeshes.find((m) => m.userData.layerId === layerId);
    if (mesh) {
      mesh.material.emissive = new THREE.Color(0xff2222);
      mesh.material.emissiveIntensity = 0.8;
      setTimeout(() => {
        const baseColor = currentLayers.find((l) => l.id === layerId);
        const isOuter = baseColor && baseColor.radiusRatio === 1.0;
        mesh.material.emissive = isOuter ? new THREE.Color(0x000000) : new THREE.Color(baseColor ? baseColor.color : 0x000000);
        mesh.material.emissiveIntensity = isOuter ? 0 : 0.12;
      }, 400);
    }
    return true;
  }
}

function winGame() {
  isGameMode = false;
  gameBtn.classList.remove('active');
  gameBtn.textContent = '🧩 拼装游戏';
  hint.textContent = '🎉 太棒了！你按正确顺序认出了所有层！';
  setTimeout(() => {
    hint.textContent = '🖱️ 滚轮缩放 · 拖拽旋转 · 点击地球查看内部结构';
  }, 3000);

  // 弹出胜利提示
  const popup = document.createElement('div');
  popup.className = 'fact-popup';
  popup.textContent = '🎉 恭喜你！你是小小地质学家！';
  document.getElementById('app').appendChild(popup);
  setTimeout(() => popup.remove(), 4000);
}

function stopGame() {
  isGameMode = false;
  gameBtn.classList.remove('active');
  gameBtn.textContent = '🧩 拼装游戏';
}

gameBtn.addEventListener('click', () => {
  if (isGameMode) {
    stopGame();
  } else {
    startGame();
  }
});

// 初始显示小提示
console.log('🌌 3D 太阳系科普已启动！点击地球探索内部结构。');
