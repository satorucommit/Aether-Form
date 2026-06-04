uniform float uTime;
uniform vec2 uCursor;
uniform vec3 uColorBg;
uniform vec3 uColorGlass;
uniform vec3 uColorAccent;
uniform vec3 uColorFlash;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

// High quality procedural 2D noise for glass distortion
float hash(vec2 p) {
  p = 50.0 * fract(p * 0.3183099 + vec2(0.71, 0.113));
  return -1.0 + 2.0 * fract(p.x * p.y * (p.x + p.y));
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);

  // Fresnel calculation: intensity is higher at glancing angles
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.5);

  // Procedural refraction offset based on simplex vertex noise and uv coordinates
  vec2 refractOffset = normal.xy * (0.07 + 0.05 * vNoise);

  // Chromatic Aberration: different indexes of refraction for R, G, B
  float rNoise = noise(vUv * 12.0 + refractOffset * 1.5 + uTime * 0.2);
  float gNoise = noise(vUv * 12.0 + refractOffset * 1.0 + uTime * 0.2 + 0.1);
  float bNoise = noise(vUv * 12.0 + refractOffset * 0.5 + uTime * 0.2 + 0.2);

  // Construct RGB channels using the noise refraction offsets
  float r = mix(0.1, 0.9, rNoise);
  float g = mix(0.1, 0.9, gNoise);
  float b = mix(0.1, 0.9, bNoise);

  // Refracted interior color
  vec3 glassInterior = vec3(r, g, b);
  
  // Blend interior glass refraction with obsidian dark surface
  vec3 baseColor = mix(uColorGlass, glassInterior * 0.25, 0.6);

  // Add specular highlights (phong specular approximation)
  vec3 lightDir = normalize(vec3(1.0, 1.0, 2.0));
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);
  vec3 specular = vec3(spec) * uColorAccent;

  // Add neon crimson flash on the fresnel edge
  vec3 rimColor = mix(uColorAccent, uColorFlash, fresnel * 0.7);

  // Combine components: base obsidian glass, specular reflections, and animated fresnel rim
  vec3 finalColor = baseColor + specular + rimColor * fresnel * 1.2;

  // Set transparency for glass glassmorphic overlay look
  float opacity = mix(0.85, 0.95, fresnel);

  gl_FragColor = vec4(finalColor, opacity);
}
