/* eslint-disable react/immutability -- the render loop mutates three.js objects and shared frame state by design (the standard React Three Fiber pattern); none of it feeds React rendering. */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Path,
  PlaneGeometry,
  Quaternion,
  Shape,
  Sphere,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { createActSample, sampleActs, STAGE_KEYS } from "./acts";
import {
  createColumnMaterial,
  createCoreMaterial,
  createDustMaterial,
  createFresnelMaterial,
  createGlowMaterial,
  createGridMaterial,
  createHaloMaterial,
  createNebulaMaterial,
  createOrbMaterial,
  createRibbonMaterial,
  createTrailMaterial,
} from "./materials";
import { buildNetwork, describeNode } from "./networkModel";
import { selectNode, stage } from "./stageStore";
import { tierConfig } from "./quality";

const SEGMENTS = 14;
const FOV = 38;
const FOCUS_RANGE = 8;
const EDGE_WEIGHT = [0, 1.3, 0.9, 0.65];
const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending };

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
/** Ease-out with a small overshoot, for nodes popping into place. */
const backOut = (x) => {
  const t = clamp01(x) - 1;
  return 1 + t * t * (2.4 * t + 1.4);
};

/** Frees GPU resources created outside JSX when the owning component unmounts. */
function useDisposable(factory, deps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(factory, deps);
  useEffect(
    () => () => {
      Object.values(value)
        .flat()
        .forEach((item) => item?.dispose?.());
    },
    [value],
  );
  return value;
}

/** Fixed, full-viewport WebGL stage behind the home page. */
export default function Stage({ tier, reduce, eventSource, onReady }) {
  const config = tierConfig[tier] ?? tierConfig.medium;
  const graph = useMemo(() => buildNetwork(config), [config]);
  const live = useMemo(
    () => ({ ...createActSample(), time: 0, flowTime: 0, energy: 0, focus: 12, center: new Vector3(), intro: !reduce && stage.actPos < 0.5 }),
    // The intro plays once per mount, decided when the stage first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [degraded, setDegraded] = useState(false);

  return (
    <Canvas
      dpr={config.dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: FOV, position: [0, 0.35, 12], near: 0.1, far: 90 }}
      frameloop={reduce ? "demand" : "always"}
      eventSource={eventSource}
      eventPrefix="client"
      onPointerMissed={() => selectNode(null)}
      onCreated={(state) => {
        state.gl.setClearColor(0x000000, 0);
        stage.invalidate = state.invalidate;
        stage.setFrameloop = state.setFrameloop;
        onReady?.();
      }}
    >
      <Rig live={live} reduce={reduce} />
      <Nebula live={live} />
      {degraded ? null : <Constellations count={config.constellations} live={live} reduce={reduce} />}
      <World live={live} graph={graph} config={config} reduce={reduce} />
      {degraded ? null : <Dust count={config.dust} live={live} />}
      <Grid live={live} />
      {reduce ? null : <PerfWatch onDegrade={() => setDegraded(true)} />}
    </Canvas>
  );
}

/**
 * Turns the scroll act into camera motion. Between acts the camera swings on an arc instead of
 * sliding in a straight line; scroll speed adds a little energy (faster flows, a slight lens
 * stretch), and an idle drift keeps the frame breathing when nothing moves.
 */
function Rig({ live, reduce }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const sample = useMemo(() => createActSample(), []);
  const look = useRef(new Vector3());
  const target = useRef(new Vector3());

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const aspect = size.width / Math.max(1, size.height);
    const narrow = size.width < 1024 || aspect < 1.1;
    sampleActs(stage.actNames, stage.actPos, narrow, sample);

    const k = reduce ? 1 : 1 - Math.exp(-delta * 2.4);
    live.layoutA = sample.layoutA;
    live.layoutB = sample.layoutB;
    live.blend = sample.blend;
    live.interactive = sample.interactive;
    for (const key of STAGE_KEYS) {
      live[key] += (sample[key] - live[key]) * k;
    }
    live.shift[0] += (sample.shift[0] - live.shift[0]) * k;
    live.shift[1] += (sample.shift[1] - live.shift[1]) * k;
    live.time += reduce ? 0 : delta;

    const velocity = !reduce && performance.now() - stage.velocityAt < 160 ? Math.min(1.5, Math.abs(stage.velocity)) : 0;
    live.energy += (velocity - live.energy) * (1 - Math.exp(-delta * (velocity > live.energy ? 5 : 1.6)));
    live.flowTime += reduce ? 0 : delta * (1 + live.energy * 2.2);

    // Portrait screens pull the camera back so the network still reads as a whole.
    const distance = narrow ? Math.min(1.6, Math.max(1, 1.15 / aspect)) : 1;
    const motion = reduce ? 0 : 1;
    const swing = Math.sin(Math.PI * sample.blend) * (sample.index % 2 ? -1 : 1) * motion;
    const px = stage.pointer.x * 0.7 * motion + swing * 1.6 + Math.sin(live.time * 0.11) * 0.22 * motion;
    const py = stage.pointer.y * 0.4 * motion + Math.abs(swing) * 0.45 + Math.cos(live.time * 0.083) * 0.14 * motion;
    target.current.set(sample.cam[0] * distance + px, sample.cam[1] * distance + py, sample.cam[2] * distance + Math.abs(swing) * 0.8);
    camera.position.lerp(target.current, k);
    look.current.lerp(target.current.set(...sample.look), k);
    camera.lookAt(look.current);

    const fov = FOV + live.energy * 2.4;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    live.center.set(live.shift[0], live.shift[1], 0);
    live.focus = camera.position.distanceTo(live.center);
  });

  return null;
}

