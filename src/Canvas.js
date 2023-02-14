import React, { useState, useEffect, useContext, useRef } from 'react';
import {initWebGL} from './webgl-scripts';

function WebGLCanvas({ setgl, setCursor }) {
  const [canvasRef, setCanvasRef] = useState(null);

  useEffect(() => {
    if (!canvasRef) return;
    setgl(initWebGL(canvasRef));
  }, 
  [canvasRef, setgl]);

  function handleMouseMove(event) {
    if (event.buttons == 1) {
      var rect = event.target.getBoundingClientRect();
      setCursor({
        x: (event.clientX - rect.left) / rect.width, 
        y: (event.clientY - rect.top) / rect.height
      });
    }
  }

  return (
    <div className='canvas'>
      <canvas ref={setCanvasRef} width={720} height={720}
        onMouseMove={handleMouseMove}>
        Your browser doesn't appear to support the HTML5 <code>&lt;canvas&gt;</code> element.
      </canvas>
    </div>
  );
}

export default WebGLCanvas;
