import { useQuery } from "@tanstack/react-query";
import * as esbuild from "esbuild-wasm";
import { useRef } from "react";
import invariant from "tiny-invariant";

let initializedAttempt = false;

const esbuildPromise = esbuild.initialize({
  wasmURL: "https://unpkg.com/esbuild-wasm@0.14.50/esbuild.wasm",
});

export function useEsbuild(
  input: Parameters<typeof esbuild.transform>[0],
  options: Parameters<typeof esbuild.transform>[1]
) {
  let prev = useRef<esbuild.TransformResult | null>(null);
  return useQuery(
    [
      "esbuild-source-code",
      { input, options, initialized: initializedAttempt },
    ],
    async ({ queryKey }) => {
      const options = queryKey[1];
      invariant(typeof options !== "string");
      if (!initializedAttempt) {
        initializedAttempt = true;
        await esbuildPromise;
      }
      try {
        const result = await esbuild.transform(options.input, options.options);
        prev.current = result;
        return result;
      } catch (e) {
        return prev.current;
      }
    }
  );
}
