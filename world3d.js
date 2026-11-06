import * as THREE from './vendor/three/three.module.js';

const WORLD_W = 3200;
const WORLD_H = 2400;
const TAU = Math.PI * 2;

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function makeGroundTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const rand = seeded(83017);
  ctx.fillStyle = '#687853';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 420; i++) {
    const shade = rand() > .52 ? '31,48,31' : '194,179,119';
    ctx.fillStyle = `rgba(${shade},${.025 + rand() * .065})`;
    ctx.beginPath();
    ctx.ellipse(rand() * 512, rand() * 512, 5 + rand() * 34, 4 + rand() * 25, rand() * TAU, 0, TAU);
    ctx.fill();
  }
  for (let i = 0; i < 14000; i++) {
    ctx.fillStyle = rand() > .52 ? `rgba(27,43,29,${.08 + rand() * .16})` : `rgba(218,204,145,${.05 + rand() * .12})`;
    const x = rand() * 512, y = rand() * 512;
    ctx.fillRect(x, y, .6 + rand() * 2, .6 + rand() * 2);
  }
  for (let i = 0; i < 360; i++) {
    ctx.strokeStyle = `rgba(33,54,34,${.10 + rand() * .16})`;
    ctx.lineWidth = .6 + rand() * 1.1;
    const x = rand() * 512, y = rand() * 512;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rand() * 8 - 4, y + 3 + rand() * 10); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(90, 68);
  texture.anisotropy = 4;
  return texture;
}

function makeMaterial(color, roughness = .92, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, ...extra });
}

