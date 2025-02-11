import * as THREE from "three";
import * as Handshake from "@funtech-inc/handshake";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

const Scene = () => {
   // const momo = useVideoTexture(
   //    "https://player.vimeo.com/progressive_redirect/playback/996469408/rendition/1080p/file.mp4?loc=external&log_user=0&signature=d3caef5daa7dfd5d0f8d973632cf013a4bab227ba02d7bde631d17ec515c21c8"
   // );
   const [momo] = useTexture(["/momo.jpg"]);
   const material = useRef<THREE.ShaderMaterial>(null);
   const fitScale = useRef(new THREE.Vector2(1));
   const progress = useRef(1);
   const scrollProgress = useRef(1);

   const { size } = useThree();
   const aspectRatio = size.width / size.height;
   fitScale.current.set(
      Math.min(aspectRatio / 1.846, 1),
      Math.min(1.846 / aspectRatio, 1)
   );

   useFrame(() => {
      progress.current = THREE.MathUtils.lerp(
         progress.current,
         scrollProgress.current,
         0.1
      );
      if (material.current)
         material.current.uniforms.progress.value = progress.current;
   });

   useEffect(() => {
      const handshake = new Handshake.Child({
         url: "https://lime573060.studio.site/",
      });
      handshake.ready(({ on }) =>
         on("scroll", (data) => {
            scrollProgress.current = 1 - data;
         })
      );
      return () => handshake.revert();
   }, []);

   return (
      <>
         <mesh>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
               ref={material}
               uniforms={useMemo(
                  () => ({
                     momo: { value: momo },
                     fitscale: { value: fitScale.current },
                     progress: { value: progress.current },
                  }),
                  [momo]
               )}
               vertexShader={`
						varying vec2 vUv;
						void main() {
							vUv = uv;
							gl_Position = vec4(position, 1.0);
						}
					`}
               fragmentShader={`
						uniform sampler2D momo;
						uniform vec2 fitscale;
						uniform float progress;
						varying vec2 vUv;
						void main() {
							vec2 uv = vUv * fitscale + (1.0 - fitscale) / 2.0;
							gl_FragColor = texture2D(momo,vec2(uv.x < progress ? progress : uv.x , uv.y));
						}
					`}
            />
         </mesh>
      </>
   );
};

function App() {
   return (
      <div style={{ width: "100vw", height: "100vh" }}>
         <Canvas>
            <Scene />
         </Canvas>
      </div>
   );
}

export default App;
