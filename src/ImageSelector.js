import React, { useState, useEffect, useRef } from 'react';
import { useReload } from './customHooks';

function createTexture(gl, img) {
  if (!gl || !img || !img.src)
    return null;

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE7);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  gl.generateMipmap(gl.TEXTURE_2D);

  return texture;
}

function ImageSelector({ gl, texture, setName, setTexture, deleteTexture }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const [reloaded, reload] = useReload();

  function loadImage() {
    const file = inputRef.current.files[0];

    const reader = new FileReader();
    reader.onloadend = () => {
      setFile(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    } else {
      setFile('');
    }
  }

  useEffect(() => {
      const newTexture = createTexture(gl, imageRef.current);
      setTexture(texture.id, newTexture);
      return () => gl.deleteTexture(newTexture);
    },
  [gl, reloaded]);

  const img = file
    ? <img ref={imageRef} src={file} onLoad={reload} />
    : <img className="default-img" src='https://media.sproutsocial.com/uploads/2017/02/10x-featured-social-media-image-size.png' />;

  return (
    <div className='image-selector'>
      <div className='image-preview'>
        <label>
          <input ref={inputRef} id={'image-selector-input-' + texture.id} type='file' accept='image/*'
                 onChange={loadImage} style={{ 'display': 'none' }} />
          {img}
        </label>
      </div>
      <div className='image-settings'>
        <input className='name-image-input' type='text' onChange={(e) => {
          setName(texture.id, e.target.value);
        }} value={texture.name} />
        <button className='delete-image-button' onClick={() => deleteTexture(texture.id)}>Remove</button>
      </div>
    </div>
  );
}

export default ImageSelector;
