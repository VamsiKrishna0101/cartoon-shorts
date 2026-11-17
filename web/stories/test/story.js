import * as THREE from "three";
import { bodyFront, PARENT, KID } from "../../toon.js";
export default {
  frames: 60,
  async build(E) {
    const root = new THREE.Group(); E.scene.add(root);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), E.toon("#ffffff", E.PAINT.sand()));
    E.PAINT.sand().repeat.set(40, 40); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
    for (let i = 0; i < 6; i++) E.cyl(root, 0.35, 0.4, 5, E.toon("#ffffff", E.PAINT.marble()), -6 + i * 2.4, 0, -4);
    E.tbox(root, 12.8, 0.8, 1.4, E.toon("#ffffff", E.PAINT.marble()), 0, 5, -4);
    E.tbox(root, 3, 2.5, 3, E.toon("#ffffff", E.PAINT.stone()), 5, 0, 3);
  },
  frame(E, f) {
    E.applyLight("day", E.V(0, 0, 0));
    E.setCam(E.camFromKeys([{ f: 0, pos: [0, 1.6, 7], look: [0, 1.3, 0], fov: 40 }, { f: 59, pos: [2, 2, 6], look: [0, 1.2, 0], fov: 36 }], f));
    E.card({ id: "a", key: "a" + (f % 20 < 10), draw: (p) => bodyFront(p, PARENT, { expr: "grin", mode: "stand", seed: 3 }), x: -0.7, z: 0 });
    E.card({ id: "b", key: "b", draw: (p) => bodyFront(p, KID, { expr: "shock", mode: "stand", seed: 7 }), x: 0.8, z: 0.3 });
  },
};
