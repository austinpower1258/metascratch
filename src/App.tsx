import { Stage, Layer, Rect, Circle } from "react-konva";
import { LiveObject } from "@liveblocks/client";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Obj from "./components/Obj";
import { RoomProvider } from "./lib/liveblocks";
import { useObject } from "./lib/liveblocks";

const Metaverse = () => {
  const [isDragging, setIsDragging] = useState(false);
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const objectPosition = useObject("objectPosition");
  if (!objectPosition) return null;

  function setPosition(position: number[]) {
    if (!objectPosition) return;
    objectPosition.update({
      x: position[0],
      y: position[1],
      z: position[2],
    });
  }

  const arrayObjectPosition = Object.values(objectPosition.toObject());

  return (
    <Canvas style={{ background: "white" }} shadows dpr={[1, 2]}>
      <ambientLight intensity={1} />
      <directionalLight
        intensity={1}
        castShadow
        shadow-mapSize-height={512}
        shadow-mapSize-width={512}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.1, 0]}
        receiveShadow
      >
        <planeBufferGeometry attach="geometry" args={[0, 0]} />
        <meshPhongMaterial
          attach="material"
          color="#ccc"
          side={THREE.DoubleSide}
        />
      </mesh>

      <planeHelper args={[floorPlane]} />
      <gridHelper args={[200, 40]} />

      <Obj
        setIsDragging={setIsDragging}
        floorPlane={floorPlane}
        position={arrayObjectPosition}
        setPosition={setPosition}
      />

      <OrthographicCamera makeDefault zoom={50} position={[0, 40, 200]} />
      <OrbitControls minZoom={10} maxZoom={50} enabled={!isDragging} />
    </Canvas>
  );
};

function Editor() {
  if (typeof window === "undefined") return null;
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect width={50} height={50} fill="red" />
        <Circle x={200} y={200} stroke="black" radius={50} />
      </Layer>
    </Stage>
  );
}

function App() {
  return (
    <RoomProvider
      id="my-room-id"
      initialStorage={{
        objectPosition: new LiveObject({ x: 0, y: 1, z: 0 }),
      }}
    >
      <div className="flex h-full">
        {/* <div className="border-gray-200 border-r" style={{ width: "50%" }}>
          <Editor />
        </div> */}
        <Metaverse />
      </div>
    </RoomProvider>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
