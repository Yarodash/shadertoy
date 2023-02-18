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

function ThemeSwitch({ theme, setTheme }) {
  const sun = <svg width="24" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.59942 0.5C7.98609 0.5 8.29955 0.813457 8.29955 1.20013V1.90025C8.29955 2.28692 7.98609 2.60038 7.59942 2.60038C7.21275 2.60038 6.89929 2.28692 6.89929 1.90025V1.20013C6.89929 0.813457 7.21275 0.5 7.59942 0.5ZM7.603 10.3023C9.14968 10.3023 10.4035 9.04846 10.4035 7.50178C10.4035 5.95511 9.14968 4.70128 7.603 4.70128C6.05631 4.70128 4.80248 5.95511 4.80248 7.50178C4.80248 9.04846 6.05631 10.3023 7.603 10.3023ZM11.8038 7.50178C11.8038 9.8218 9.92302 11.7025 7.603 11.7025C5.28297 11.7025 3.40222 9.8218 3.40222 7.50178C3.40222 5.18177 5.28297 3.30103 7.603 3.30103C9.92302 3.30103 11.8038 5.18177 11.8038 7.50178ZM8.29955 13.102C8.29955 12.7153 7.98609 12.4019 7.59942 12.4019C7.21275 12.4019 6.89929 12.7153 6.89929 13.102V13.7999C6.89929 14.1865 7.21275 14.5 7.59942 14.5C7.98609 14.5 8.29955 14.1865 8.29955 13.7999V13.102ZM2.64997 2.54937C2.92339 2.27595 3.36669 2.27595 3.64011 2.54937L4.24535 3.15461C4.51876 3.42803 4.51876 3.87132 4.24535 4.14474C3.97193 4.41815 3.52863 4.41815 3.25521 4.14474L2.64997 3.5395C2.37656 3.26608 2.37656 2.82279 2.64997 2.54937ZM11.9492 10.8599C11.6758 10.5865 11.2325 10.5865 10.9591 10.8599C10.6857 11.1333 10.6856 11.5766 10.9591 11.85L11.5596 12.4506C11.833 12.724 12.2763 12.7241 12.5498 12.4506C12.8232 12.1772 12.8232 11.7339 12.5498 11.4605L11.9492 10.8599ZM0.599976 7.49934C0.599976 7.11267 0.913434 6.79921 1.3001 6.79921H2.00023C2.3869 6.79921 2.70036 7.11267 2.70036 7.49934C2.70036 7.88601 2.3869 8.19946 2.00023 8.19946H1.3001C0.913434 8.19946 0.599976 7.88601 0.599976 7.49934ZM13.2017 6.79921C12.815 6.79921 12.5016 7.11267 12.5016 7.49934C12.5016 7.88601 12.815 8.19946 13.2017 8.19946H13.8996C14.2863 8.19946 14.5997 7.88601 14.5997 7.49934C14.5997 7.11267 14.2863 6.79921 13.8996 6.79921H13.2017ZM2.64983 12.45C2.37641 12.1766 2.37641 11.7333 2.64983 11.4599L3.25259 10.8571C3.52601 10.5837 3.96931 10.5837 4.24273 10.8571C4.51614 11.1305 4.51614 11.5738 4.24273 11.8472L3.63996 12.45C3.36655 12.7234 2.92325 12.7234 2.64983 12.45ZM10.9543 3.15541C10.6809 3.42882 10.6808 3.87212 10.9543 4.14554C11.2277 4.41896 11.671 4.41897 11.9444 4.14556L12.5497 3.5403C12.8231 3.26689 12.8231 2.8236 12.5497 2.55017C12.2763 2.27675 11.833 2.27675 11.5596 2.55016L10.9543 3.15541Z" fill="#999999"></path></svg>;
  const moon = <svg width="24" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.9999 6.95045C10.9124 7.89813 10.5567 8.80127 9.97457 9.55419C9.39244 10.3071 8.60792 10.8787 7.7128 11.202C6.81769 11.5253 5.849 11.587 4.9201 11.3799C3.99119 11.1728 3.14049 10.7054 2.46752 10.0324C1.79455 9.35945 1.32716 8.50875 1.12004 7.57984C0.912916 6.65094 0.974625 5.68225 1.29795 4.78714C1.62127 3.89202 2.19283 3.1075 2.94575 2.52537C3.69867 1.94324 4.60181 1.58758 5.54949 1.5C4.99465 2.25063 4.72766 3.17547 4.79708 4.10631C4.86649 5.03716 5.2677 5.91217 5.92774 6.5722C6.58777 7.23224 7.46278 7.63345 8.39362 7.70286C9.32447 7.77228 10.2493 7.50529 10.9999 6.95045Z" stroke="#999999" stroke-width="1.0" stroke-linecap="round" stroke-linejoin="round"></path></svg>;
  
  return <div className='theme' 
    onClick={() => setTheme(theme === "light" ? "dark": "light")}>
    {sun}
    {moon}
    <div className='current-theme' style={{left: theme === 'light' ? '3px' : '33px'}}></div>
  </div>
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
  }, [gl, shaderProgram, textures]);

  return (
  <div className='app'>
    <div className='canvas-and-shader'>
      <ErrorShow error={error}/>
      <WebGLCanvas setgl={setgl} setCursor={setCursor}/>
      <FragmentShaderInput fragment={fragmentSourceFooter} setFragment={setFragmentSourceFooter}/>
    </div>
    <ImageSelectorList gl={gl} textures={textures} setTextures={setTextures}/>
    <ThemeSwitch theme={theme} setTheme={setTheme}/>
  </div>);
}


export default App;