/** Screen-space nebula; its key light tracks wherever the network sits on screen. */
function Nebula({ live }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const parts = useDisposable(() => ({ geometry: new PlaneGeometry(1, 1), material: createNebulaMaterial() }), []);
  const project = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const { uniforms } = parts.material;
    uniforms.uTime.value = live.time;
    uniforms.uIntensity.value = live.nebula;
    uniforms.uAspect.value = size.width / Math.max(1, size.height);
    uniforms.uOffset.value[0] = camera.position.x * 0.025;
    uniforms.uOffset.value[1] = camera.position.y * 0.02;
    project.copy(live.center).project(camera);
    const focus = uniforms.uFocusPoint.value;
    focus[0] += (project.x * 0.5 + 0.5 - focus[0]) * 0.08;
    focus[1] += (project.y * 0.5 + 0.5 - focus[1]) * 0.08;
  });

  return <mesh geometry={parts.geometry} material={parts.material} frustumCulled={false} renderOrder={-10} />;
}

/** Everything that moves with the scroll shift: core, rings, and the network. */
function World({ live, graph, config, reduce }) {
  const shiftRef = useRef(null);
  const spinRef = useRef(null);
  const coreRef = useRef(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    shiftRef.current.position.set(live.shift[0], live.shift[1], 0);
    // The core recedes in the chart formations, swells for the finale, and ignites on first load.
    const level = live.core;
    const ignite = live.intro ? backOut((live.time - 0.15) / 1.1) : 1;
    coreRef.current.scale.setScalar(Math.max(0.001, (level < 1 ? 0.45 + 0.55 * level : 1 + (level - 1) * 0.1) * ignite));
    if (!reduce) {
      spinRef.current.rotation.y += delta * 0.07 * live.spin * (1 + live.energy * 0.6);
      spinRef.current.rotation.x = Math.sin(live.time * 0.12) * 0.06;
    }
  });

  return (
    <group ref={shiftRef}>
      <group ref={spinRef} rotation={[0, 0.5, 0]}>
        <Network graph={graph} config={config} live={live} reduce={reduce} />
      </group>
      <group ref={coreRef}>
        <Core live={live} segments={config.segments} />
        <Rings live={live} reduce={reduce} />
      </group>
    </group>
  );
}

function Core({ live, segments }) {
  const shell = useRef(null);
  const wire = useRef(null);
  const parts = useDisposable(
    () => ({
      sphere: new SphereGeometry(0.78, segments, Math.round(segments * 0.75)),
      plasma: createCoreMaterial(),
      rimGeometry: new SphereGeometry(1.18, segments, Math.round(segments * 0.75)),
      rim: createFresnelMaterial({ inner: "#00a8c8", outer: "#b8fff0", power: 2.6, intensity: 1.2 }),
      lattice: new IcosahedronGeometry(1.3, 1),
      latticeMaterial: new MeshBasicMaterial({ color: "#00e5f2", wireframe: true, ...additive, opacity: 0.2 }),
      plane: new PlaneGeometry(1, 1),
      glow: createGlowMaterial("#00a8c8"),
      glowInner: createGlowMaterial("#c9ffef"),
    }),
    [segments],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const pulse = 1 + Math.sin(live.time * 1.3) * 0.03;
    const level = live.core;
    shell.current.scale.setScalar(pulse * (0.9 + level * 0.1));
    wire.current.rotation.y -= delta * 0.18;
    wire.current.rotation.z += delta * 0.07;
    parts.plasma.uniforms.uTime.value = live.time;
    parts.plasma.uniforms.uLevel.value = Math.min(1.5, level);
    parts.glow.uniforms.uSize.value = 6 + level * 1.8;
    parts.glow.uniforms.uIntensity.value = 0.2 * level;
    parts.glowInner.uniforms.uSize.value = 2.3 * pulse;
    parts.glowInner.uniforms.uIntensity.value = 0.16 * level;
    parts.rim.uniforms.uIntensity.value = 0.35 + level * 0.35;
    parts.latticeMaterial.opacity = 0.04 + level * 0.06;
  });

  return (
    <group>
      <group ref={shell}>
        <mesh geometry={parts.sphere} material={parts.plasma} position={[0, 0, -0.55]} scale={0.42} />
        <mesh geometry={parts.rimGeometry} material={parts.rim} />
      </group>
      <Emblem live={live} />
      <mesh ref={wire} geometry={parts.lattice} material={parts.latticeMaterial} />
      <mesh geometry={parts.plane} material={parts.glow} renderOrder={2} />
      <mesh geometry={parts.plane} material={parts.glowInner} renderOrder={3} />
    </group>
  );
}

/** Hexagonal outline matching the site logo (pointy top), as a closed shape or a hole path. */
function hexagon(target, radius) {
  for (let i = 0; i <= 6; i += 1) {
    const angle = Math.PI / 2 + (i * Math.PI) / 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) target.moveTo(x, y);
    else target.lineTo(x, y);
  }
  return target;
}

