import { useRef } from "react";
import type { Mesh } from "three";
import type { ThreeElements } from "@react-three/fiber";

type PersonProps = {
  args?: [width?: number, height?: number, depth?: number];
  position?: ThreeElements["mesh"]["position"];
};

export default function Person({ args = [0.2, 0.2, 0.2], position = [0, 0, 0] }: PersonProps) {
  const ref = useRef<Mesh>(null);

  return (
    <mesh
      ref={ref}
      position={position}
    >
      <boxGeometry args={args} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}
