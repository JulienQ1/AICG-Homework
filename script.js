async function readShader(id) {
    const req = await fetch(id);
    return await req.text();
}

function createShader(gl, type, src) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;

    console.error("Could not compile WebGL Shader", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertShader, fragShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) return program;

    console.error("Could not link WebGL Program", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

async function main() {
    const fps = document.getElementById("fps");

    const canvas2d = document.getElementById("canvas2d");
    const ctx = canvas2d.getContext("2d");

    const canvas3d = document.getElementById("canvas3d");
    const gl = canvas3d.getContext("webgl2");
    if (!gl) alert("Could not initialize WebGL Context.");

    const vertShader = createShader(gl, gl.VERTEX_SHADER, await readShader("shader.vert"));
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, await readShader("shader.frag"));
    const program = createProgram(gl, vertShader, fragShader);

    const a_position = gl.getAttribLocation(program, "a_position");
    const u_resolution = gl.getUniformLocation(program, "u_resolution");

    gl.useProgram(program);

    const data = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
         1.0,  1.0,
        -1.0,  1.0,
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    function resizeCanvasToDisplaySize() {
        const displayWidth = canvas3d.clientWidth;
        const displayHeight = canvas3d.clientHeight;
        if (canvas3d.width !== displayWidth || canvas3d.height !== displayHeight) {
            canvas3d.width = displayWidth;
            canvas3d.height = displayHeight;
            gl.viewport(0, 0, canvas3d.width, canvas3d.height);
        }
    }

    function loop() {
        resizeCanvasToDisplaySize();
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindVertexArray(vao);
        gl.useProgram(program);
        gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.bindVertexArray(null);
        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

main();
