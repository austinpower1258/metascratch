import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";

function Box(props: JSX.IntrinsicElements["mesh"]) {
  const mesh = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame((state, delta) => {
    mesh.current.rotation.x += 0.01;
    mesh.current.rotation.y += 0.01;
    mesh.current.rotation.z += 0.01;
  });

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

export default function Home() {
  return (
    <div className="flex h-full">
      <div className="flex flex-col items-center justify-center -mt-20">
        <div className="font-bold text-transparent font-weight-700 bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-6xl flex items-center justify-center px-20">
          metascratch
        </div>
        <Link
          to="/app"
          className="font-bold text-sm text-pink-50 mt-10 rounded-full bg-pink-600 px-4 py-2"
        >
          start making stuff →
        </Link>
      </div>
      <div className="bg-black grow flex items-center justify-center">
        <Canvas>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <Box position={[0, 0, 0]} />
        </Canvas>
      </div>
    </div>
  );
}