/** The "P" monogram: a stem and a bowl with a counter cut out, centred on the origin. */
function monogram() {
  const shape = new Shape();
  shape.moveTo(-0.36, -0.58);
  shape.lineTo(-0.36, 0.58);
  shape.lineTo(0.06, 0.58);
  shape.absarc(0.06, 0.25, 0.33, Math.PI / 2, -Math.PI / 2, true);
  shape.lineTo(-0.16, -0.08);
  shape.lineTo(-0.16, -0.58);
  shape.closePath();
  const counter = new Path();
  counter.moveTo(-0.16, 0.4);
  counter.lineTo(0.06, 0.4);
  counter.absarc(0.06, 0.25, 0.15, Math.PI / 2, -Math.PI / 2, true);
  counter.lineTo(-0.16, 0.1);
  counter.closePath();
  shape.holes.push(counter);
  return shape;
}

/**
 * Original Proova emblem at the heart of the core: a metallic hexagon frame and "P" monogram
 * with lime holographic edges. It sways on its own and leans toward the pointer in the hero.
 */
function Emblem({ live }) {
  const group = useRef(null);
  const parts = useDisposable(() => {
    const frameShape = hexagon(new Shape(), 0.98);
    frameShape.holes.push(hexagon(new Path(), 0.84));
    const bevel = { bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2, curveSegments: 28 };
    const frame = new ExtrudeGeometry(frameShape, { depth: 0.12, ...bevel });
    frame.center();
    const letter = new ExtrudeGeometry(monogram(), { depth: 0.2, ...bevel });
    letter.center();
    const accent = new BoxGeometry(0.14, 0.14, 0.2);
    return {
      frame,
      letter,
      accent,
      frameEdges: new EdgesGeometry(frame, 25),
      letterEdges: new EdgesGeometry(letter, 25),
      frameMaterial: new MeshStandardMaterial({ color: "#0c3d45", metalness: 0.9, roughness: 0.32, emissive: new Color("#00c8dc"), emissiveIntensity: 0.32 }),
      letterMaterial: new MeshStandardMaterial({ color: "#bff6fb", metalness: 0.85, roughness: 0.2, emissive: new Color("#0096ad"), emissiveIntensity: 0.4 }),
      accentMaterial: new MeshBasicMaterial({ color: new Color("#a8ff00") }),
      edgeMaterial: new LineBasicMaterial({ color: new Color("#a8ff00"), ...additive, opacity: 0.55 }),
      cyanEdgeMaterial: new LineBasicMaterial({ color: new Color("#7ff6ff"), ...additive, opacity: 0.6 }),
    };
  }, []);

  useFrame(() => {
    const node = group.current;
    const lean = live.interactive ? 1 : 0;
    const targetY = Math.sin(live.time * 0.35) * 0.42 + stage.pointer.x * 0.35 * lean;
    const targetX = Math.sin(live.time * 0.27) * 0.08 - stage.pointer.y * 0.22 * lean;
    node.rotation.y += (targetY - node.rotation.y) * 0.06;
    node.rotation.x += (targetX - node.rotation.x) * 0.06;
    node.position.y = Math.sin(live.time * 0.8) * 0.04;
    // A slow holographic shimmer along the edges.
    const shimmer = 0.5 + 0.5 * Math.sin(live.time * 1.7);
    parts.edgeMaterial.opacity = 0.35 + shimmer * 0.35;
    parts.letterMaterial.emissiveIntensity = 0.38 + shimmer * 0.18;
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.35} color="#5fd8e0" />
      <directionalLight position={[-3, 4, 6]} intensity={2.4} color="#e6fffb" />
      <pointLight position={[2.2, -1.2, 2.6]} intensity={5} distance={9} decay={1.6} color="#a8ff00" />
      <mesh geometry={parts.frame} material={parts.frameMaterial} />
      <lineSegments geometry={parts.frameEdges} material={parts.cyanEdgeMaterial} />
      <group position={[0.02, 0, 0.04]}>
        <mesh geometry={parts.letter} material={parts.letterMaterial} />
        <lineSegments geometry={parts.letterEdges} material={parts.edgeMaterial} />
      </group>
      <mesh geometry={parts.accent} material={parts.accentMaterial} position={[0.34, -0.48, 0.04]} />
    </group>
  );
}

/** Orbits around the core: thin rings whose light gathers into comet trails behind each bead. */
const RINGS = [
  { radius: 1.42, tube: 0.008, tilt: [1.2, 0.2, 0], speed: 0.34, color: "#00e5f2", beads: 2 },
  { radius: 2.02, tube: 0.006, tilt: [1.78, -0.42, 0.3], speed: -0.21, color: "#a8ff00", beads: 1 },
  { radius: 2.66, tube: 0.006, tilt: [0.5, 0.9, -0.2], speed: 0.14, color: "#00f5d4", beads: 3 },
];

