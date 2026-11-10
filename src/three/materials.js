import * as THREE from 'three'

// Metal usinado: MeshPhysicalMaterial + ranhuras de torno procedurais (perturbação da normal
// ao longo do perfil do anel, com atenuação por derivada para não gerar aliasing à distância).
export function machinedMaterial({ freq = 150, amp = 0.5, top = 0.25, ...params }) {
  const mat = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.2, envMapIntensity: 1.25, ...params })
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uFreq = { value: freq }
    sh.uniforms.uAmp = { value: amp }
    sh.uniforms.uTop = { value: top }
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float aS;\nattribute vec3 aTan;\nvarying float vS;\nvarying vec3 vTanV;\nvarying float vSide;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvS = aS;\nvTanV = normalMatrix * aTan;\nvSide = abs(aTan.y);')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uFreq;\nuniform float uAmp;\nuniform float uTop;\nvarying float vS;\nvarying vec3 vTanV;\nvarying float vSide;')
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        {
          float ph = vS * uFreq;
          float fade = 1.0 - smoothstep(0.7, 2.4, fwidth(ph));
          float g = cos(ph) * uAmp * fade * mix(uTop, 1.0, smoothstep(0.3, 0.9, vSide));
          normal = normalize(normal + normalize(vTanV) * g);
        }`,
      )
  }
  mat.customProgramCacheKey = () => 'machined'
  return mat
}

const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`

// Núcleo líquido: esfera deformada por ruído, com normais recalculadas no vertex shader.
export function liquidMaterial(params) {
  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.12 } }
  const mat = new THREE.MeshPhysicalMaterial({ metalness: 1, roughness: 0.12, envMapIntensity: 1.5, ...params })
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uniforms.uTime
    sh.uniforms.uAmp = uniforms.uAmp
    sh.vertexShader = sh.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uTime; uniform float uAmp;
        ${SNOISE}
        vec3 liquid(vec3 p){
          vec3 d = normalize(p);
          float n = snoise(d * 1.25 + uTime * 0.32) + 0.45 * snoise(d * 2.7 - uTime * 0.45);
          return p + d * n * uAmp;
        }`,
      )
      .replace(
        '#include <beginnormal_vertex>',
        `vec3 lt = normalize(cross(normal, vec3(0.0, 1.0, 0.0) + normal.zxy * 0.31));
        vec3 lb = normalize(cross(normal, lt));
        vec3 lp0 = liquid(position);
        vec3 lp1 = liquid(position + lt * 0.03);
        vec3 lp2 = liquid(position + lb * 0.03);
        vec3 objectNormal = normalize(cross(lp1 - lp0, lp2 - lp0));
        if (dot(objectNormal, normal) < 0.0) objectNormal = -objectNormal;`,
      )
      .replace('#include <begin_vertex>', 'vec3 transformed = lp0;')
  }
  mat.customProgramCacheKey = () => 'liquid'
  mat.userData.uniforms = uniforms
  return mat
}
