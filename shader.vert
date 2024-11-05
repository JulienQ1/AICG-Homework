#version 300 es
precision mediump float;

in vec3 a_position; // Vertex position
in vec2 a_uv;       // Texture coordinates

uniform mat4 u_projection; // Projection matrix
uniform mat4 u_view;       // View matrix
uniform mat4 u_model;      // Model matrix

out vec2 v_uv;

void main() {
    // Apply model, view, and projection transformations
    gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
    v_uv = a_uv;
}