function Rings({ live, reduce }) {
  const refs = useRef([]);
  const parts = useDisposable(
    () => ({
      torus: RINGS.map((ring) => new TorusGeometry(ring.radius, ring.tube, 6, 220)),
      trails: RINGS.map((ring) => createTrailMaterial(ring.color, ring.beads * Math.sign(ring.speed))),
      bead: new SphereGeometry(0.03, 10, 8),
      beadMaterial: new MeshBasicMaterial({ color: new Color("#f2fbff") }),
    }),
    [],
  );

  useFrame((_, rawDelta) => {
    const level = Math.min(1, live.core);
    parts.trails.forEach((material) => (material.uniforms.uOpacity.value = 0.45 + level * 0.55));
    if (reduce) return;
    const delta = Math.min(rawDelta, 0.1);
    refs.current.forEach((ring, index) => {
      if (ring) ring.rotation.z += delta * RINGS[index].speed * (1 + live.energy);
    });
  });

  return RINGS.map((ring, index) => (
    <group key={ring.radius} rotation={ring.tilt}>
      <group ref={(node) => (refs.current[index] = node)}>
        <mesh geometry={parts.torus[index]} material={parts.trails[index]} />
        {Array.from({ length: ring.beads }, (_, bead) => {
          const angle = (bead / ring.beads) * Math.PI * 2;
          return (
            <mesh
              key={bead}
              geometry={parts.bead}
              material={parts.beadMaterial}
              position={[Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0]}
            />
          );
        })}
      </group>
    </group>
  ));
}

function quadratic(out, offset, a, c, b, t) {
  const u = 1 - t;
  out[offset] = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
  out[offset + 1] = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
  out[offset + 2] = u * u * a[2] + 2 * u * t * c[2] + t * t * b[2];
}

/** Ribbon strip geometry: two vertices per curve point, `SEGMENTS + 1` points per edge. */
function createRibbonGeometry(nodes) {
  const count = nodes.length;
  const points = SEGMENTS + 1;
  const vertices = count * points * 2;
  const geometry = new BufferGeometry();
  const side = new Float32Array(vertices);
  const dir = new Float32Array(vertices);
  const t = new Float32Array(vertices);
  const seed = new Float32Array(vertices);
  const weight = new Float32Array(vertices);
  const index = [];
  for (let e = 0; e < count; e += 1) {
    const s = (e * 0.6180339) % 1;
    for (let i = 0; i < points; i += 1) {
      for (let k = 0; k < 2; k += 1) {
        const v = (e * points + i) * 2 + k;
        side[v] = k ? 1 : -1;
        dir[v] = i < SEGMENTS ? 1 : -1;
        t[v] = i / SEGMENTS;
        seed[v] = s;
        weight[v] = EDGE_WEIGHT[nodes[e].level];
      }
      if (i < SEGMENTS) {
        const v = (e * points + i) * 2;
        index.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
      }
    }
  }
  geometry.setIndex(index);
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices * 3), 3));
  geometry.setAttribute("aOther", new BufferAttribute(new Float32Array(vertices * 3), 3));
  geometry.setAttribute("aSide", new BufferAttribute(side, 1));
  geometry.setAttribute("aDir", new BufferAttribute(dir, 1));
  geometry.setAttribute("aT", new BufferAttribute(t, 1));
  geometry.setAttribute("aSeed", new BufferAttribute(seed, 1));
  geometry.setAttribute("aWeight", new BufferAttribute(weight, 1));
  geometry.setAttribute("aHi", new BufferAttribute(new Float32Array(vertices), 1));
  geometry.setAttribute("aGrow", new BufferAttribute(new Float32Array(vertices).fill(1), 1));
  return geometry;
}

