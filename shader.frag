#version 300 es
precision mediump float;

uniform vec2 u_resolution;
out vec4 fragColor;

void main() {
    // Normalize coordinates and scale to create a tiled effect
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv *= vec2(4.0, 3.0); // Repeat pattern in both x and y directions

    // Create a grid by using the fractional part of the UV coordinates
    vec2 gridUV = fract(uv);

    // Center the coordinates within each cell
    vec2 centeredUV = gridUV - 0.5;

    // Calculate polar coordinates for the star shape
    float angle = atan(centeredUV.y, centeredUV.x);
    float radius = length(centeredUV);
    float star = cos(5.0 * angle) * 0.5 + 0.5;

    // Mask to create the star in white
    float mask = smoothstep(0.4, 0.5, star * radius);

    // Set colors: white for the star and black for the background
    vec3 starColor = vec3(1.0);        // White star color
    vec3 backgroundColor = vec3(0.0);  // Black background

    // Mix colors to display the star
    vec3 color = mix(backgroundColor, starColor, mask);

    fragColor = vec4(color, 1.0);
}
