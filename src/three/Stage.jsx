/* eslint-disable react/immutability -- the render loop mutates three.js objects and shared frame state by design (the standard React Three Fiber pattern); none of it feeds React rendering. */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DodecahedronGeometry,
  EdgesGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  LineBasicMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  PlaneGeometry,
  PMREMGenerator,
  Quaternion,
  Scene,
  Sphere,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { createActSample, sampleActs } from "./acts";
import {
  createDustMaterial,
  createEdgeMaterial,
  createFresnelMaterial,
  createGlowMaterial,
  createGridMaterial,
  createHaloMaterial,
} from "./materials";
import { buildNetwork, describeNode } from "./networkModel";
import { selectNode, stage } from "./stageStore";
import { tierConfig } from "./quality";

const SEGMENTS = 12;
const additive = { transparent: true, depthWrite: false, blending: AdditiveBlending };

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
  const live = useMemo(() => ({ ...createActSample(), time: 0 }), []);
  const [degraded, setDegraded] = useState(false);

  return (
    <Canvas
      dpr={config.dpr}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 38, position: [0, 0.35, 12], near: 0.1, far: 90 }}
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
      <fog attach="fog" args={["#070b18", 14, 38]} />
      <StudioEnvironment />
      <ambientLight intensity={0.35} color="#7183ff" />
      <directionalLight position={[-6, 5, 8]} intensity={1.1} color="#a9b8ff" />
      <directionalLight position={[4, 6, -10]} intensity={2.2} color="#8b5cf6" />
      <directionalLight position={[8, -3, 4]} intensity={0.6} color="#34d399" />

      <Rig live={live} reduce={reduce} />
      <World live={live} graph={graph} config={config} reduce={reduce} />
      {degraded ? null : <Floaters count={config.floaters} live={live} reduce={reduce} />}
      {degraded ? null : <Dust count={config.dust} live={live} />}
      <Grid live={live} />
      {reduce ? null : <PerfWatch onDegrade={() => setDegraded(true)} />}
    </Canvas>
  );
}

/** Prefiltered environment built from a few coloured light panels — gives metal something to reflect. */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const envScene = new Scene();
    const disposables = [];
    const room = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: "#04050c", side: BackSide }));
    room.scale.setScalar(24);
    envScene.add(room);
    disposables.push(room.geometry, room.material);

    const panel = new PlaneGeometry(1, 1);
    disposables.push(panel);
    const panels = [
      { color: "#5ad7f2", power: 5, position: [-8, 4, 4], scale: [6, 3] },
      { color: "#8b5cf6", power: 6, position: [9, 2, -2], scale: [5, 6] },
      { color: "#4f8cff", power: 4, position: [0, 10, 0], scale: [10, 10] },
      { color: "#ffffff", power: 2.5, position: [2, 1, 11], scale: [8, 2] },
      { color: "#34d399", power: 1.6, position: [0, -9, 3], scale: [6, 2] },
    ];
    panels.forEach(({ color, power, position, scale }) => {
      const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(power), side: BackSide });
      const mesh = new Mesh(panel, material);
      mesh.position.set(...position);
      mesh.scale.set(scale[0], scale[1], 1);
      mesh.lookAt(0, 0, 0);
      envScene.add(mesh);
      disposables.push(material);
    });

    const target = pmrem.fromScene(envScene, 0.035);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      disposables.forEach((item) => item.dispose());
    };
  }, [gl, scene]);

  return null;
}

/** Turns the scroll act into camera motion, with a little pointer parallax on the hero. */
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
    for (const key of ["lines", "spin", "core", "grid", "gridY", "columns"]) {
      live[key] += (sample[key] - live[key]) * k;
    }
    live.shift[0] += (sample.shift[0] - live.shift[0]) * k;
    live.shift[1] += (sample.shift[1] - live.shift[1]) * k;
    live.time += reduce ? 0 : delta;

    // Portrait screens pull the camera back so the network still reads as a whole.
    const distance = narrow ? Math.min(1.6, Math.max(1, 1.15 / aspect)) : 1;
    const px = reduce ? 0 : stage.pointer.x * 0.7;
    const py = reduce ? 0 : stage.pointer.y * 0.4;
    target.current.set(sample.cam[0] * distance + px, sample.cam[1] * distance + py, sample.cam[2] * distance);
    camera.position.lerp(target.current, k);
    look.current.lerp(target.current.set(...sample.look), k);
    camera.lookAt(look.current);
  });

  return null;
}

