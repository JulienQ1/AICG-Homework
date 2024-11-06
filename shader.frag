#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_starPositions[10];   // Array for up to 10 stars
uniform float u_starSizes[10];      // Array for star sizes
uniform int u_glowingStars[10];     // Array to track which stars should glow

out vec4 outColor;

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution;
    vec3 color = vec3(0.0);

    // Loop through each star
    for (int i = 0; i < 10; i++) {
        vec2 pos = u_starPositions[i] / u_resolution; // Convert to screen space
        float size = u_starSizes[i];

        // Calculate distance to the star position
        float dist = length(st - pos);

        // Check if this star should glow
        if (u_glowingStars[i] == 1) {
            // Create a diamond-like shape with glow effect
            vec2 d = abs(st - pos);
            float diamondShape = max(d.x, d.y) / size;

            // Adjust for sharpness and color gradient for a gem-like effect
            float starCore = smoothstep(0.3, 0.4, diamondShape);    // Inner core
            float starOutline = smoothstep(0.4, 0.6, diamondShape); // Outer outline

            vec3 coreColor = vec3(0.6, 0.8, 1.0);  // Light blue core
            vec3 outlineColor = vec3(1.0, 0.7, 1.0); // Soft pink outline

            // Blend colors between the core and outline for the glowing star
            color += mix(outlineColor, coreColor, starCore) * (1.0 - starOutline);
        } else {
            // Render non-glowing stars as small white points
            if (dist < size * 0.3) {
                color += vec3(1.0); // White color for non-glowing stars
            }
        }
    }

    outColor = vec4(color, 1.0);
}

