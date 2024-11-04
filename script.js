// Basic setup
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = []; // Array to store star positions and brightness
let constellations = []; // Array to store constellation lines

// Initialize stars with random positions and brightness
for (let i = 0; i < 50; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        brightness: Math.random()
    });
}

// WebGL shader setup for ray marching
const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec3 u_stars[50];

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec3 color = vec3(0.0);
        
        // Simulate star brightness with simple ray marching
        for (int i = 0; i < 50; i++) {
            vec2 starPos = u_stars[i].xy;
            float brightness = u_stars[i].z;
            float dist = length(uv - starPos / u_resolution);
            color += vec3(1.0, 1.0, 1.0) * brightness / (dist * dist);
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;

// Utility functions for compiling shaders and creating WebGL program
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
}

// Compile shaders and create program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

// Send star data to fragment shader
const starLocations = stars.flatMap(star => [star.x, star.y, star.brightness]);
const uStarsLocation = gl.getUniformLocation(program, 'u_stars');
gl.uniform3fv(uStarsLocation, new Float32Array(starLocations));

// Mouse click event for linking stars
canvas.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    const nearestStar = findNearestStar(x, y);
    if (nearestStar) {
        constellations.push(nearestStar);
    }
    if (constellations.length > 1) {
        drawConstellation();
    }
});

// Function to find the nearest star
function findNearestStar(x, y) {
    let minDist = Infinity;
    let nearest = null;
    stars.forEach(star => {
        const dist = Math.hypot(star.x - x, star.y - y);
        if (dist < minDist) {
            minDist = dist;
            nearest = star;
        }
    });
    return nearest;
}

// Draw constellation lines
function drawConstellation() {
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    constellations.forEach((star, index) => {
        if (index === 0) {
            ctx.moveTo(star.x, star.y);
        } else {
            ctx.lineTo(star.x, star.y);
        }
    });
    ctx.stroke();
}

// Main render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

// Start rendering
render();
