import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from "three";
import { createEdgeMaterial, createGlowMaterial, createHaloMaterial } from "./materials";

const SEGMENTS = 16;
const COLORS = { self: "#d8bd83", verified: "#8b84ff", pending: "#5ad7f2" };

/** WebGL view of the sample genealogy. Selection and expansion are owned by the section. */
export default function NetworkTree3D({ people, layout, activeId, lineage, hoverId, labelsRef, reduce, onReady }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 36, position: [0, 0.4, 12.5], near: 0.1, far: 60 }}
      frameloop={reduce ? "demand" : "always"}
      onCreated={(state) => {
        state.gl.setClearColor(0x000000, 0);
        onReady?.(state);
      }}
    >
      <ambientLight intensity={0.4} color="#7183ff" />
      <directionalLight position={[-5, 6, 8]} intensity={1.4} color="#c3ccff" />
      <directionalLight position={[5, 2, -8]} intensity={2} color="#8b5cf6" />
      <pointLight position={[0, 1, 3]} intensity={10} color="#5ad7f2" distance={14} decay={1.6} />
      <TreeScene
        people={people}
        layout={layout}
        activeId={activeId}
        lineage={lineage}
        hoverId={hoverId}
        labelsRef={labelsRef}
        reduce={reduce}
      />
    </Canvas>
  );
}

