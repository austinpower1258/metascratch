import { javascript } from "@codemirror/lang-javascript";
import { ViewUpdate } from "@codemirror/view";
import { LiveObject } from "@liveblocks/client";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import CodeMirror from "@uiw/react-codemirror";
import * as esbuild from "esbuild-wasm";
import { useCallback, useEffect, useState } from "react";
//import { Circle, Layer, Rect, Stage } from "react-konva";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as THREE from "three";
import invariant from "tiny-invariant";
import { uid } from "uid";
import { yCollab } from "y-codemirror.next";
import Home from "./components/Home";
import Obj from "./components/Obj";
import { RoomProvider, useObject } from "./lib/liveblocks";
import { yjs } from "./lib/store";

let initialized = false;

esbuild
  .initialize({
    wasmURL: "https://unpkg.com/esbuild-wasm@0.14.50/esbuild.wasm",
  })
  .then(() => {
    initialized = true;
  });

const queryClient = new QueryClient();

function useEsbuild(
  input: Parameters<typeof esbuild.transform>[0],
  options: Parameters<typeof esbuild.transform>[1]
) {
  // const [initialized, setInitialized] = useState(false);
  return useQuery(
    ["esbuild-source-code", { input, options, initialized }],
    async ({ queryKey }) => {
      const options = queryKey[1];
      invariant(typeof options !== "string");
      if (!initialized) {
        return null;
      }
      return esbuild.transform(options.input, options.options);
    }
  );
}

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

// function Editor() {
//   if (typeof window === "undefined") return null;
//   return (
//     <Stage width={window.innerWidth} height={window.innerHeight}>
//       <Layer>
//         <Rect width={50} height={50} fill="red" />
//         <Circle x={200} y={200} stroke="black" radius={50} />
//       </Layer>
//     </Stage>
//   );
// }

function App() {
  const { state, doc, store, provider, undoManager } = yjs.useStore();
  const transpiled = useEsbuild(state.sourceCode.toJSON(), { loader: "tsx" });
  const [width, setWidth] = useState(400);

  const onChange = useCallback((value: string, viewUpdate: ViewUpdate) => {
    // console.log("value:", value);
  }, []);

  useEffect(() => {
    if (provider) {
      provider.awareness.setLocalStateField(uid(), {
        name: "Anonymous " + Math.floor(Math.random() * 100),
      });
    }
  }, [provider]);
  if (!provider || !undoManager) {
    return null;
  }

  return (
    <div className="flex h-full">
      <div
        className="border-gray-200 border-r"
        style={{ width: width, maxWidth: width, minWidth: width }}
      >
        <CodeMirror
          value=""
          height="200px"
          className="text-xs"
          extensions={[
            javascript({ jsx: true, typescript: true }),
            yCollab(store.sourceCode as any, provider.awareness, {
              undoManager,
            }),
          ]}
          onChange={onChange}
        />
        <div className="text-xs">
          <div>output:</div>
          <pre>{transpiled.data?.code}</pre>
        </div>
        {/* <Editor /> */}
      </div>
      <Metaverse />
    </div>
  );
}

function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/app"
            element={
              <yjs.Provider roomId={"my-room-id"}>
                <RoomProvider
                  id="my-room-id"
                  initialStorage={{
                    objectPosition: new LiveObject({ x: 0, y: 1, z: 0 }),
                  }}
                >
                  <App />
                </RoomProvider>
              </yjs.Provider>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default Router;
