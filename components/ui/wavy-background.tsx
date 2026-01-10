"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Zoom factor for the visual pattern.
const ZOOM_FACTOR = 0.3;

// Base wave amplitude in domain warping.
const BASE_WAVE_AMPLITUDE = 0.2;

// Additional factor for random amplitude variations.
const RANDOM_WAVE_FACTOR = 0.15;

// Frequency multiplier for wave domain warp.
const WAVE_FREQUENCY = 4.0;

// Time speed factor (overall speed of animation).
const TIME_FACTOR = 0.25;

// Swirl strength near the center.
const BASE_SWIRL_STRENGTH = 1.2;

// Finer swirl timing factor.
const SWIRL_TIME_MULT = 5.0;

// Additional swirl effect modulated by noise.
const NOISE_SWIRL_FACTOR = 0.2;

// Number of fractal noise octaves in fbm (must be integer).
// Reduced from 10 to 4 for better performance while maintaining visual quality
const FBM_OCTAVES = 4;

// Light mode: verde agua tipo calipso más fuerte y visible
const lightSeaColors = [
  [0.85, 0.95, 0.92], // Gris pastel con toque verde
  [0.8, 0.92, 0.9],   // Gris pastel verde claro
  [0.75, 0.9, 0.88],  // Transición a verde agua
  [0.7, 0.88, 0.86],  // Verde agua muy claro
  [0.65, 0.86, 0.84], // Verde agua claro
  [0.6, 0.84, 0.82],  // Verde agua medio-claro
  [0.55, 0.82, 0.8],  // Verde agua medio
  [0.5, 0.8, 0.78],   // Verde agua (calipso)
  [0.45, 0.78, 0.76], // Verde agua más saturado
  [0.4, 0.76, 0.74],  // Verde agua saturado
  [0.35, 0.74, 0.72], // Verde agua más fuerte
  [0.3, 0.72, 0.7],   // Verde agua fuerte
  [0.25, 0.7, 0.68],  // Verde agua muy fuerte
  [0.2, 0.68, 0.66],  // Verde agua intenso
  [0.15, 0.66, 0.64], // Verde agua muy intenso
  [0.1, 0.64, 0.62],  // Verde agua máximo
  [0.08, 0.62, 0.6],  // Verde agua máximo+
  [0.05, 0.6, 0.58],  // Verde agua máximo++
  [0.03, 0.58, 0.56], // Verde agua máximo+++
  [0.0, 0.56, 0.54]   // Verde agua máximo++++
];

// Dark mode: darker teal palette
const darkSeaColors = [
  [0.0, 0.05, 0.08],
  [0.0, 0.08, 0.12],
  [0.0, 0.12, 0.18],
  [0.0, 0.16, 0.24],
  [0.0, 0.2, 0.3],
  [0.0, 0.24, 0.36],
  [0.0, 0.28, 0.42],
  [0.0, 0.32, 0.48],
  [0.0, 0.36, 0.54],
  [0.02, 0.4, 0.58],
  [0.04, 0.44, 0.62],
  [0.06, 0.48, 0.66],
  [0.08, 0.52, 0.7],
  [0.1, 0.56, 0.74],
  [0.12, 0.6, 0.78],
  [0.14, 0.64, 0.82],
  [0.16, 0.68, 0.86],
  [0.18, 0.72, 0.9],
  [0.2, 0.76, 0.94],
  [0.22, 0.8, 0.98]
];

////////////////////////////////////////////////////////////////////////////////
// DYNAMIC FRAGMENT SHADER BUILDER
////////////////////////////////////////////////////////////////////////////////

