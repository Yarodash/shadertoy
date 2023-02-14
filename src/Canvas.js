import React, { useState, useEffect, useContext, useRef } from 'react';
import {initWebGL} from './webgl-scripts';

function WebGLCanvas({ setgl }) {
  const [canvasRef, setCanvasRef] = useState(null);

  useEffect(() => {
    if (!canvasRef) return;
    setgl(initWebGL(canvasRef));
  }, 
  [canvasRef, setgl]);

  return (
    <div className='canvas'>
      <canvas ref={setCanvasRef} width={720} height={720}>
        Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
      </canvas>
    </div>
  );
}

export default WebGLCanvas;
