#version 300 es
precision mediump float;

in vec2 v_uv;

uniform float u_time;
uniform vec2 u_resolution;

out vec4 outColor;

void main() {
    vec2 uv = v_uv - 0.5;
    float len = length(uv);
    float glow = exp(-len * 10.0) * (0.8 + 0.2 * sin(u_time * 5.0));
    vec3 color = vec3(1.0, 0.8, 0.5) * glow;
    outColor = vec4(color, 1.0);
}