/** Everything that moves with the scroll shift: core, rings, and the network. */
function World({ live, graph, config, reduce }) {
  const shiftRef = useRef(null);
  const spinRef = useRef(null);
  const coreRef = useRef(null);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    shiftRef.current.position.set(live.shift[0], live.shift[1], 0);
    // The core recedes in the chart formations and swells for the finale.
    const level = live.core;
    coreRef.current.scale.setScalar(level < 1 ? 0.45 + 0.55 * level : 1 + (level - 1) * 0.1);
    if (!reduce) {
      spinRef.current.rotation.y += delta * 0.07 * live.spin;
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
        <Rings reduce={reduce} />
      </group>
    </group>
  );
}

function Core({ live, segments }) {
  const shell = useRef(null);
  const wire = useRef(null);
  const light = useRef(null);
  const parts = useDisposable(
    () => ({
      sphere: new SphereGeometry(0.78, segments, Math.round(segments * 0.75)),
      metal: new MeshPhysicalMaterial({
        color: "#0c1430",
        metalness: 1,
        roughness: 0.16,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        emissive: new Color("#1d2c8a"),
        emissiveIntensity: 0.55,
        envMapIntensity: 1.6,
      }),
      rimGeometry: new SphereGeometry(0.84, segments, Math.round(segments * 0.75)),
      rim: createFresnelMaterial({ inner: "#4f8cff", outer: "#9be8ff", power: 2.2, intensity: 1.2 }),
      lattice: new IcosahedronGeometry(1.08, 1),
      latticeMaterial: new MeshBasicMaterial({ color: "#5ad7f2", wireframe: true, ...additive, opacity: 0.32 }),
      plane: new PlaneGeometry(1, 1),
      glow: createGlowMaterial("#5a8dff"),
      glowInner: createGlowMaterial("#a5f0ff"),
    }),
    [segments],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const pulse = 1 + Math.sin(live.time * 1.3) * 0.035;
    const level = live.core;
    shell.current.scale.setScalar(pulse * (0.9 + level * 0.1));
    wire.current.rotation.y -= delta * 0.18;
    wire.current.rotation.z += delta * 0.07;
    parts.glow.uniforms.uSize.value = 5.4 + level * 1.6;
    parts.glow.uniforms.uIntensity.value = 0.32 * level;
    parts.glowInner.uniforms.uSize.value = 2.1 * pulse;
    parts.glowInner.uniforms.uIntensity.value = 0.5 * level;
    parts.rim.uniforms.uIntensity.value = 0.7 + level * 0.6;
    parts.latticeMaterial.opacity = 0.14 + level * 0.18;
    light.current.intensity = 14 + level * 16;
  });

  return (
    <group>
      <group ref={shell}>
        <mesh geometry={parts.sphere} material={parts.metal} />
        <mesh geometry={parts.rimGeometry} material={parts.rim} />
      </group>
      <mesh ref={wire} geometry={parts.lattice} material={parts.latticeMaterial} />
      <mesh geometry={parts.plane} material={parts.glow} renderOrder={2} />
      <mesh geometry={parts.plane} material={parts.glowInner} renderOrder={3} />
      <pointLight ref={light} color="#5ad7f2" intensity={22} distance={16} decay={1.6} />
    </group>
  );
}

const RINGS = [
  { radius: 1.55, tube: 0.006, tilt: [1.2, 0.2, 0], speed: 0.22, color: "#5ad7f2", beads: 3 },
  { radius: 2.05, tube: 0.022, tilt: [1.7, -0.5, 0.3], speed: -0.14, color: "metal", beads: 0 },
  { radius: 2.7, tube: 0.005, tilt: [0.5, 0.9, -0.2], speed: 0.1, color: "#8b84ff", beads: 4 },
];

