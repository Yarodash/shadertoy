export function initWebGL(canvas) {
  let gl = null;

  try {
    gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
  }
  catch(e) {}

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }

  gl && gl.viewport(0, 0, canvas.width, canvas.height);

  return gl;
}

export function createShader(gl, type, source, setError) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    setError && setError(gl.getShaderInfoLog(shader));
    return null;
  }
  setError && setError(null);

  return shader;
}

export function createProgram(gl, vertexShader, fragmentShader) {
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
    return null;
  }

  return shaderProgram;
}

export function attachImageToTexture(gl, texture, img) {
  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.generateMipmap(gl.TEXTURE_2D);
}

export function bindTexture(gl, shaderProgram, texture, name, slot) {
  gl.activeTexture(gl.TEXTURE0 + slot);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  const textureLocation = gl.getUniformLocation(shaderProgram, name);
  textureLocation && gl.uniform1i(textureLocation, slot);
}