function TreeScene({ people, layout, activeId, lineage, hoverId, labelsRef, reduce }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const groupRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const ringRefs = useRef(new Map());
  const pointer = useRef({ x: 0, y: 0 });

  const parts = useMemo(() => {
    const edgeCount = people.length;
    const edges = new BufferGeometry();
    const vertices = edgeCount * SEGMENTS * 2;
    const t = new Float32Array(vertices);
    const seed = new Float32Array(vertices);
    for (let e = 0; e < edgeCount; e += 1) {
      for (let k = 0; k < SEGMENTS; k += 1) {
        const v = (e * SEGMENTS + k) * 2;
        t[v] = k / SEGMENTS;
        t[v + 1] = (k + 1) / SEGMENTS;
        seed[v] = seed[v + 1] = (e * 0.318) % 1;
      }
    }
    edges.setAttribute("position", new BufferAttribute(new Float32Array(vertices * 3), 3));
    edges.setAttribute("aT", new BufferAttribute(t, 1));
    edges.setAttribute("aSeed", new BufferAttribute(seed, 1));
    edges.setAttribute("aHi", new BufferAttribute(new Float32Array(vertices), 1));

    const halos = new BufferGeometry();
    halos.setAttribute("position", new BufferAttribute(new Float32Array(edgeCount * 3), 3));
    halos.setAttribute("aSize", new BufferAttribute(Float32Array.from(people, (p) => (p.verification === "self" ? 2.6 : 1.7)), 1));
    halos.setAttribute("aGlow", new BufferAttribute(new Float32Array(edgeCount).fill(0.6), 1));
    const colors = new Float32Array(edgeCount * 3);
    const color = new Color();
    people.forEach((p, i) => color.set(COLORS[p.verification] ?? COLORS.verified).toArray(colors, i * 3));
    halos.setAttribute("aColor", new BufferAttribute(colors, 3));

    const flows = new BufferGeometry();
    flows.setAttribute("position", new BufferAttribute(new Float32Array(edgeCount * 2 * 3), 3));
    flows.setAttribute("aSize", new BufferAttribute(new Float32Array(edgeCount * 2).fill(0.4), 1));
    flows.setAttribute("aGlow", new BufferAttribute(new Float32Array(edgeCount * 2), 1));
    const flowColors = new Float32Array(edgeCount * 2 * 3);
    for (let i = 0; i < edgeCount * 2; i += 1) color.set("#bfefff").toArray(flowColors, i * 3);
    flows.setAttribute("aColor", new BufferAttribute(flowColors, 3));

    const glow = createGlowMaterial("#4f6bff");
    glow.uniforms.uSize.value = 11;
    glow.uniforms.uIntensity.value = 0.22;
    const edgeMaterial = createEdgeMaterial();
    edgeMaterial.uniforms.uFrom.value.set("#a5a0ff");
    return {
      edges,
      edgeMaterial,
      halos,
      haloMaterial: createHaloMaterial(),
      flows,
      flowMaterial: createHaloMaterial(),
      sphere: new SphereGeometry(1, 40, 28),
      ring: new TorusGeometry(1.55, 0.03, 8, 64),
      plane: new PlaneGeometry(1, 1),
      glow,
      materials: {
        self: new MeshPhysicalMaterial({ color: "#e6cf97", metalness: 0.45, roughness: 0.28, clearcoat: 1, emissive: new Color("#a07a2c"), emissiveIntensity: 0.75 }),
        verified: new MeshStandardMaterial({ color: "#8b84ff", metalness: 0.6, roughness: 0.22, emissive: new Color("#2a2a8a"), emissiveIntensity: 0.8 }),
        pending: new MeshPhysicalMaterial({ color: "#0b1230", metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.55, clearcoat: 1, emissive: new Color("#0e4b66"), emissiveIntensity: 0.6 }),
        ring: new MeshStandardMaterial({ color: "#5ad7f2", emissive: new Color("#5ad7f2"), emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.3 }),
      },
    };
  }, [people]);

  useEffect(
    () => () => {
      [parts.edges, parts.edgeMaterial, parts.halos, parts.haloMaterial, parts.flows, parts.flowMaterial, parts.sphere, parts.ring, parts.plane, parts.glow]
        .concat(Object.values(parts.materials))
        .forEach((item) => item.dispose());
    },
    [parts],
  );

  // Animated state per person: current position, visibility scale, glow and edge highlight.
  const motionState = useMemo(() => {
    const map = new Map();
    people.forEach((person) => {
      const entry = layout.get(person.id) ?? layout.get(person.parentId);
      map.set(person.id, { position: new Vector3(...(entry?.position ?? [0, 0, 0])), shown: 0, glow: 0.6, edge: 0 });
    });
    return map;
    // Positions are seeded once and animated from then on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [people]);

  useEffect(() => {
    const onMove = (event) => {
      if (event.pointerType !== "mouse") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    invalidate();
  }, [layout, activeId, hoverId, lineage, invalidate]);

  const scratch = useMemo(() => ({ target: new Vector3(), a: new Vector3(), b: new Vector3(), c: new Vector3(), p: new Vector3(), project: new Vector3() }), []);
  const clock = useRef(0);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    clock.current += reduce ? 0 : delta;
    const k = reduce ? 1 : 1 - Math.exp(-delta * 4.2);
    const { target, a, b, c, p, project } = scratch;

    if (!reduce) {
      groupRef.current.rotation.y = Math.sin(clock.current * 0.18) * 0.22 + pointer.current.x * 0.12;
      groupRef.current.rotation.x = -pointer.current.y * 0.05;
    }

    people.forEach((person) => {
      const state = motionState.get(person.id);
      const entry = layout.get(person.id);
      const visible = Boolean(entry);
      // Hidden children fold back into the nearest visible ancestor.
      let anchor = entry;
      let cursor = person.parentId;
      while (!anchor && cursor) {
        anchor = layout.get(cursor);
        cursor = people.find((item) => item.id === cursor)?.parentId;
      }
      target.set(...(anchor?.position ?? [0, 0, 0]));
      state.position.lerp(target, k);
      state.shown += ((visible ? 1 : 0) - state.shown) * k;
      const lit = lineage.has(person.id);
      const targetGlow = 0.55 + (lit ? 0.7 : 0) + (person.id === hoverId ? 0.8 : 0) + (person.id === activeId ? 0.5 : 0);
      state.glow += (targetGlow - state.glow) * k;
      const parentLit = person.parentId ? lineage.has(person.parentId) : false;
      state.edge += ((lit && parentLit ? 1 : 0) - state.edge) * k;

      const mesh = nodeRefs.current.get(person.id);
      if (mesh) {
        const base = person.verification === "self" ? 0.42 : person.depth === 0 ? 0.26 : 0.3;
        const pulse = person.id === activeId && !reduce ? 1 + Math.sin(clock.current * 3) * 0.05 : 1;
        mesh.position.copy(state.position);
        mesh.scale.setScalar(Math.max(0.0001, base * state.shown * (1 + (state.glow - 0.55) * 0.18) * pulse));
      }
      const ring = ringRefs.current.get(person.id);
      if (ring) {
        ring.position.copy(state.position);
        ring.scale.setScalar(Math.max(0.0001, 0.3 * state.shown));
        ring.rotation.z += reduce ? 0 : delta * 0.8;
      }
    });

    // Halos, edges and flow particles.
    const haloPosition = parts.halos.attributes.position.array;
    const haloGlow = parts.halos.attributes.aGlow.array;
    const edgePosition = parts.edges.attributes.position.array;
    const edgeHi = parts.edges.attributes.aHi.array;
    const flowPosition = parts.flows.attributes.position.array;
    const flowGlow = parts.flows.attributes.aGlow.array;
    people.forEach((person, index) => {
      const state = motionState.get(person.id);
      state.position.toArray(haloPosition, index * 3);
      haloGlow[index] = state.glow * state.shown;

      const parent = person.parentId ? motionState.get(person.parentId) : null;
      a.copy(parent ? parent.position : state.position);
      b.copy(state.position);
      c.set(b.x, (a.y + b.y) / 2 + 0.15, (a.z + b.z) / 2 + 0.6);
      const visibleEdge = parent ? Math.min(state.shown, parent.shown) : 0;
      for (let s = 0; s < SEGMENTS; s += 1) {
        for (let end = 0; end < 2; end += 1) {
          const t = (s + end) / SEGMENTS;
          const u = 1 - t;
          // Vertical S-curve: leave the parent straight down, arrive at the child from above.
          p.set(
            u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x,
            u * u * a.y + 2 * u * t * c.y + t * t * b.y,
            u * u * a.z + 2 * u * t * c.z + t * t * b.z,
          );
          const v = (index * SEGMENTS + s) * 2 + end;
          p.toArray(edgePosition, v * 3);
          edgeHi[v] = state.edge;
        }
      }
      for (let f = 0; f < 2; f += 1) {
        const i = index * 2 + f;
        const t = (clock.current * (0.22 + state.edge * 0.2) + f * 0.5 + index * 0.13) % 1;
        const segment = Math.min(SEGMENTS - 1, Math.floor(t * SEGMENTS));
        const local = t * SEGMENTS - segment;
        const v = (index * SEGMENTS + segment) * 2;
        for (let axis = 0; axis < 3; axis += 1) {
          flowPosition[i * 3 + axis] = edgePosition[v * 3 + axis] + (edgePosition[(v + 1) * 3 + axis] - edgePosition[v * 3 + axis]) * local;
        }
        flowGlow[i] = visibleEdge * (0.35 + state.edge * 1.1) * Math.sin(t * Math.PI) * (reduce ? 0 : 1);
      }

      // Pin the HTML label/button for this person to its node.
      const label = labelsRef.current?.get(person.id);
      if (label) {
        project.copy(state.position).applyMatrix4(groupRef.current.matrixWorld).project(camera);
        const x = (project.x * 0.5 + 0.5) * size.width;
        const y = (-project.y * 0.5 + 0.5) * size.height;
        label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        label.style.opacity = state.shown > 0.5 ? "1" : "0";
        label.style.visibility = state.shown > 0.05 ? "visible" : "hidden";
      }
    });
    parts.halos.attributes.position.needsUpdate = true;
    parts.halos.attributes.aGlow.needsUpdate = true;
    parts.edges.attributes.position.needsUpdate = true;
    parts.edges.attributes.aHi.needsUpdate = true;
    parts.flows.attributes.position.needsUpdate = true;
    parts.flows.attributes.aGlow.needsUpdate = true;
    parts.edgeMaterial.uniforms.uTime.value = clock.current;
    const projection = (gl.getPixelRatio() * size.height) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    parts.haloMaterial.uniforms.uScale.value = projection;
    parts.flowMaterial.uniforms.uScale.value = projection;

    // Frame the tree whatever its current width: fit the widest node horizontally and all levels vertically.
    const aspect = size.width / Math.max(1, size.height);
    const halfFov = Math.tan((camera.fov * Math.PI) / 360);
    let halfWidth = 0;
    layout.forEach((entry) => {
      halfWidth = Math.max(halfWidth, Math.abs(entry.position[0]));
    });
    const distance = Math.max((halfWidth + 1.1) / (halfFov * aspect), 3.9 / halfFov) + 0.6;
    camera.position.z += (distance - camera.position.z) * k;
    camera.lookAt(0, 0.1, 0);
  });

  const setRef = (map, id) => (node) => {
    if (node) map.current.set(id, node);
    else map.current.delete(id);
  };

  return (
    <group ref={groupRef}>
      <mesh geometry={parts.plane} material={parts.glow} position={[0, 0.2, -2]} />
      <lineSegments geometry={parts.edges} material={parts.edgeMaterial} frustumCulled={false} />
      {people.map((person) => (
        <mesh
          key={person.id}
          ref={setRef(nodeRefs, person.id)}
          geometry={parts.sphere}
          material={parts.materials[person.verification] ?? parts.materials.verified}
          scale={0.0001}
        />
      ))}
      {people
        .filter((person) => person.verification === "pending")
        .map((person) => (
          <mesh key={`ring-${person.id}`} ref={setRef(ringRefs, person.id)} geometry={parts.ring} material={parts.materials.ring} scale={0.0001} />
        ))}
      <points geometry={parts.halos} material={parts.haloMaterial} frustumCulled={false} />
      <points geometry={parts.flows} material={parts.flowMaterial} frustumCulled={false} />
    </group>
  );
}
