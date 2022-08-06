import { javascript } from "@codemirror/lang-javascript";
import { ViewUpdate } from "@codemirror/view";
import { LiveObject } from "@liveblocks/client";
import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { QueryClientProvider } from "@tanstack/react-query";
import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
//import { Circle, Layer, Rect, Stage } from "react-konva";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import * as THREE from "three";
import { uid } from "uid";
import { yCollab } from "y-codemirror.next";
import Home from "./components/Home";
import Obj from "./components/Obj";
import { RoomProvider, useObject } from "./lib/liveblocks";
import { queryClient } from "./lib/react-query";
import { yjs } from "./lib/store";
import { useEsbuild } from "./lib/useEsbuild";
import * as React from "react";
// import { ErrorBoundary } from "@react-three/fiber/dist/declarations/src/core/utils";

const Metaverse = () => {
  const { ydoc, state } = yjs.useStore();
  // const _objectPosition = ydoc.getText("objectPosition");
  // const _objectPosition = ydoc.getArray<number>("objectPosition")
  const [isDragging, setIsDragging] = useState(false);
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const objectPosition = useObject("objectPosition");
  if (!objectPosition) return null;
  // state._testObjectPosition

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
        // setPosition={_setPosition}
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

function Cube(
  props: JSX.IntrinsicElements["mesh"] & {
    color?: string;
    boxGeometry?: [number, number, number];
  }
) {
  const mesh = useRef<THREE.Mesh>(null!);

  return (
    <mesh {...props} ref={mesh}>
      <boxGeometry args={props.boxGeometry ?? [1, 1, 1]} />
      <meshStandardMaterial color={props.color ?? "orange"} />
    </mesh>
  );
}
function Sphere(props: JSX.IntrinsicElements["mesh"] & { color?: string }) {
  const mesh = useRef<THREE.Mesh>(null!);

  return (
    <mesh {...props} ref={mesh}>
      <sphereGeometry args={[2, 32, 16]} />
      <meshStandardMaterial color={props.color ?? "orange"} />
    </mesh>
  );
}

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function CanvasPreview(props: { transpiled: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [root, setRoot] = useState<Root | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const _root = createRoot(rootRef.current);
    setRoot(_root);
  }, []);

  useEffect(() => {
    if (!root) return;
    // console.log(props.transpiled);

    const render = new Function(
      "React",
      "root",
      "Canvas",
      "Cube",
      "Sphere",
      "floorPlane",
      "OrbitControls",
      "OrthographicCamera",
      `const code = ${props.transpiled}; root.render(code)`
    );
    render(
      React,
      root,
      Canvas,
      Cube,
      Sphere,
      floorPlane,
      OrbitControls,
      OrthographicCamera
    );
  }, [props.transpiled, root]);

  return (
    // <Canvas>
    //   <ambientLight intensity={1} />
    //   <directionalLight
    //     intensity={1}
    //     castShadow
    //     shadow-mapSize-height={512}
    //     shadow-mapSize-width={512}
    //   />

    //   <planeHelper args={[floorPlane]} />
    //   <gridHelper args={[200, 40]} />
    //   {/* {props.transpiled} */}
    //   <OrthographicCamera makeDefault zoom={50} position={[0, 40, 200]} />
    //   <OrbitControls minZoom={10} maxZoom={50} />
    // </Canvas>
    <div className="w-full" ref={rootRef}></div>
  );
}
class ErrorBoundary extends React.Component {
  //@ts-ignore
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  //@ts-ignore
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }
  //@ts-ignore
  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, errorInfo);
    console.log(error);
  }

  render() {
    //@ts-ignore
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    //@ts-ignore
    return this.props.children;
  }
}

function App() {
  const { state, doc, store, provider, undoManager } = yjs.useStore();
  const transpiled = useEsbuild(state.sourceCode.toJSON(), { loader: "tsx" });
  const [width, setWidth] = useState(700);

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

  useEffect(() => {
    provider?.on("sync", () => {
      if (provider?.synced && !state.sourceCode.toJSON()) {
        // state.sourceCode.insert(0, "");
      }
    });
  }, [state, provider]);

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
          height="100%"
          className="text-xs h-full"
          extensions={[
            javascript({ jsx: true, typescript: true }),
            yCollab(store.sourceCode as any, provider.awareness, {
              undoManager,
            }),
          ]}
          onChange={onChange}
        />
        {/* <div className="text-xs">
          <div>output:</div>
          <pre>{transpiled.data?.code}</pre>
        </div> */}
        {/* <Editor /> */}
      </div>
      {/* <Metaverse /> */}
      {transpiled.data?.code && (
        <ErrorBoundary>
          <CanvasPreview transpiled={transpiled.data?.code} />
        </ErrorBoundary>
      )}
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