function Rings({ reduce }) {
  const refs = useRef([]);
  const parts = useDisposable(
    () => ({
      thin: RINGS.map((ring) => new TorusGeometry(ring.radius, ring.tube, 8, 160)),
      metal: new MeshStandardMaterial({ color: "#aab8ff", metalness: 1, roughness: 0.22, envMapIntensity: 1.8 }),
      cyan: new MeshBasicMaterial({ color: new Color("#5ad7f2").multiplyScalar(1.6), ...additive, opacity: 0.7 }),
      violet: new MeshBasicMaterial({ color: new Color("#8b84ff").multiplyScalar(1.6), ...additive, opacity: 0.6 }),
      bead: new SphereGeometry(0.035, 10, 8),
      beadMaterial: new MeshBasicMaterial({ color: new Color("#dff6ff").multiplyScalar(2) }),
    }),
    [],
  );
  const materialFor = (color) => (color === "metal" ? parts.metal : color === "#5ad7f2" ? parts.cyan : parts.violet);

  useFrame((_, rawDelta) => {
    if (reduce) return;
    const delta = Math.min(rawDelta, 0.1);
    refs.current.forEach((ring, index) => {
      if (ring) ring.rotation.z += delta * RINGS[index].speed;
    });
  });

  return RINGS.map((ring, index) => (
    <group key={ring.radius} rotation={ring.tilt} scale={1}>
      <group ref={(node) => (refs.current[index] = node)}>
        <mesh geometry={parts.thin[index]} material={materialFor(ring.color)} />
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

function quadratic(out, a, c, b, t) {
  const u = 1 - t;
  out[0] = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0];
  out[1] = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
  out[2] = u * u * a[2] + 2 * u * t * c[2] + t * t * b[2];
  return out;
}

/** Instanced nodes, additive halos, energy edges, flow particles and analytics columns. */
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

    const edges = new BufferGeometry();
    const vertices = count * SEGMENTS * 2;
    const t = new Float32Array(vertices);
    const seed = new Float32Array(vertices);
    for (let e = 0; e < count; e += 1) {
      const s = (e * 0.6180339) % 1;
      for (let k = 0; k < SEGMENTS; k += 1) {
        const v = (e * SEGMENTS + k) * 2;
        t[v] = k / SEGMENTS;
        t[v + 1] = (k + 1) / SEGMENTS;
        seed[v] = s;
        seed[v + 1] = s;
      }
    }
    edges.setAttribute("position", new BufferAttribute(new Float32Array(vertices * 3), 3));
    edges.setAttribute("aT", new BufferAttribute(t, 1));
    edges.setAttribute("aSeed", new BufferAttribute(seed, 1));
    edges.setAttribute("aHi", new BufferAttribute(new Float32Array(vertices), 1));

    const flows = new BufferGeometry();
    flows.setAttribute("position", new BufferAttribute(new Float32Array(flowCount * 3), 3));
    flows.setAttribute("aSize", new BufferAttribute(new Float32Array(flowCount).fill(0.32), 1));
    flows.setAttribute("aGlow", new BufferAttribute(new Float32Array(flowCount).fill(0.9), 1));
    const flowColors = new Float32Array(flowCount * 3);
    for (let i = 0; i < flowCount; i += 1) color.set(i % 3 ? "#9be8ff" : "#c7c4ff").toArray(flowColors, i * 3);
    flows.setAttribute("aColor", new BufferAttribute(flowColors, 3));

    const column = new BoxGeometry(1, 1, 1);
    column.translate(0, 0.5, 0);

    return {
      sphere: new SphereGeometry(1, config.segments / 2, config.segments / 3),
      hitSphere: new SphereGeometry(1, 8, 6),
      nodeMaterial: new MeshStandardMaterial({
        metalness: 0.55,
        roughness: 0.2,
        envMapIntensity: 1.4,
        emissive: new Color("#202a78"),
        emissiveIntensity: 0.7,
      }),
      hitMaterial: new MeshBasicMaterial({ visible: false }),
      halo,
      haloMaterial: createHaloMaterial(),
      edges,
      edgeMaterial: createEdgeMaterial(),
      flows,
      flowMaterial: createHaloMaterial(),
      column,
      columnMaterial: new MeshStandardMaterial({
        color: "#3a46b8",
        metalness: 0.75,
        roughness: 0.3,
        emissive: new Color("#3b3fd1"),
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.82,
        envMapIntensity: 1.2,
      }),
    };
  }, [count, flowCount]);

  const state = useMemo(
    () => ({
      current: Float32Array.from(layouts[0]),
      glow: new Float32Array(count).fill(0.6),
      edgeHi: new Float32Array(count),
      columns: 0,
      lineageFor: -2,
      lineage: new Set(),
      flowSeed: Float32Array.from({ length: flowCount }, (_, i) => (i * 0.37) % 1),
      flowSpeed: Float32Array.from({ length: flowCount }, (_, i) => 0.18 + ((i * 0.53) % 1) * 0.22),
    }),
    [layouts, count, flowCount],
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
    nodes.forEach((node, index) => {
      matrix.makeTranslation(layouts[2][index * 3], floor, layouts[2][index * 3 + 2]);
      columns.setMatrixAt(index, matrix);
      const t = Math.min(1, barHeights[index] / 2.8);
      columns.setColorAt(index, color.set("#4f6bff").lerp(new Color("#5ad7f2"), t));
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
      p: [0, 0, 0],
      q: [0, 0, 0],
      project: new Vector3(),
    }),
    [],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const { current, glow, edgeHi } = state;
    const { matrix, quaternion, position, scale, color, white, a, b, c, p, q } = scratch;
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
      const k = reduce ? 1 : 1 - Math.exp(-delta * nodes[i].speed);
      for (let axis = 0; axis < 3; axis += 1) {
        const j = i * 3 + axis;
        current[j] += (A[j] + (B[j] - A[j]) * f - current[j]) * k;
      }
      const inLineage = state.lineage.has(i);
      const targetGlow = 0.6 + (inLineage ? 0.75 : 0) + (i === hovered.current ? 1.1 : 0) + (i === selected ? 0.5 : 0);
      glow[i] += (targetGlow - glow[i]) * glowK;
      const parent = nodes[i].parent;
      const lit = inLineage && (parent < 0 || state.lineage.has(parent)) && selected >= 0 ? 1 : 0;
      edgeHi[i] += (lit - edgeHi[i]) * glowK;
    }

    // Nodes, hit targets and halos.
    const mesh = meshRef.current;
    const hit = hitRef.current;
    const haloPosition = parts.halo.attributes.position.array;
    const haloGlow = parts.halo.attributes.aGlow.array;
    for (let i = 0; i < count; i += 1) {
      position.fromArray(current, i * 3);
      const s = nodes[i].size * (1 + (glow[i] - 0.6) * 0.32);
      matrix.compose(position, quaternion, scale.setScalar(s));
      mesh.setMatrixAt(i, matrix);
      matrix.compose(position, quaternion, scale.setScalar(Math.max(0.3, nodes[i].size * 2.6)));
      hit.setMatrixAt(i, matrix);
      mesh.setColorAt(i, color.set(nodes[i].color).lerp(white, Math.min(0.6, (glow[i] - 0.6) * 0.35)));
      haloPosition[i * 3] = current[i * 3];
      haloPosition[i * 3 + 1] = current[i * 3 + 1];
      haloPosition[i * 3 + 2] = current[i * 3 + 2];
      haloGlow[i] = glow[i];
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    hit.instanceMatrix.needsUpdate = true;
    parts.halo.attributes.position.needsUpdate = true;
    parts.halo.attributes.aGlow.needsUpdate = true;

    // Curved edges, re-sampled from live node positions so they follow every morph.
    const edgePosition = parts.edges.attributes.position.array;
    const edgeHiAttr = parts.edges.attributes.aHi.array;
    for (let e = 0; e < count; e += 1) {
      const parent = nodes[e].parent;
      if (parent >= 0) {
        a[0] = current[parent * 3];
        a[1] = current[parent * 3 + 1];
        a[2] = current[parent * 3 + 2];
      } else {
        a[0] = a[1] = a[2] = 0;
      }
      b[0] = current[e * 3];
      b[1] = current[e * 3 + 1];
      b[2] = current[e * 3 + 2];
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      const mz = (a[2] + b[2]) / 2;
      const bend = 1 + 0.16 * Math.min(1, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 3);
      c[0] = mx * bend;
      c[1] = my * bend + 0.12;
      c[2] = mz * bend;
      quadratic(p, a, c, b, 0);
      for (let k = 0; k < SEGMENTS; k += 1) {
        quadratic(q, a, c, b, (k + 1) / SEGMENTS);
        const v = (e * SEGMENTS + k) * 6;
        edgePosition[v] = p[0];
        edgePosition[v + 1] = p[1];
        edgePosition[v + 2] = p[2];
        edgePosition[v + 3] = q[0];
        edgePosition[v + 4] = q[1];
        edgePosition[v + 5] = q[2];
        edgeHiAttr[(e * SEGMENTS + k) * 2] = edgeHi[e];
        edgeHiAttr[(e * SEGMENTS + k) * 2 + 1] = edgeHi[e];
        p[0] = q[0];
        p[1] = q[1];
        p[2] = q[2];
      }
    }
    parts.edges.attributes.position.needsUpdate = true;
    parts.edges.attributes.aHi.needsUpdate = true;
    parts.edgeMaterial.uniforms.uTime.value = live.time;
    parts.edgeMaterial.uniforms.uOpacity.value = live.lines;

    // Particles riding the edges from parent to child; lit edges carry brighter, larger ones.
    const flowPosition = parts.flows.attributes.position.array;
    const flowGlow = parts.flows.attributes.aGlow.array;
    for (let i = 0; i < flowCount; i += 1) {
      const e = i % count;
      const t = (live.time * state.flowSpeed[i] + state.flowSeed[i]) % 1;
      const start = (e * SEGMENTS + Math.min(SEGMENTS - 1, Math.floor(t * SEGMENTS))) * 6;
      const local = t * SEGMENTS - Math.floor(t * SEGMENTS);
      flowPosition[i * 3] = edgePosition[start] + (edgePosition[start + 3] - edgePosition[start]) * local;
      flowPosition[i * 3 + 1] = edgePosition[start + 1] + (edgePosition[start + 4] - edgePosition[start + 1]) * local;
      flowPosition[i * 3 + 2] = edgePosition[start + 2] + (edgePosition[start + 5] - edgePosition[start + 2]) * local;
      flowGlow[i] = (0.55 + edgeHi[e] * 1.2) * Math.sin(t * Math.PI);
    }
    parts.flows.attributes.position.needsUpdate = true;
    parts.flows.attributes.aGlow.needsUpdate = true;
    parts.flowMaterial.uniforms.uOpacity.value = live.lines;

    const projection = (gl.getPixelRatio() * size.height) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    parts.haloMaterial.uniforms.uScale.value = projection;
    parts.flowMaterial.uniforms.uScale.value = projection;

    // Analytics columns rise out of the floor when the formation turns into a chart.
    state.columns += (live.columns - state.columns) * (reduce ? 1 : 1 - Math.exp(-delta * 2));
    const columns = columnsRef.current;
    columns.visible = state.columns > 0.01;
    if (columns.visible) {
      for (let i = 0; i < count; i += 1) {
        const rise = Math.min(1, Math.max(0, state.columns * 1.4 - (i / count) * 0.4));
        position.set(layouts[2][i * 3], floor, layouts[2][i * 3 + 2]);
        matrix.compose(position, quaternion, scale.set(0.4, Math.max(0.001, barHeights[i] * rise), 0.4));
        columns.setMatrixAt(i, matrix);
      }
      columns.instanceMatrix.needsUpdate = true;
      parts.columnMaterial.opacity = 0.82 * state.columns;
    }

    // Keep the DOM info panel pinned beside the selected node.
    const panel = stage.panelEl;
    if (panel) {
      if (selected >= 0) {
        const projected = scratch.project.fromArray(current, selected * 3).applyMatrix4(groupRef.current.matrixWorld).project(camera);
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
      <lineSegments geometry={parts.edges} material={parts.edgeMaterial} frustumCulled={false} renderOrder={1} />
      <points geometry={parts.flows} material={parts.flowMaterial} frustumCulled={false} renderOrder={5} />
      <instancedMesh ref={columnsRef} args={[parts.column, parts.columnMaterial, count]} frustumCulled={false} visible={false} />
    </group>
  );
}

const FLOATERS = [
  { kind: "crystal", position: [8.6, 3.6, -4], scale: 0.8, speed: 0.5 },
  { kind: "metal", position: [9.4, -2.8, -2], scale: 0.42, speed: 0.7 },
  { kind: "cube", position: [-9.6, -4.4, -7], scale: 0.7, speed: 0.45 },
  { kind: "ico", position: [-1.5, 5.6, -10], scale: 0.7, speed: 0.4 },
  { kind: "metal", position: [-13, 4.2, -14], scale: 0.8, speed: 0.35 },
  { kind: "crystal", position: [14, -0.5, -14], scale: 1.2, speed: 0.3 },
];

/** Glass crystals and chrome spheres on separate depth layers, breathing slowly. */
function Floaters({ count, live, reduce }) {
  const refs = useRef([]);
  const parts = useDisposable(() => {
    const crystal = new OctahedronGeometry(1, 0);
    const cube = new BoxGeometry(1.2, 1.2, 1.2);
    const ico = new DodecahedronGeometry(1, 0);
    return {
      crystal,
      cube,
      ico,
      metalGeometry: new SphereGeometry(1, 40, 28),
      crystalEdges: new EdgesGeometry(crystal),
      cubeEdges: new EdgesGeometry(cube),
      icoEdges: new EdgesGeometry(ico),
      glass: new MeshPhysicalMaterial({
        color: "#9fb2ff",
        metalness: 0.1,
        roughness: 0.06,
        transparent: true,
        opacity: 0.26,
        clearcoat: 1,
        iridescence: 0.9,
        iridescenceIOR: 1.35,
        envMapIntensity: 2.2,
        depthWrite: false,
      }),
      edge: new LineBasicMaterial({ color: new Color("#b9b5ff").multiplyScalar(1.4), ...additive, opacity: 0.55 }),
      metal: new MeshStandardMaterial({ color: "#cfd8ff", metalness: 1, roughness: 0.12, envMapIntensity: 1.8 }),
    };
  }, []);
  const items = FLOATERS.slice(0, count);

  useFrame((_, rawDelta) => {
    if (reduce) return;
    const delta = Math.min(rawDelta, 0.1);
    items.forEach((item, index) => {
      const node = refs.current[index];
      if (!node) return;
      node.position.y = item.position[1] + Math.sin(live.time * item.speed + index * 1.7) * 0.28;
      node.rotation.x += delta * item.speed * 0.25;
      node.rotation.y += delta * item.speed * 0.35;
      node.scale.setScalar(item.scale * (1 + Math.sin(live.time * item.speed * 1.4 + index) * 0.03));
    });
  });

  return items.map((item, index) => {
    const geometry = item.kind === "cube" ? parts.cube : item.kind === "ico" ? parts.ico : parts.crystal;
    const edges = item.kind === "cube" ? parts.cubeEdges : item.kind === "ico" ? parts.icoEdges : parts.crystalEdges;
    return (
      <group key={index} ref={(node) => (refs.current[index] = node)} position={item.position} scale={item.scale}>
        {item.kind === "metal" ? (
          <mesh geometry={parts.metalGeometry} material={parts.metal} />
        ) : (
          <>
            <mesh geometry={geometry} material={parts.glass} />
            <lineSegments geometry={edges} material={parts.edge} />
          </>
        )}
      </group>
    );
  });
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
