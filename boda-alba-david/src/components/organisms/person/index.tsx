import { useRef } from "react";

export default function Person({ args, position }) {
  const ref = useRef(null)

  return (
    <mesh
      ref={ref}
      position={position || [0, 0, 0]}
    >
      <boxGeometry args={args || [.2, .2, .2]} />
      <meshStandardMaterial color={'orange'} />
    </mesh>
  )
}