function buildFragmentShader(isDark: boolean): string {
  const fbmOctavesInt = Math.floor(FBM_OCTAVES);
  const colors = isDark ? darkSeaColors : lightSeaColors;
  const colorArraySrc = colors.map((c) => `vec3(${c[0]}, ${c[1]}, ${c[2]})`).join(",\n  ");

  return `#version 300 es

precision highp float;
out vec4 outColor;

uniform vec2 uResolution;
uniform float uTime;

#define NUM_COLORS 20

vec3 seaColors[NUM_COLORS] = vec3[](
  ${colorArraySrc}
);

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float noise2D(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );

  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);

  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) +
    i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
    0.5 - vec3(
      dot(x0, x0),
      dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)
    ),
    0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

  m *= 1.792843 - 0.853734 * (a0 * a0 + h * h);

  vec3 g;
  g.x  = a0.x  * x0.x + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;

  return 130.0 * dot(m, g);
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float freq = 1.0;
  for (int i = 0; i < ${fbmOctavesInt}; i++) {
    value += amplitude * noise2D(st * freq);
    freq *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  uv *= float(${ZOOM_FACTOR});

  float t = uTime * float(${TIME_FACTOR});

  float waveAmp = float(${BASE_WAVE_AMPLITUDE}) + float(${RANDOM_WAVE_FACTOR})
                  * noise2D(vec2(t, 27.7));

  float waveX = waveAmp * sin(uv.y * float(${WAVE_FREQUENCY}) + t);
  float waveY = waveAmp * sin(uv.x * float(${WAVE_FREQUENCY}) - t);
  uv.x += waveX;
  uv.y += waveY;

  float r = length(uv);
  float angle = atan(uv.y, uv.x);
  float swirlStrength = float(${BASE_SWIRL_STRENGTH})
                        * (1.0 - smoothstep(0.0, 1.0, r));

  angle += swirlStrength * sin(uTime + r * float(${SWIRL_TIME_MULT}));
  uv = vec2(cos(angle), sin(angle)) * r;

  float n = fbm(uv);

  float swirlEffect = float(${NOISE_SWIRL_FACTOR})
                      * sin(t + n * 3.0);
  n += swirlEffect;

  float noiseVal = 0.5 * (n + 1.0);

  float idx = clamp(noiseVal, 0.0, 1.0) * float(NUM_COLORS - 1);
  int iLow = int(floor(idx));
  int iHigh = int(min(float(iLow + 1), float(NUM_COLORS - 1)));
  float f = fract(idx);

  vec3 colLow = seaColors[iLow];
  vec3 colHigh = seaColors[iHigh];
  vec3 color = mix(colLow, colHigh, f);

  // Transparency for lightest colors in light mode, darkest in dark mode
  if (${isDark ? 'iLow == 0 && iHigh == 0' : 'iLow >= NUM_COLORS - 2 && iHigh >= NUM_COLORS - 1'}) {
    outColor = vec4(color, 0.0);
  } else {
    outColor = vec4(color, ${isDark ? '0.5' : '0.65'});
  }
}
`;
}

////////////////////////////////////////////////////////////////////////////////
// STATIC VERTEX SHADER
////////////////////////////////////////////////////////////////////////////////
const vertexShaderSource = `#version 300 es
precision mediump float;

in vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

////////////////////////////////////////////////////////////////////////////////
// SHADER COMPILATION UTIL
////////////////////////////////////////////////////////////////////////////////
function createShaderProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram | null {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  if (!vertexShader) return null;

  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
    return null;
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!fragmentShader) {
    gl.deleteShader(vertexShader);
    return null;
  }

  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Fragment shader error:", gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Could not link WebGL program:", gl.getProgramInfoLog(program));
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

////////////////////////////////////////////////////////////////////////////////
// MAIN REACT COMPONENT
////////////////////////////////////////////////////////////////////////////////
export default function WavyBackground({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = React.useMemo(() => mounted && resolvedTheme === "dark", [mounted, resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mounted) return;

    const fsSource = buildFragmentShader(isDark);

    const gl = canvas.getContext("webgl2", { alpha: true });
    if (!gl) {
      console.error("WebGL2 is not supported by your browser.");
      return;
    }

    // Clean up previous program if it exists
    if (programRef.current) {
      gl.deleteProgram(programRef.current);
      programRef.current = null;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    // Use container dimensions instead of window dimensions
    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    updateCanvasSize();

    const program = createShaderProgram(gl, vertexShaderSource, fsSource);
    if (!program) {
      console.error("Failed to create shader program.");
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

    const aPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPositionLoc);
    gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    const uResolutionLoc = gl.getUniformLocation(program, "uResolution");
    const uTimeLoc = gl.getUniformLocation(program, "uTime");

    let startTime = performance.now();
    let animationFrameId: number | null = null;
    let isVisible = true;
    let lastResizeTime = 0;
    const RESIZE_DEBOUNCE_MS = 150;

    // Use IntersectionObserver to pause animation when not visible
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animationFrameId) {
          render();
        }
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    function render() {
      if (!isVisible) {
        animationFrameId = null;
        return;
      }

      const currentTime = performance.now();
      const elapsed = (currentTime - startTime) * 0.001;

      // Update canvas size based on container (debounced)
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      } else {
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        }
      }

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);

      if (programRef.current) {
        gl.useProgram(programRef.current);
        gl.bindVertexArray(vao);

        gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
        gl.uniform1f(uTimeLoc, elapsed);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    }

    // Use requestIdleCallback to defer initial render if browser is busy
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (isVisible) {
          render();
        }
      }, { timeout: 1000 });
    } else {
      render();
    }

    const handleResize = () => {
      const now = performance.now();
      if (now - lastResizeTime < RESIZE_DEBOUNCE_MS) {
        return;
      }
      lastResizeTime = now;

      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    
    // Use ResizeObserver for container size changes
    const containerElement = canvas.parentElement;
    let resizeObserver: ResizeObserver | null = null;
    if (containerElement && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(containerElement);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (resizeObserver && containerElement) {
        resizeObserver.unobserve(containerElement);
      }
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
        programRef.current = null;
      }
      if (vbo) gl.deleteBuffer(vbo);
      if (vao) gl.deleteVertexArray(vao);
    };
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <div className={cn("relative w-full h-full overflow-hidden", className)}>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full" 
        style={{ background: "transparent" }} 
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

