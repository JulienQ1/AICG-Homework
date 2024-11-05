// Set up WebGL context
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    alert("WebGL 2 is required for this application.");
}

// Vertex Shader Source Code
const vertShaderSource = `#version 300 es
in vec3 a_position;
uniform mat4 u_projection;
uniform mat4 u_view;
void main() {
    gl_Position = u_projection * u_view * vec4(a_position, 1.0);
    gl_PointSize = 5.0;
}`;

// Fragment Shader Source Code
const fragShaderSource = `#version 300 es
precision mediump float;
out vec4 fragColor;
void main() {
    fragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color for stars
}`;

// Compile shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Link program
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// Define Primogem star shape points for a 3D cube
const starPositions = [];
for (let i = 0; i < 50; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 0.5 + 0.5;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const z = (Math.random() - 0.5) * 2.0;
    starPositions.push(x, y, z);
}

// Initialize shaders and program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

// Set up position buffer
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(starPositions), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

// Set up uniforms for projection and view matrices
const u_projection = gl.getUniformLocation(program, "u_projection");
const u_view = gl.getUniformLocation(program, "u_view");

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Set up perspective projection matrix
const aspect = canvas.clientWidth / canvas.clientHeight;
const fov = Math.PI / 4;
const near = 0.1;
const far = 10.0;
const projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, fov, aspect, near, far);

// Animation loop
function render(time) {
    resizeCanvas();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Rotate the view matrix over time
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [Math.sin(time * 0.001) * 2, 1.5, Math.cos(time * 0.001) * 2], [0, 0, 0], [0, 1, 0]);

    gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
    gl.uniformMatrix4fv(u_view, false, viewMatrix);

    gl.drawArrays(gl.POINTS, 0, starPositions.length / 3);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