function makeSurfaceTexture(kind, base) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const rand = seeded(kind.length * 971 + base.length * 37);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = rand() > .5 ? 'rgba(255,235,190,.045)' : 'rgba(10,15,12,.055)';
    const x = rand() * 256, y = rand() * 256;
    ctx.fillRect(x, y, 1 + rand() * 3, 1 + rand() * 2);
  }
  if (kind === 'masonry' || kind === 'slate') {
    const row = kind === 'masonry' ? 32 : 40;
    for (let y = 0; y < 256; y += row) {
      ctx.strokeStyle = 'rgba(15,18,17,.48)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke();
      const offset = (Math.floor(y / row) % 2) * 32;
      for (let x = -64 + offset; x < 256; x += 64) {
        ctx.fillStyle = `rgba(255,226,183,${.04 + rand() * .08})`;
        ctx.fillRect(x + 3, y + 3, 57, row - 7);
        ctx.strokeStyle = 'rgba(17,19,18,.38)'; ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 64, row);
        if (kind === 'slate') {
          ctx.strokeStyle = 'rgba(195,177,154,.25)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x + 8, y + 8); ctx.lineTo(x + 48, y + 8); ctx.stroke();
        }
      }
    }
  } else if (kind === 'scales' || kind === 'hide') {
    for (let y = -8; y < 264; y += 16) for (let x = -8 + (Math.floor(y / 16) % 2) * 12; x < 264; x += 24) {
      ctx.fillStyle = `rgba(255,220,170,${.05 + rand() * .12})`;
      ctx.beginPath(); ctx.ellipse(x, y, 10, 7, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(20,18,16,.22)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI); ctx.stroke();
    }
  } else if (kind === 'bark' || kind === 'planks') {
    for (let x = 0; x < 256; x += kind === 'bark' ? 22 : 64) {
      ctx.strokeStyle = 'rgba(15,14,12,.34)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (rand() - .5) * 10, 256); ctx.stroke();
      for (let y = rand() * 40; y < 256; y += 62 + rand() * 30) {
        ctx.strokeStyle = 'rgba(230,197,143,.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 3, y); ctx.lineTo(x + 16, y + 2); ctx.stroke();
      }
    }
  } else if (kind === 'leaves' || kind === 'membrane') {
    for (let i = 0; i < 300; i++) {
      const x = rand() * 256, y = rand() * 256;
      ctx.fillStyle = i % 2 ? 'rgba(213,223,160,.12)' : 'rgba(10,24,16,.15)';
      ctx.beginPath(); ctx.ellipse(x, y, 3 + rand() * 9, 2 + rand() * 5, rand() * TAU, 0, TAU); ctx.fill();
      if (kind === 'membrane') { ctx.strokeStyle = 'rgba(245,174,113,.2)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - .5) * 18, y + 18); ctx.stroke(); }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(kind === 'masonry' ? 2 : 1.5, kind === 'masonry' ? 1.5 : 1.5);
  texture.anisotropy = 4;
  return texture;
}

function ribbon(points, width, material, y = .015) {
  const positions = [], indices = [];
  for (let i = 0; i < points.length; i++) {
    const prev = points[Math.max(0, i - 1)], next = points[Math.min(points.length - 1, i + 1)];
    const dx = next[0] - prev[0], dz = next[1] - prev[1];
    const length = Math.hypot(dx, dz) || 1;
    const ox = -dz / length * width / 2, oz = dx / length * width / 2;
    positions.push(points[i][0] + ox, y, points[i][1] + oz, points[i][0] - ox, y, points[i][1] - oz);
    if (i < points.length - 1) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

export class World3D {
  constructor(canvas, world) {
    this.world = world;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#9ca88a');
    this.scene.fog = new THREE.FogExp2('#9ca88a', .00092);
    this.camera = new THREE.PerspectiveCamera(74, 1, .08, 1400);
    this.scene.add(this.camera);
    this.camera.position.set(0, 56, 61);
    this.cameraTarget = new THREE.Vector3();
    this.firstPerson = false;
    this.lookPitch = 0;
    this.firstPersonWeapon = this.buildFirstPersonWeapon();
    this.clock = new THREE.Clock();
    this.entityMeshes = new Map();
    this.lootMeshes = new Map();
    this.shotMeshes = new Map();
    this.particleMeshes = [];
    this.dummy = new THREE.Object3D();
    this.rand = seeded(71249);

    this.scene.add(new THREE.HemisphereLight('#e5edcc', '#283627', 1.45));
    const sun = new THREE.DirectionalLight('#fff0ce', 2.15);
    sun.position.set(-80, 140, -60);
    this.scene.add(sun);
    const fill = new THREE.DirectionalLight('#a5c5b4', .9);
    fill.position.set(70, 50, 90);
    this.scene.add(fill);
    const warmRim = new THREE.DirectionalLight('#d99b69', .45);
    warmRim.position.set(100, 35, -90);
    this.scene.add(warmRim);

    this.surfaceTextures = {
      masonry: makeSurfaceTexture('masonry', '#777064'),
      slate: makeSurfaceTexture('slate', '#39323b'),
      bark: makeSurfaceTexture('bark', '#594a35'),
      hide: makeSurfaceTexture('hide', '#777568'),
      scales: makeSurfaceTexture('scales', '#914a36'),
      membrane: makeSurfaceTexture('membrane', '#49333a'),
      leaves: makeSurfaceTexture('leaves', '#405a39'),
      planks: makeSurfaceTexture('planks', '#514132'),
    };
    this.materials = {
      ground: makeMaterial('#ffffff', 1, { map: makeGroundTexture() }),
      path: makeMaterial('#9b8057', .98, { map: makeSurfaceTexture('hide', '#897451') }),
      pathEdge: makeMaterial('#41483a', .98, { map: makeSurfaceTexture('bark', '#41483a') }),
      trunk: makeMaterial('#594a35', .96, { map: makeSurfaceTexture('bark', '#594a35') }),
      leaf: ['#405a39', '#4a6540', '#566d45', '#354d34'].map(color => makeMaterial(color, .9, { map: makeSurfaceTexture('leaves', color) })),
      rock: makeMaterial('#696a57', .96, { map: makeSurfaceTexture('masonry', '#696a57') }),
      water: makeMaterial('#496f69', .25, { metalness: .12, transparent: true, opacity: .8 }),
      stone: makeMaterial('#756f59', .94, { map: makeSurfaceTexture('masonry', '#756f59') }),
      gold: makeMaterial('#e5c875', .4, { emissive: '#7c5412', emissiveIntensity: .65 }),
      grass: makeMaterial('#8b9970', .9, { map: makeSurfaceTexture('leaves', '#65754a') }),
    };

    this.buildTerrain();
    this.buildForest(world.trees);
    this.buildNature(world);
    this.buildLandmarks();
    this.buildShrine(world.shrine);
    this.player = this.buildPlayer();
    this.resize();
  }

  resize() {
    const width = Math.max(1, this.renderer.domElement.clientWidth);
    const height = Math.max(1, this.renderer.domElement.clientHeight);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  addGroundDisk(x, z, radius, color, opacity = 1) {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(radius, 56), new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, .012, z);
    this.scene.add(mesh);
    return mesh;
  }

  buildTerrain() {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, WORLD_H), this.materials.ground);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(WORLD_W / 2, -.16, WORLD_H / 2);
    this.scene.add(ground);

    const biomes = [
      [730, 1120, 600, '#233c2b'], [1250, 620, 420, '#263727'], [1550, 1500, 430, '#294137'],
      [2060, 1110, 560, '#514d38'], [2620, 1980, 480, '#50382e'], [2660, 440, 290, '#3c2931'],
    ];
    for (const [x, z, radius, color] of biomes) this.addGroundDisk(x, z, radius, color, .3);

    const roadA = [[70,1280],[340,1260],[680,1250],[930,1080],[1110,900],[1430,865],[1610,900],[1830,990],[2070,1120],[2350,1020],[2570,740],[2650,510]];
    const roadB = [[1580,880],[1680,1100],[1840,1300],[2030,1440],[2220,1590],[2410,1790],[2580,1980],[2740,2190]];
    for (const points of [roadA, roadB]) {
      this.scene.add(ribbon(points, 66, this.materials.pathEdge, -.02));
      this.scene.add(ribbon(points, 43, this.materials.path, .005));
    }

    const rand = seeded(5581);
    for (let i = 0; i < 19; i++) {
      const x = 1320 + i * 38, z = 1390 + Math.sin(i * 2.7) * 145;
      const pond = new THREE.Mesh(new THREE.CircleGeometry(22 + rand() * 22, 12), this.materials.water);
      pond.rotation.x = -Math.PI / 2; pond.rotation.z = -.35; pond.scale.y = .46;
      pond.position.set(x, -.035 + i * .0005, z); this.scene.add(pond);
    }
    for (let i = 0; i < 58; i++) {
      const x = 2280 + (i * 137) % 640, z = 1750 + (i * 223) % 580;
      const basalt = new THREE.Mesh(new THREE.DodecahedronGeometry(9 + i % 5 * 2, 0), i % 2 ? this.materials.rock : this.materials.stone);
      basalt.scale.set(1.3, .45, .8); basalt.position.set(x, 1.1, z); basalt.rotation.y = i * .61; basalt.rotation.x = .18; this.scene.add(basalt);
    }
  }

  buildForest(trees) {
    if (!trees.length) return;
    const trunkGeo = new THREE.CylinderGeometry(.65, 1.15, 1, 6, 1);
    const crownGeo = new THREE.IcosahedronGeometry(1, 1);
    const trunk = new THREE.InstancedMesh(trunkGeo, this.materials.trunk, trees.length);
    const crowns = this.materials.leaf.map((material, i) => new THREE.InstancedMesh(crownGeo, material, trees.length * (i === 0 ? 2 : 1)));
    const colors = ['#344d32', '#415b39', '#4b6340', '#293f2c'].map(value => new THREE.Color(value));
    const rand = seeded(841);
    let crownCounts = [0, 0, 0, 0];

    trees.forEach((tree, i) => {
      const scale = tree.r / 25;
      this.dummy.position.set(tree.x, 3.45 * tree.h, tree.y); this.dummy.rotation.set(0, tree.seed, 0); this.dummy.scale.set(scale, 6.9 * tree.h, scale); this.dummy.updateMatrix(); trunk.setMatrixAt(i, this.dummy.matrix);
      const colorIndex = Math.floor(tree.tone * colors.length);
      for (let layer = 0; layer < 3; layer++) {
        const slot = layer === 0 ? colorIndex : (colorIndex + layer) % crowns.length;
        const mesh = crowns[slot], index = crownCounts[slot]++;
        const size = layer === 0 ? 1 : .68;
        const y = (layer === 0 ? 10 : layer === 1 ? 14.2 : 8.2) * tree.h;
        this.dummy.position.set(tree.x + (layer === 1 ? Math.cos(tree.seed) * tree.r * .2 : 0), y, tree.y + (layer === 1 ? Math.sin(tree.seed) * tree.r * .2 : 0));
        this.dummy.rotation.set(rand() * .2, tree.seed + layer * 1.7, rand() * .2);
        this.dummy.scale.set(tree.r * .78 * size, tree.r * .72 * size, tree.r * .72 * size);
        this.dummy.updateMatrix(); mesh.setMatrixAt(index, this.dummy.matrix); mesh.setColorAt(index, colors[colorIndex]);
      }
    });
    trunk.instanceMatrix.needsUpdate = true;
    trunk.castShadow = false; trunk.receiveShadow = true;
    this.scene.add(trunk);
    crowns.forEach(mesh => { mesh.count = crownCounts[crowns.indexOf(mesh)]; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; this.scene.add(mesh); });

    // Low fern clusters break up the forest floor without adding hundreds of draw calls.
    const fernGeo = new THREE.ConeGeometry(1, 1, 4);
    const fernMesh = new THREE.InstancedMesh(fernGeo, this.materials.grass, 260);
    const fernRand = seeded(2089);
    for (let i = 0; i < 260; i++) {
      const x = fernRand() * WORLD_W, z = fernRand() * WORLD_H;
      this.dummy.position.set(x, .55, z); this.dummy.rotation.set(0, fernRand() * TAU, 0); this.dummy.scale.set(.6 + fernRand(), 1 + fernRand() * 1.4, .6 + fernRand()); this.dummy.updateMatrix(); fernMesh.setMatrixAt(i, this.dummy.matrix);
    }
    fernMesh.instanceMatrix.needsUpdate = true; this.scene.add(fernMesh);
  }

  buildNature(world) {
    const rand = seeded(99011);
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rocks = new THREE.InstancedMesh(rockGeo, this.materials.rock, world.rocks.length);
    world.rocks.forEach((rock, i) => {
      this.dummy.position.set(rock.x, rock.r * .34, rock.y); this.dummy.rotation.set(rand() * .2, rand() * TAU, rand() * .2); this.dummy.scale.set(rock.r * 1.25, rock.r * .55, rock.r * .9); this.dummy.updateMatrix(); rocks.setMatrixAt(i, this.dummy.matrix);
    });
    rocks.instanceMatrix.needsUpdate = true; this.scene.add(rocks);

    const flowerGeo = new THREE.OctahedronGeometry(.8, 0);
    const flowers = new THREE.InstancedMesh(flowerGeo, makeMaterial('#c8b87a', .7, { emissive: '#57451d', emissiveIntensity: .15 }), world.flowers.length);
    world.flowers.forEach((flower, i) => {
      this.dummy.position.set(flower.x, .45, flower.y); this.dummy.rotation.set(.2, flower.c * TAU, .1); this.dummy.scale.set(.65, .34, .65); this.dummy.updateMatrix(); flowers.setMatrixAt(i, this.dummy.matrix);
      flowers.setColorAt(i, new THREE.Color(flower.c > .5 ? '#d2bd84' : '#aa8c9b'));
    });
    flowers.instanceMatrix.needsUpdate = true; this.scene.add(flowers);
  }

  buildLandmarks() {
    const castle = new THREE.Group();
    const stone = makeMaterial('#71675e', .92, { map: this.surfaceTextures.masonry });
    const roof = makeMaterial('#302932', .78, { map: this.surfaceTextures.slate, metalness: .12 });
    const trim = makeMaterial('#a18a69', .78, { map: this.surfaceTextures.masonry });
    const wood = makeMaterial('#49382b', .9, { map: this.surfaceTextures.planks });
    const tower = (x, z, height, radius) => {
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius * .84, radius, height, 8), stone);
      shaft.position.set(x, height / 2, z); castle.add(shaft);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(radius * 1.18, height * .25, 8), roof);
      cap.position.set(x, height + height * .12, z); castle.add(cap);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.02, radius * 1.02, .7, 8), trim);
      band.position.set(x, height * .68, z); castle.add(band);
    };
    const wall = (x, z, sx, sz, height) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, height, sz), stone);
      mesh.position.set(x, height / 2, z); castle.add(mesh);
    };
    wall(2660, 400, 180, 15, 25); wall(2660, 510, 180, 15, 25);
    wall(2577, 455, 15, 110, 25); wall(2743, 455, 15, 110, 25);
    tower(2580, 400, 48, 13); tower(2740, 400, 42, 12); tower(2580, 510, 45, 12); tower(2740, 510, 52, 14);
    tower(2660, 455, 61, 17);
    const gate = new THREE.Mesh(new THREE.BoxGeometry(28, 19, 3), wood); gate.position.set(2660, 9.5, 392); castle.add(gate);
    for (let i = 0; i < 7; i++) {
      const slit = new THREE.Mesh(new THREE.BoxGeometry(3.2, 10, 1.2), makeMaterial('#17191a', .9));
      slit.position.set(2605 + i * 18, 12, 391); castle.add(slit);
    }
    const keep = new THREE.Mesh(new THREE.BoxGeometry(76, 35, 62), stone);
    keep.position.set(2660, 17.5, 455); castle.add(keep);
    const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(55, 24, 8), roof);
    keepRoof.position.set(2660, 47, 455); castle.add(keepRoof);
    for (const x of [2640, 2660, 2680]) {
      const window = new THREE.Mesh(new THREE.BoxGeometry(4, 9, 1.5), makeMaterial('#e0a45f', .38, { emissive: '#a44f22', emissiveIntensity: .65 }));
      window.position.set(x, 20, 423.5); castle.add(window);
    }
    for (const [x, z] of [[2580,400],[2740,400],[2580,510],[2740,510],[2660,455]]) {
      for (let i = 0; i < 8; i++) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), stone);
        merlon.position.set(x + Math.cos(i * TAU / 8) * 13, 49, z + Math.sin(i * TAU / 8) * 13); castle.add(merlon);
      }
    }
    castle.traverse(object => { if (object.isMesh) { object.castShadow = false; object.receiveShadow = true; } });
    this.scene.add(castle);

    const rand = seeded(1973);
    for (let i = 0; i < 13; i++) {
      const angle = i * TAU / 13, radius = 145 + rand() * 45;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(20 + rand() * 16, 1), i % 2 ? this.materials.rock : makeMaterial('#68473a'));
      rock.position.set(2620 + Math.cos(angle) * radius, 10 + rand() * 8, 1980 + Math.sin(angle) * radius);
      rock.scale.set(1 + rand() * .8, 1.4 + rand() * 1.2, 1 + rand() * .75);
      this.scene.add(rock);
    }
    const peak = new THREE.Mesh(new THREE.ConeGeometry(125, 125, 7, 3), makeMaterial('#49372f'));
    peak.position.set(2620, 53, 1980); this.scene.add(peak);
    const ember = new THREE.PointLight('#ff7541', 140, 250, 2);
    ember.position.set(2620, 34, 1980); this.scene.add(ember);
  }

  buildShrine(shrine) {
    const group = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(23, 26, 2, 12), this.materials.stone);
    ring.position.y = .8; group.add(ring);
    const altar = new THREE.Mesh(new THREE.CylinderGeometry(13, 16, 7, 8), makeMaterial('#82795d'));
    altar.position.y = 4.5; group.add(altar);
    for (let i = 0; i < 7; i++) {
      const angle = i * TAU / 7, radius = 22;
      const pillar = new THREE.Mesh(new THREE.DodecahedronGeometry(5, 0), this.materials.stone);
      pillar.position.set(Math.cos(angle) * radius, 4, Math.sin(angle) * radius); pillar.scale.set(.7, 1.5, .7); group.add(pillar);
    }
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(4, 1), this.materials.gold);
    crystal.position.y = 11; group.add(crystal);
    const glow = new THREE.PointLight('#e4c876', 45, 90, 2); glow.position.y = 14; group.add(glow);
    group.position.set(shrine.x, 0, shrine.y); this.scene.add(group);
    this.shrineCrystal = crystal;
  }

  buildFirstPersonWeapon() {
    const weapon = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(.18, .2, .34), makeMaterial('#31464b', .82));
    sleeve.position.set(0, -.09, .12);
    weapon.add(sleeve);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.105, 8, 6), makeMaterial('#b99570', .85));
    hand.position.set(0, .015, -.07);
    weapon.add(hand);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(.035, .04, .25, 7), makeMaterial('#493528', .9));
    grip.rotation.x = Math.PI / 2;
    grip.position.set(0, .04, -.24);
    weapon.add(grip);
    const guard = new THREE.Mesh(new THREE.BoxGeometry(.28, .055, .065), makeMaterial('#b9a16c', .38, { metalness: .55 }));
    guard.position.set(0, .04, -.37);
    weapon.add(guard);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.105, .055, .64), makeMaterial('#d3d5c7', .28, { metalness: .68 }));
    blade.position.set(0, .055, -.69);
    weapon.add(blade);
    const point = new THREE.Mesh(new THREE.ConeGeometry(.053, .16, 4), makeMaterial('#d3d5c7', .28, { metalness: .68 }));
    point.rotation.x = -Math.PI / 2;
    point.position.set(0, .055, -1.08);
    weapon.add(point);
    weapon.position.set(.43, -.38, -.74);
    weapon.rotation.set(-.12, -.16, -.12);
    weapon.visible = false;
    this.camera.add(weapon);
    this.weaponBlade = weapon;
    return weapon;
  }

  setFirstPerson(enabled) {
    this.firstPerson = !!enabled;
    this.firstPersonWeapon.visible = this.firstPerson;
    this.player.visible = !this.firstPerson;
  }

  buildPlayer() {
    const group = new THREE.Group();
    const robe = makeMaterial('#31464b', .8), leather = makeMaterial('#514132'), skin = makeMaterial('#d2b88a'), steel = makeMaterial('#c4c7b9', .34, { metalness: .48 });
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(4.5, 5, 3, 6), robe);
    torso.position.y = 8; group.add(torso);
    const hood = new THREE.Mesh(new THREE.SphereGeometry(3.8, 8, 6), leather);
    hood.position.set(0, 14, -.2); group.add(hood);
    const face = new THREE.Mesh(new THREE.SphereGeometry(2.7, 8, 6), skin);
    face.position.set(0, 13.2, 2.45); group.add(face);
    const cape = new THREE.Mesh(new THREE.ConeGeometry(5.2, 11, 5), makeMaterial('#24373b'));
    cape.position.set(0, 4.7, -2.7); cape.rotation.x = .18; group.add(cape);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.8, .8, 13), steel);
    blade.position.set(5.1, 8.5, 2.2); blade.rotation.x = -.3; blade.rotation.z = -.25; group.add(blade);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, 4, 6), leather);
    grip.position.set(5, 8, -4.8); grip.rotation.x = Math.PI / 2; group.add(grip);
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(9, 20), new THREE.MeshBasicMaterial({ color: '#111811', transparent: true, opacity: .38, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .07; group.add(shadow);
    this.scene.add(group);
    return group;
  }

  makeEnemy(entity) {
    const group = new THREE.Group();
    const palette = { wolf: '#777568', wraith: '#91aaa0', brute: '#85804b', thrall: '#a34252', vampire: '#c4a0a0', demon: '#9970b0', dragon: '#914a36' };
    const color = entity.type === 'dragon' ? '#914a36' : palette[entity.type] || entity.color;
    const bodyTexture = entity.type === 'dragon' ? this.surfaceTextures.scales : entity.type === 'wraith' ? this.surfaceTextures.leaves : this.surfaceTextures.hide;
    const bodyMat = makeMaterial(color || '#777568', .82, {
      map: bodyTexture,
      ...(entity.type === 'wraith' ? { transparent: true, opacity: .78, emissive: '#58796b', emissiveIntensity: .35 } : {}),
    });
    const dark = makeMaterial(entity.type === 'vampire' ? '#351e2b' : entity.type === 'demon' ? '#291e32' : '#41372e', .82, { map: entity.type === 'dragon' ? this.surfaceTextures.membrane : this.surfaceTextures.planks });
    const eyeMat = makeMaterial(entity.type === 'demon' ? '#ed8df2' : '#f3db8e', .32, { emissive: entity.type === 'demon' ? '#a64baf' : '#9a4e20', emissiveIntensity: 1.1 });
    const sphere = new THREE.SphereGeometry(1, 9, 7);
    const body = new THREE.Mesh(sphere, bodyMat);
    const head = new THREE.Mesh(sphere, bodyMat);
    body.scale.set(entity.r * .85, entity.r * .7, entity.r * 1.05); body.position.y = entity.r * .72; group.add(body);
    head.scale.set(entity.r * .58, entity.r * .56, entity.r * .56); head.position.set(0, entity.r * 1.17, entity.r * .42); group.add(head);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(Math.max(1, entity.r * .09), 6, 5), eyeMat);
      eye.position.set(side * entity.r * .25, entity.r * 1.22, entity.r * .89); group.add(eye);
    }
    if (entity.type === 'wolf' || entity.type === 'brute' || entity.type === 'thrall') {
      for (const side of [-1, 1]) {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(entity.r * .22, entity.r * .6, 5), dark);
        ear.position.set(side * entity.r * .38, entity.r * 1.58, entity.r * .28); ear.rotation.z = side * -.28; group.add(ear);
      }
    }
    if (entity.type === 'vampire' || entity.type === 'demon') {
      const cape = new THREE.Mesh(new THREE.ConeGeometry(entity.r * 1.5, entity.r * 2.2, 6), dark);
      cape.position.set(0, entity.r * .8, -entity.r * .55); cape.rotation.x = -.18; group.add(cape);
      for (const side of [-1, 1]) {
        const horn = new THREE.Mesh(new THREE.ConeGeometry(entity.r * .15, entity.r * .85, 5), dark);
        horn.position.set(side * entity.r * .62, entity.r * 1.7, 0); horn.rotation.z = side * -.38; group.add(horn);
      }
    }
    if (entity.type === 'dragon') {
      for (const side of [-1, 1]) {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(entity.r * 1.28, entity.r * 2.6, 3), dark);
        wing.position.set(side * entity.r * 1.25, entity.r * .95, -.25); wing.rotation.z = side * -.92; wing.rotation.x = .35; group.add(wing);
        const spike = new THREE.Mesh(new THREE.ConeGeometry(entity.r * .12, entity.r * .65, 5), makeMaterial('#d9ae70'));
        spike.position.set(side * entity.r * .3, entity.r * 1.72, -.2); spike.rotation.z = side * -.35; group.add(spike);
      }
    }
    if (entity.boss) {
      const aura = new THREE.Mesh(new THREE.TorusGeometry(entity.r + 5, 1.05, 5, 36), new THREE.MeshBasicMaterial({ color: entity.type === 'dragon' ? '#e59252' : entity.type === 'demon' ? '#be83df' : '#d36771', transparent: true, opacity: .75 }));
      aura.rotation.x = Math.PI / 2; aura.position.y = .3; group.add(aura);
    }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(entity.r * 1.35, 18), new THREE.MeshBasicMaterial({ color: '#10150f', transparent: true, opacity: .32, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = .08; group.add(shadow);
    this.scene.add(group);
    return group;
  }

  makeLoot(item) {
    const group = new THREE.Group();
    const relic = item.type === 'relic';
    const stone = new THREE.Mesh(new THREE.OctahedronGeometry(relic ? 4.2 : 3.2, 0), makeMaterial(relic ? '#e5ca78' : '#c1d69b', .36, { emissive: relic ? '#a66f23' : '#476b32', emissiveIntensity: .8 }));
    stone.position.y = relic ? 8 : 5;
    group.add(stone);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(relic ? 8 : 6, .65, 5, 28), new THREE.MeshBasicMaterial({ color: relic ? '#f0d47b' : '#b8dfa1', transparent: true, opacity: .8 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = .3;
    group.add(ring);
    const glow = new THREE.PointLight(relic ? '#f0d47b' : '#b8dfa1', relic ? 16 : 9, 36, 2);
    glow.position.y = 7;
    group.add(glow);
    this.scene.add(group);
    return group;
  }

  makeShot(shot) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(Math.max(2, shot.r * .72), 10, 8), new THREE.MeshBasicMaterial({ color: shot.color }));
    mesh.add(new THREE.PointLight(shot.color, 8, 24, 2));
    this.scene.add(mesh);
    return mesh;
  }

  makeParticle(particle) {
    const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(Math.max(.7, particle.size * .5), 0), new THREE.MeshBasicMaterial({ color: particle.color, transparent: true, depthWrite: false }));
    this.scene.add(mesh);
    return mesh;
  }

  syncEntities(entities, cache, factory, visible) {
    const active = new Set();
    for (const entity of entities) {
      if (!visible(entity)) continue;
      active.add(entity);
      let mesh = cache.get(entity);
      if (!mesh) { mesh = factory.call(this, entity); cache.set(entity, mesh); }
      mesh.visible = true;
      mesh.position.set(entity.x, 0, entity.y);
    }
    for (const [entity, mesh] of cache) mesh.visible = active.has(entity);
  }

  render(world, elapsed, dt, shake = 0) {
    const { player, enemies, loot, shots, particles, shrine } = world;
    const time = elapsed || 0;
    this.player.position.set(player.x, Math.sin(time * 7) * .35, player.y);
    this.player.rotation.y = Math.PI / 2 - player.face;
    this.player.visible = !this.firstPerson && (player.invuln <= 0 || Math.floor(time * 18) % 2 === 0);
    this.player.rotation.z = -(player.attack > 0 ? Math.sin((player.attack / .31) * Math.PI) : 0) * .22;
    if (this.firstPersonWeapon) this.firstPersonWeapon.rotation.z = -.12 - (player.attack > 0 ? Math.sin((player.attack / .31) * Math.PI) * .8 : 0);

    this.syncEntities(enemies, this.entityMeshes, this.makeEnemy, entity => entity.alive);
    for (const entity of enemies) {
      const mesh = this.entityMeshes.get(entity);
      if (!mesh || !mesh.visible) continue;
      mesh.rotation.y = Math.atan2(player.x - entity.x, player.y - entity.y);
      mesh.position.y = Math.max(0, Math.sin(time * 5 + entity.x * .01) * (entity.type === 'wraith' ? 1.6 : .45));
      mesh.traverse(object => {
        if (object.isMesh && object.material.emissive) object.material.emissive.set(entity.hit > 0 ? '#6b3027' : '#000000');
      });
    }

    this.syncEntities(loot, this.lootMeshes, this.makeLoot, item => !item.got);
    for (const [item, mesh] of this.lootMeshes) {
      if (!mesh.visible) continue;
      mesh.position.set(item.x, Math.sin(time * 2.3 + item.glow) * 1.4, item.y);
      mesh.rotation.y = time * .8 + item.glow;
      mesh.children[0].rotation.y = time * 1.7;
    }

    this.syncEntities(shots, this.shotMeshes, this.makeShot, shot => shot.life > 0);
    for (const [shot, mesh] of this.shotMeshes) {
      if (!shots.includes(shot)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
        this.shotMeshes.delete(shot);
      } else if (mesh.visible) mesh.position.set(shot.x, 7 + Math.sin(time * 12) * 1.5, shot.y);
    }

    while (this.particleMeshes.length < particles.length) this.particleMeshes.push(this.makeParticle(particles[this.particleMeshes.length]));
    for (let i = 0; i < this.particleMeshes.length; i++) {
      const mesh = this.particleMeshes[i], particle = particles[i];
      mesh.visible = !!particle;
      if (particle) {
        mesh.position.set(particle.x, 2 + particle.size, particle.y);
        mesh.material.opacity = Math.max(0, particle.life / particle.max);
        mesh.scale.setScalar(.6 + particle.life / particle.max);
      }
    }

    if (this.firstPerson) {
      const forwardX = Math.cos(player.face), forwardZ = Math.sin(player.face);
      this.camera.position.set(player.x, 13, player.y);
      this.cameraTarget.set(player.x + forwardX * 100, 13 + Math.sin(this.lookPitch) * 100, player.y + forwardZ * 100);
      this.camera.lookAt(this.cameraTarget);
    } else {
      const distance = Math.min(340, Math.max(230, Math.min(window.innerWidth, window.innerHeight) * .32));
      const target = this.cameraTarget.set(player.x, 0, player.y);
      const desired = new THREE.Vector3(player.x, distance * .78, player.y + distance * .92);
      this.camera.position.lerp(desired, 1 - Math.exp(-7 * (dt || 0)));
      this.camera.lookAt(target);
    }
    if (shake > 0) this.camera.position.x += Math.sin(time * 83) * shake * .45;
    if (this.shrineCrystal) {
      this.shrineCrystal.rotation.y = time * .7;
      this.shrineCrystal.position.y = 11 + Math.sin(time * 2) * 1.2;
    }
    this.renderer.render(this.scene, this.camera);
  }
}

