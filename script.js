async function readShader(id) {
  const req = await fetch(document.getElementById(id).src);
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

  console.error("Could not Link WebGL Program", gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

async function main() {
  const fps = document.getElementById("fps");

  const time = {
      current_t: Date.now(),
      dts: [1 / 60],
      t: 0,

      dt: () => time.dts[0],
      update: () => {
          const new_t = Date.now();
          time.dts = [(new_t - time.current_t) / 1_000, ...time.dts].slice(0, 10);
          time.t += time.dt();
          time.current_t = new_t;

          const dt = time.dts.reduce((a, dt) => a + dt, 0) / time.dts.length;
          fps.innerHTML = `${Math.round(1 / dt, 2)}`;
      },
  };

  // MODIFICATION : Ajout de deux contextes pour les canvas 2D et WebGL
  const canvas2d = document.getElementById("canvas2d");
  const ctx = canvas2d.getContext("2d");

  const canvas3d = document.getElementById("canvas3d");
  const gl = canvas3d.getContext("webgl2");
  if (!gl) alert("Could not initialize WebGL Context.");
  if (!ctx) console.error("Could not initialize 2D context for line drawing.");

  const vertShader = createShader(gl, gl.VERTEX_SHADER, await readShader("vert"));
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, await readShader("frag"));
  const program = createProgram(gl, vertShader, fragShader);

  const a_position = gl.getAttribLocation(program, "a_position");
  const a_uv = gl.getAttribLocation(program, "a_uv");

  const u_resolution = gl.getUniformLocation(program, "u_resolution");
  const u_glowingStars = gl.getUniformLocation(program, "u_glowingStars");

  // Star data
  const starCount = 10;
  const starPositions = new Float32Array(starCount * 2);
  const starSizes = new Float32Array(starCount);
  const glowingStars = new Array(starCount).fill(0); // 0 = not glowing, 1 = glowing

  function generateStarPositions() {
      for (let i = 0; i < starCount; i++) {
          starPositions[i * 2] = Math.random() * canvas3d.width;    // x position
          starPositions[i * 2 + 1] = Math.random() * canvas3d.height; // y position
          starSizes[i] = 0.02 + Math.random() * 0.03; // Slightly smaller size
      }
  }

  generateStarPositions();
  glowingStars[0] = 1;

  const u_starPositions = gl.getUniformLocation(program, "u_starPositions");
  const u_starSizes = gl.getUniformLocation(program, "u_starSizes");

  const data = new Float32Array([
      -1.0, -1.0,   0.0, 0.0,
       1.0, -1.0,   1.0, 0.0,
       1.0,  1.0,   1.0, 1.0,
      -1.0,  1.0,   0.0, 1.0,
  ]);

  const indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3,
  ]);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(a_position);
  gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 4 * 4, 0);
  gl.enableVertexAttribArray(a_uv);
  gl.vertexAttribPointer(a_uv, 2, gl.FLOAT, false, 4 * 4, 2 * 4);

  const ebo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);

  // MODIFICATION : Mise à jour de la taille des deux canvas
  function resizeCanvasToDisplaySize() {
      const displayWidth = canvas3d.clientWidth;
      const displayHeight = canvas3d.clientHeight;

      if (canvas3d.width !== displayWidth || canvas3d.height !== displayHeight) {
          canvas3d.width = displayWidth;
          canvas3d.height = displayHeight;
          canvas2d.width = displayWidth; // Mise à jour de la taille du canvas 2D
          canvas2d.height = displayHeight;
          generateStarPositions();
          gl.viewport(0, 0, canvas3d.width, canvas3d.height);
      }
  }

  // MODIFICATION : Utilisation de ctx pour dessiner les lignes sur le canvas 2D
  function drawLines() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;

    let lastGlowingIndex = -1;

    for (let i = 0; i < starCount; i++) {
        if (glowingStars[i] === 1) {
            if (lastGlowingIndex !== -1) {
                const x1 = starPositions[lastGlowingIndex * 2];
                const y1 = starPositions[lastGlowingIndex * 2 + 1];
                const x2 = starPositions[i * 2];
                const y2 = starPositions[i * 2 + 1];

                console.log(`Drawing line from (${x1}, ${y1}) to (${x2}, ${y2})`);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
            lastGlowingIndex = i;
        }
    }
}


  function loop() {
      resizeCanvasToDisplaySize();
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.bindVertexArray(vao);
      gl.useProgram(program);
      gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);

      gl.uniform2fv(u_starPositions, starPositions);
      gl.uniform1fv(u_starSizes, starSizes);
      gl.uniform1iv(u_glowingStars, glowingStars);

      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);

      time.update();
      drawLines();

      requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  canvas3d.addEventListener("click", () => {
      console.log("Canvas clicked.");
      let lastGlowingIndex = glowingStars.lastIndexOf(1); 
      let nearestStarIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < starCount; i++) {
          if (glowingStars[i] === 1 || i === lastGlowingIndex) continue;

          const starX = starPositions[i * 2];
          const starY = starPositions[i * 2 + 1];
          const glowX = starPositions[lastGlowingIndex * 2];
          const glowY = starPositions[lastGlowingIndex * 2 + 1];
          const dist = Math.sqrt((glowX - starX) ** 2 + (glowY - starY) ** 2);

          if (dist < minDistance) {
              minDistance = dist;
              nearestStarIndex = i;
          }
      }

      if (nearestStarIndex !== -1) {
          console.log(`Glowing new star at index: ${nearestStarIndex}`);
          glowingStars[nearestStarIndex] = 1;
      } else {
          console.log("No more stars to glow.");
      }
  });
}

main();