/** Instanced orb nodes, bokeh halos, ribbon edges, flow particles and analytics columns. */
function Network({ graph, config, live, reduce }) {
  const { nodes, layouts, barHeights, floor } = graph;
  const count = nodes.length;
  const flowCount = count * config.flowsPerEdge;
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);

  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const hitRef = useRef(null);
  const columnsRef = useRef(null);
  const hovered = useRef(-1);

  const parts = useDisposable(() => {
    const halo = new BufferGeometry();
    halo.setAttribute("position", new BufferAttribute(new Float32Array(count * 3), 3));
    halo.setAttribute("aSize", new BufferAttribute(Float32Array.from(nodes, (node) => node.size * 7.5), 1));
    halo.setAttribute("aGlow", new BufferAttribute(new Float32Array(count).fill(0.6), 1));
    const haloColors = new Float32Array(count * 3);
    const color = new Color();
    nodes.forEach((node, index) => color.set(node.color).toArray(haloColors, index * 3));
    halo.setAttribute("aColor", new BufferAttribute(haloColors, 3));

    const flows = new BufferGeometry();
    flows.setAttribute("position", new BufferAttribute(new Float32Array(flowCount * 3), 3));
    flows.setAttribute("aSize", new BufferAttribute(new Float32Array(flowCount).fill(0.3), 1));
    flows.setAttribute("aGlow", new BufferAttribute(new Float32Array(flowCount).fill(0.9), 1));
    const flowColors = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount; i += 1) color.set(i % 3 ? "#9ff7ff" : "#d8ffb0").toArray(flowColors, i * 3);
    flows.setAttribute("aColor", new BufferAttribute(flowColors, 3));

    const column = new BoxGeometry(1, 1, 1);
    column.translate(0, 0.5, 0);

    return {
      sphere: new SphereGeometry(1, config.segments / 2, config.segments / 3),
      hitSphere: new SphereGeometry(1, 8, 6),
      nodeMaterial: createOrbMaterial(),
      hitMaterial: new MeshBasicMaterial({ visible: false }),
      halo,
      haloMaterial: createHaloMaterial(),
      edges: createRibbonGeometry(nodes),
      edgeMaterial: createRibbonMaterial(),
      flows,
      flowMaterial: createHaloMaterial(),
      column,
      columnMaterial: createColumnMaterial(),
    };
  }, [count, flowCount]);

  const state = useMemo(
    () => ({
      current: Float32Array.from(layouts[0]),
      shown: new Float32Array(count * 3),
      curve: new Float32Array(count * (SEGMENTS + 1) * 3),
      glow: new Float32Array(count).fill(0.6),
      edgeHi: new Float32Array(count),
      grow: new Float32Array(count).fill(1),
      born: new Float32Array(count).fill(1),
      flash: new Float32Array(count),
      columns: 0,
      lineageFor: -2,
      lineage: new Set(),
      // Intro timing: each edge draws out from its parent, then its node pops in at the tip.
      delay: Float32Array.from(nodes, (node, index) => 0.55 + (node.level - 1) * 0.55 + ((index * 0.381966) % 1) * 0.4),
      flowSeed: Float32Array.from({ length: flowCount }, (_, i) => (i * 0.37) % 1),
      flowSpeed: Float32Array.from({ length: flowCount }, (_, i) => 0.18 + ((i * 0.53) % 1) * 0.22),
    }),
    [layouts, nodes, count, flowCount],
  );

  // Base colours, a generous bounding sphere (nodes move every frame), and gated raycasting.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    const hit = hitRef.current;
    const color = new Color();
    nodes.forEach((node, index) => mesh.setColorAt(index, color.set(node.color)));
    mesh.instanceColor.needsUpdate = true;
    hit.boundingSphere = new Sphere(new Vector3(), 40);
    hit.raycast = function raycast(raycaster, intersects) {
      if (live.interactive) InstancedMesh.prototype.raycast.call(this, raycaster, intersects);
    };
    const columns = columnsRef.current;
    const matrix = new Matrix4();
    const low = new Color("#00788a");
    const high = new Color("#00f5d4");
    nodes.forEach((node, index) => {
      matrix.makeTranslation(layouts[2][index * 3], floor, layouts[2][index * 3 + 2]);
      columns.setMatrixAt(index, matrix);
      columns.setColorAt(index, color.copy(low).lerp(high, Math.min(1, barHeights[index] / 2.8)));
    });
    columns.instanceColor.needsUpdate = true;
  }, [nodes, layouts, barHeights, floor, live]);

  const scratch = useMemo(
    () => ({
      matrix: new Matrix4(),
      quaternion: new Quaternion(),
      position: new Vector3(),
      scale: new Vector3(),
      color: new Color(),
      white: new Color("#ffffff"),
      a: [0, 0, 0],
      b: [0, 0, 0],
      c: [0, 0, 0],
      project: new Vector3(),
    }),
    [],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { current, shown, curve, glow, edgeHi, grow, born, flash } = state;
    const { matrix, quaternion, position, scale, color, white, a, b, c } = scratch;
    const A = layouts[live.layoutA];
    const B = layouts[live.layoutB];
    const f = live.blend * live.blend * (3 - 2 * live.blend);

    // Lineage of the selected node: its ancestors, itself, and its children.
    const selected = live.interactive ? (stage.selected?.index ?? -1) : -1;
    if (state.lineageFor !== selected) {
      state.lineageFor = selected;
      state.lineage.clear();
      if (selected >= 0) {
        for (let cursor = selected; cursor >= 0; cursor = nodes[cursor].parent) state.lineage.add(cursor);
        nodes.forEach((node) => node.parent === selected && state.lineage.add(node.index));
      }
    }
    if (!live.interactive && hovered.current !== -1) {
      hovered.current = -1;
      document.body.style.cursor = "";
    }

    const glowK = reduce ? 1 : 1 - Math.exp(-delta * 7);
    for (let i = 0; i < count; i += 1) {
      const node = nodes[i];
      const k = reduce ? 1 : 1 - Math.exp(-delta * node.speed);
      for (let axis = 0; axis < 3; axis += 1) {
        const j = i * 3 + axis;
        current[j] += (A[j] + (B[j] - A[j]) * f - current[j]) * k;
      }

      if (live.intro) {
        const local = live.time - state.delay[i];
        grow[i] = smooth(local / 0.7);
        born[i] = backOut((local - 0.5) / 0.55);
        flash[i] = local > 0.5 ? Math.max(0, 1 - (local - 0.5) / 0.9) : 0;
      }

      // Rendered position: the morph target, nudged by a slow per-node drift so nothing is static.
      const drift = reduce ? 0 : 0.06;
      shown[i * 3] = current[i * 3] + Math.sin(live.time * 0.5 + i * 1.3) * drift;
      shown[i * 3 + 1] = current[i * 3 + 1] + Math.sin(live.time * 0.62 + i * 2.1) * drift;
      shown[i * 3 + 2] = current[i * 3 + 2] + Math.cos(live.time * 0.44 + i * 0.7) * drift;

      const inLineage = state.lineage.has(i);
      const targetGlow = 0.6 + (inLineage ? 0.75 : 0) + (i === hovered.current ? 1.1 : 0) + (i === selected ? 0.5 : 0);
      glow[i] += (targetGlow - glow[i]) * glowK;
      const parent = node.parent;
      const lit = inLineage && (parent < 0 || state.lineage.has(parent)) && selected >= 0 ? 1 : 0;
      edgeHi[i] += (lit - edgeHi[i]) * glowK;
    }
    if (live.intro && live.time > 4.5) live.intro = false;

    // Nodes, hit targets and halos.
    const mesh = meshRef.current;
    const hit = hitRef.current;
    const haloPosition = parts.halo.attributes.position.array;
    const haloGlow = parts.halo.attributes.aGlow.array;
    for (let i = 0; i < count; i += 1) {
      position.fromArray(shown, i * 3);
      const s = nodes[i].size * (1 + (glow[i] - 0.6) * 0.32) * Math.max(0.0001, born[i]);
      matrix.compose(position, quaternion, scale.setScalar(s));
      mesh.setMatrixAt(i, matrix);
      matrix.compose(position, quaternion, scale.setScalar(Math.max(0.3, nodes[i].size * 2.6)));
      hit.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color.set(nodes[i].color).lerp(white, Math.min(0.6, (glow[i] - 0.6) * 0.35 + flash[i] * 0.35)));
      haloPosition[i * 3] = shown[i * 3];
      haloPosition[i * 3 + 1] = shown[i * 3 + 1];
      haloPosition[i * 3 + 2] = shown[i * 3 + 2];
      haloGlow[i] = (glow[i] + flash[i] * 0.8) * Math.min(1, born[i]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    hit.instanceMatrix.needsUpdate = true;
    parts.halo.attributes.position.needsUpdate = true;
    parts.halo.attributes.aGlow.needsUpdate = true;

    // Curved edges, re-sampled from live node positions so they follow every morph.
    const points = SEGMENTS + 1;
    for (let e = 0; e < count; e += 1) {
      const parent = nodes[e].parent;
      if (parent >= 0) {
        a[0] = shown[parent * 3];
        a[1] = shown[parent * 3 + 1];
        a[2] = shown[parent * 3 + 2];
      } else {
        a[0] = a[1] = a[2] = 0;
      }
      b[0] = shown[e * 3];
      b[1] = shown[e * 3 + 1];
      b[2] = shown[e * 3 + 2];
      const bend = 1 + 0.16 * Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 3);
      c[0] = ((a[0] + b[0]) / 2) * bend;
      c[1] = ((a[1] + b[1]) / 2) * bend + 0.12;
      c[2] = ((a[2] + b[2]) / 2) * bend;
      for (let i = 0; i < points; i += 1) quadratic(curve, (e * points + i) * 3, a, c, b, i / SEGMENTS);
    }

    // Ribbon strip: each point carries its neighbour so the vertex shader can widen it on screen.
    const edgePosition = parts.edges.attributes.position.array;
    const edgeOther = parts.edges.attributes.aOther.array;
    const edgeHiAttr = parts.edges.attributes.aHi.array;
    const edgeGrow = parts.edges.attributes.aGrow.array;
    for (let e = 0; e < count; e += 1) {
      for (let i = 0; i < points; i += 1) {
        const p = (e * points + i) * 3;
        const o = i < SEGMENTS ? p + 3 : p - 3;
        for (let k = 0; k < 2; k += 1) {
          const v = (e * points + i) * 2 + k;
          edgePosition[v * 3] = curve[p];
          edgePosition[v * 3 + 1] = curve[p + 1];
          edgePosition[v * 3 + 2] = curve[p + 2];
          edgeOther[v * 3] = curve[o];
          edgeOther[v * 3 + 1] = curve[o + 1];
          edgeOther[v * 3 + 2] = curve[o + 2];
          edgeHiAttr[v] = edgeHi[e];
          edgeGrow[v] = grow[e];
        }
      }
    }
    parts.edges.attributes.position.needsUpdate = true;
    parts.edges.attributes.aOther.needsUpdate = true;
    parts.edges.attributes.aHi.needsUpdate = true;
    parts.edges.attributes.aGrow.needsUpdate = true;

    const dpr = gl.getPixelRatio();
    const edgeUniforms = parts.edgeMaterial.uniforms;
    edgeUniforms.uTime.value = live.flowTime;
    edgeUniforms.uOpacity.value = live.lines;
    edgeUniforms.uWidth.value = 2.6 * dpr;
    edgeUniforms.uResolution.value[0] = size.width * dpr;
    edgeUniforms.uResolution.value[1] = size.height * dpr;

    // Particles riding the edges from parent to child; lit edges carry brighter, larger ones.
    const flowPosition = parts.flows.attributes.position.array;
    const flowGlow = parts.flows.attributes.aGlow.array;
    for (let i = 0; i < flowCount; i += 1) {
      const e = i % count;
      const t = (live.flowTime * state.flowSpeed[i] + state.flowSeed[i]) % 1;
      const segment = Math.min(SEGMENTS - 1, Math.floor(t * SEGMENTS));
      const local = t * SEGMENTS - segment;
      const p = (e * points + segment) * 3;
      flowPosition[i * 3] = curve[p] + (curve[p + 3] - curve[p]) * local;
      flowPosition[i * 3 + 1] = curve[p + 1] + (curve[p + 4] - curve[p + 1]) * local;
      flowPosition[i * 3 + 2] = curve[p + 2] + (curve[p + 5] - curve[p + 2]) * local;
      flowGlow[i] = (0.55 + edgeHi[e] * 1.2 + live.energy * 0.5) * Math.sin(t * Math.PI) * (t < grow[e] ? 1 : 0);
    }
    parts.flows.attributes.position.needsUpdate = true;
    parts.flows.attributes.aGlow.needsUpdate = true;
    parts.flowMaterial.uniforms.uOpacity.value = live.lines;

    const projection = (dpr * size.height) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    parts.haloMaterial.uniforms.uScale.value = projection;
    parts.flowMaterial.uniforms.uScale.value = projection;
    for (const material of [parts.nodeMaterial, parts.haloMaterial, parts.flowMaterial, parts.edgeMaterial]) {
      material.uniforms.uFocus.value = live.focus;
      material.uniforms.uFocusRange.value = FOCUS_RANGE;
    }

    // Analytics columns rise out of the floor when the formation turns into a chart.
    state.columns += (live.columns - state.columns) * (reduce ? 1 : 1 - Math.exp(-delta * 2));
    const columns = columnsRef.current;
    columns.visible = state.columns > 0.01;
    if (columns.visible) {
      for (let i = 0; i < count; i += 1) {
        const rise = smooth(state.columns * 1.4 - (i / count) * 0.4);
        position.set(layouts[2][i * 3], floor, layouts[2][i * 3 + 2]);
        matrix.compose(position, quaternion, scale.set(0.42, Math.max(0.001, barHeights[i] * rise), 0.42));
        columns.setMatrixAt(i, matrix);
      }
      columns.instanceMatrix.needsUpdate = true;
      parts.columnMaterial.uniforms.uOpacity.value = state.columns;
      parts.columnMaterial.uniforms.uTime.value = live.time;
    }

    // Keep the DOM info panel pinned beside the selected node.
    const panel = stage.panelEl;
    if (panel) {
      if (selected >= 0) {
        const projected = scratch.project.fromArray(shown, selected * 3).applyMatrix4(groupRef.current.matrixWorld).project(camera);
        // On wide screens keep the panel clear of the hero copy on the left.
        const x = Math.max((projected.x * 0.5 + 0.5) * size.width, size.width >= 1024 ? size.width * 0.56 : 0);
        const y = Math.min(Math.max((-projected.y * 0.5 + 0.5) * size.height, 150), size.height - 150);
        panel.style.transform = size.width < 640 ? "none" : `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        panel.dataset.side = x > size.width * 0.66 ? "left" : "right";
        panel.dataset.visible = "true";
      } else {
        panel.dataset.visible = "false";
      }
    }
  });

  const onPointerMove = (event) => {
    if (!live.interactive || event.pointerType !== "mouse") return;
    event.stopPropagation();
    if (hovered.current !== event.instanceId) {
      hovered.current = event.instanceId;
      document.body.style.cursor = "pointer";
    }
  };
  const onPointerOut = () => {
    hovered.current = -1;
    document.body.style.cursor = "";
  };
  const onClick = (event) => {
    if (!live.interactive) return;
    if (event.nativeEvent.target?.closest?.("a, button, input, textarea, select, [role='tab'], [data-no-stage]")) return;
    event.stopPropagation();
    const node = nodes[event.instanceId];
    if (node) selectNode(stage.selected?.index === node.index ? null : describeNode(node));
  };

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[parts.sphere, parts.nodeMaterial, count]} frustumCulled={false} />
      <instancedMesh
        ref={hitRef}
        args={[parts.hitSphere, parts.hitMaterial, count]}
        frustumCulled={false}
        onPointerMove={onPointerMove}
        onPointerOut={onPointerOut}
        onClick={onClick}
      />
      <points geometry={parts.halo} material={parts.haloMaterial} frustumCulled={false} renderOrder={4} />
      <mesh geometry={parts.edges} material={parts.edgeMaterial} frustumCulled={false} renderOrder={1} />
      <points geometry={parts.flows} material={parts.flowMaterial} frustumCulled={false} renderOrder={5} />
      <instancedMesh ref={columnsRef} args={[parts.column, parts.columnMaterial, count]} frustumCulled={false} visible={false} />
    </group>
  );
}

/**
 * Distant mini-networks on the deepest depth layers. They sit far behind the focal plane, so
 * their nodes open into soft bokeh while the camera's travel gives them parallax.
 */
function Constellations({ count, live, reduce }) {
  const groupRef = useRef(null);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const parts = useDisposable(() => {
    let s = 23;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    const positions = [];
    const sizes = [];
    const colors = [];
    const lines = [];
    const palette = ["#00f5d4", "#00a8c8", "#00e5f2", "#a8ff00"].map((hex) => new Color(hex));
    for (let cluster = 0; cluster < count; cluster += 1) {
      const angle = (cluster / count) * Math.PI * 2 + rand() * 0.5;
      const center = [Math.cos(angle) * (13 + rand() * 9), (rand() - 0.5) * 14, -10 - rand() * 18];
      const spread = 1.2 + rand() * 1.4;
      positions.push(...center);
      sizes.push(0.9);
      palette[3].toArray(colors, colors.length);
      const branches = 3 + Math.floor(rand() * 2);
      for (let branch = 0; branch < branches; branch += 1) {
        const theta = (branch / branches) * Math.PI * 2 + rand();
        const child = [center[0] + Math.cos(theta) * spread, center[1] + Math.sin(theta) * spread * 0.8, center[2] + (rand() - 0.5) * spread];
        const childIndex = positions.length / 3;
        positions.push(...child);
        sizes.push(0.6);
        palette[branch % 2].toArray(colors, colors.length);
        lines.push(...center, ...child);
        const leaves = 1 + Math.floor(rand() * 2);
        for (let leaf = 0; leaf < leaves; leaf += 1) {
          const phi = theta + (leaf - (leaves - 1) / 2) * 0.8;
          const tip = [child[0] + Math.cos(phi) * spread * 0.6, child[1] + Math.sin(phi) * spread * 0.5, child[2] + (rand() - 0.5) * spread * 0.6];
          positions.push(...tip);
          sizes.push(0.42);
          palette[2].toArray(colors, colors.length);
          lines.push(...positions.slice(childIndex * 3, childIndex * 3 + 3), ...tip);
        }
      }
    }
    const points = new BufferGeometry();
    points.setAttribute("position", new BufferAttribute(Float32Array.from(positions), 3));
    points.setAttribute("aSize", new BufferAttribute(Float32Array.from(sizes), 1));
    points.setAttribute("aGlow", new BufferAttribute(new Float32Array(sizes.length).fill(0.5), 1));
    points.setAttribute("aColor", new BufferAttribute(Float32Array.from(colors), 3));
    const edges = new BufferGeometry();
    edges.setAttribute("position", new BufferAttribute(Float32Array.from(lines), 3));
    const material = createHaloMaterial();
    material.uniforms.uFocusRange.value = 14;
    return {
      points,
      edges,
      material,
      lineMaterial: new LineBasicMaterial({ color: new Color("#00b8c8"), ...additive, opacity: 0.1 }),
    };
  }, [count]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    if (!reduce) groupRef.current.rotation.y += delta * 0.008;
    const glowArray = parts.points.attributes.aGlow.array;
    for (let i = 0; i < glowArray.length; i += 1) {
      glowArray[i] = (0.38 + 0.22 * Math.sin(live.time * (0.4 + (i % 5) * 0.13) + i * 1.7)) * (0.6 + live.nebula * 0.4);
    }
    parts.points.attributes.aGlow.needsUpdate = true;
    const { uniforms } = parts.material;
    uniforms.uScale.value = (gl.getPixelRatio() * size.height) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    uniforms.uFocus.value = live.focus;
    parts.lineMaterial.opacity = 0.05 + live.nebula * 0.06;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={parts.edges} material={parts.lineMaterial} frustumCulled={false} />
      <points geometry={parts.points} material={parts.material} frustumCulled={false} />
    </group>
  );
}

function Dust({ count, live }) {
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const parts = useDisposable(() => {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    let s = 7;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return s / 2147483647;
    };
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() - 0.5) * 44;
      positions[i * 3 + 1] = (rand() - 0.5) * 22;
      positions[i * 3 + 2] = (rand() - 0.5) * 34 - 4;
      seeds[i] = rand();
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    return { geometry, material: createDustMaterial() };
  }, [count]);

  useFrame(() => {
    parts.material.uniforms.uTime.value = live.time;
    parts.material.uniforms.uScale.value = (gl.getPixelRatio() * size.height) / (2 * Math.tan((camera.fov * Math.PI) / 360));
  });

  return <points geometry={parts.geometry} material={parts.material} frustumCulled={false} />;
}

function Grid({ live }) {
  const ref = useRef(null);
  const parts = useDisposable(() => ({ geometry: new PlaneGeometry(48, 48), material: createGridMaterial() }), []);

  useFrame(() => {
    ref.current.position.y = live.gridY;
    parts.material.uniforms.uTime.value = live.time;
    parts.material.uniforms.uOpacity.value = live.grid;
  });

  return <mesh ref={ref} geometry={parts.geometry} material={parts.material} rotation={[-Math.PI / 2, 0, 0]} renderOrder={0} />;
}

/** Lowers resolution, then drops the decorative layers, if the device cannot hold a smooth frame rate. */
function PerfWatch({ onDegrade }) {
  const setDpr = useThree((state) => state.setDpr);
  const tally = useRef({ warm: 0, frames: 0, time: 0, step: 0 });

  useFrame((_, delta) => {
    const t = tally.current;
    if (delta > 0.25 || t.step > 1) return;
    t.warm += delta;
    if (t.warm < 2.5) return;
    t.frames += 1;
    t.time += delta;
    if (t.time < 2) return;
    const fps = t.frames / t.time;
    t.frames = 0;
    t.time = 0;
    if (fps < 45 && t.step === 0) {
      setDpr(1);
      t.step = 1;
    } else if (fps < 32 && t.step === 1) {
      onDegrade();
      t.step = 2;
    }
  });

  return null;
}
