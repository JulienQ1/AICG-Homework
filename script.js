async function main() {
  const canvas = document.getElementById("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
      alert("WebGL 2 is not available.");
      return;
  }

  // Load shaders
  const vertShaderSource = await fetch('shader.star').then(res => res.text());
  const fragShaderSource = await fetch('shader.frag').then(res => res.text());

  // Compile shaders
  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

  // Link program
  const program = createProgram(gl, vertShader, fragShader);
  gl.useProgram(program);

  // Define star vertices and UVs
  const vertices = new Float32Array([
      // Positions        // UVs
      0.0,  0.5, 0.0,     0.5, 1.0,
     -0.5, -0.5, 0.0,     0.0, 0.0,
      0.5, -0.5, 0.0,     1.0, 0.0,
  ]);

  // Create buffer
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Get attribute locations
  const a_position = gl.getAttribLocation(program, "a_position");
  const a_uv = gl.getAttribLocation(program, "a_uv");

  // Enable attributes
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 5 * 4, 0);
  gl.enableVertexAttribArray(a_uv);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

  // Get uniform locations
  const u_projection = gl.getUniformLocation(program, "u_projection");
  const u_view = gl.getUniformLocation(program, "u_view");
  const u_model = gl.getUniformLocation(program, "u_model");
  const u_time = gl.getUniformLocation(program, "u_time");
  const u_resolution = gl.getUniformLocation(program, "u_resolution");

  // Set up matrices
  const projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);
  const viewMatrix = mat4.create();
  mat4.lookAt(viewMatrix, [0, 0, 3], [0, 0, 0], [0, 1, 0]);
  const modelMatrix = mat4.create();

  // Set uniform values
  gl.uniformMatrix4fv(u_projection, false, projectionMatrix);
  gl.uniformMatrix4fv(u_view, false, viewMatrix);
  gl.uniformMatrix4fv(u_model, false, modelMatrix);
  gl.uniform2f(u_resolution, canvas.width, canvas.height);

  // Animation loop
  function render(time) {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.uniform1f(u_time, time * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// Utility functions
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

function createProgram(gl, vertShader, fragShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
  }
  return program;
}

main();
