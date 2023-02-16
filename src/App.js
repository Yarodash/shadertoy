import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import './App.css';
import { defaultFragmentShaderSourceHeader, defaultVertexShaderSource, defaultFragmentShaderSource } from './defaultShaders';
import WebGLCanvas from './Canvas';
import ImageSelectorList from './ImageSelectorList';
import FragmentShaderInput from './FragmentShaderInput';
import { ErrorShow } from './ErrorShow';
import { createShader, createProgram, bindTexture } from './webgl-scripts';

function useShaderProgram() {
  const [gl, setgl] = useState(null);
  const [vertexSource, setVertexSource] = useState(defaultVertexShaderSource);
  const [fragmentSourceFooter, setFragmentSourceFooter] = useState(defaultFragmentShaderSource);
  const [fragmentSource, setFragmentSource] = useState(defaultFragmentShaderSource + fragmentSourceFooter);
  const [vertexShader, setVertexShader] = useState(null);
  const [fragmentShader, setFragmentShader] = useState(null);
  const [shaderProgram, setShaderProgram] = useState(null);
  const [textures, setTextures] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFragmentSource(
      defaultFragmentShaderSourceHeader
      + textures.map(texture => 'uniform sampler2D ' + texture.name + ';').join('\n')
      + '\n' + fragmentSourceFooter
    );
  }, [fragmentSourceFooter, textures]);

  useEffect(() => {
    if (gl) {
      const newVertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
      setVertexShader(newVertexShader);
      return () => { gl.deleteShader(newVertexShader); }
    }
  }, [gl, vertexSource]);

  useEffect(() => {
    if (gl) {
      const newFragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource, setError);
      setFragmentShader(newFragmentShader);
      return () => gl.deleteShader(newFragmentShader);
    }
  }, [gl, fragmentSource]);

  useEffect(() => {
    if (gl && vertexShader && fragmentShader) {
      const program = createProgram(gl, vertexShader, fragmentShader);

      gl.useProgram(program);

      const vertex_buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);

      const vertices = [-1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,  1.0, -1.0, 1.0];
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

      const vertexPositionAttribute = gl.getAttribLocation(program, "aPos");
      gl.enableVertexAttribArray(vertexPositionAttribute);
      gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 2 * 4, 0);

      setShaderProgram(program);

      return () => gl.deleteProgram(program);
    }
  }, [gl, vertexShader, fragmentShader]);

  return {gl, setgl, fragmentSourceFooter, setFragmentSourceFooter, shaderProgram, textures, setTextures, error};
}

function draw(gl, shaderProgram, timestamp, cursor) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.cullFace(gl.FRONT_AND_BACK);

  gl.uniform1f(gl.getUniformLocation(shaderProgram, 'uTime'), timestamp / 1000);
  gl.uniform2f(gl.getUniformLocation(shaderProgram, 'uMouse'), cursor.x, cursor.y);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
}

function drawOnRequestAnimationFrame(glGetter, shaderProgramGetter, cursorGetter) {
  const step = (timestamp) => {
    const gl = glGetter();
    const shaderProgram = shaderProgramGetter();
    const cursor = cursorGetter();

    gl && shaderProgram && draw(gl, shaderProgram, timestamp, cursor);
    window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

function createGetterSetter(init) {
  let value = init;
  const get = () => { return value; }
  const set = (newValue) => { value = newValue; }
  return [get, set];
}

function useDraw(gl, shaderProgram, cursor) {
  const [getgl, setgl] = useMemo(() => createGetterSetter(null), []);
  const [getShaderProgram, setShaderProgram] = useMemo(() => createGetterSetter(null), []);
  const [getCursor, setCursor] = useMemo(() => createGetterSetter(null), []);

  useEffect(() => setgl(gl), [gl]);
  useEffect(() => setShaderProgram(shaderProgram), [shaderProgram]);
  useEffect(() => setCursor(cursor), [cursor]);

  useEffect(() => {
    drawOnRequestAnimationFrame(getgl, getShaderProgram, getCursor);
  }, []);
}

function App() {
  const {gl, setgl, fragmentSourceFooter, setFragmentSourceFooter, shaderProgram, textures, setTextures, error} = useShaderProgram();
  const [cursor, setCursor] = useState({x: 0, y: 0})
  useDraw(gl, shaderProgram, cursor);

  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.body.className = theme + ' theme-change';
    const timeout = setTimeout(() => {
      document.body.className = theme
    }, 500);
    return () => clearTimeout(timeout);
  }, [theme]);

  useEffect(() => {
    gl && shaderProgram &&
    textures.forEach(texture => bindTexture(gl, shaderProgram, texture.texture, texture.name, texture.slot));
  }, [gl, shaderProgram, textures])

  return (
  <div className='app'>
    <div className='canvas-and-shader'>
      <ErrorShow error={error}/>
      <WebGLCanvas setgl={setgl} setCursor={setCursor}/>
      <FragmentShaderInput fragment={fragmentSourceFooter} setFragment={setFragmentSourceFooter}/>
    </div>
    <ImageSelectorList gl={gl} textures={textures} setTextures={setTextures}/>
    <button onClick={() => setTheme(theme==="light" ?"dark": "light")}>change theme</button>
  </div>);
}


export default App;
