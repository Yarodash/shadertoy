import React, { useRef } from 'react';
import ImageSelector from './ImageSelector';

function ImageSelectorList({ gl, textures, setTextures }) {
  const id = useRef(0);

  function addNewTexture() {
    setTextures(textures => {
      const slots = textures.map(item => item.slot);
      const slots_available = [0, ...slots].filter(slot => !slots.includes(slot + 1)).map(slot => slot + 1);
      const smallest_empty_slot = Math.min(slots_available);

      return [...textures,
        { id: id.current++, texture: null, slot: smallest_empty_slot, name: 'tex' + smallest_empty_slot }
      ];
    });
  }

  function setName(id, name) {
    setTextures(textures =>
      textures.map(texture => texture.id === id ? { ...texture, name } : texture)
    );
  }

  function setTexture(id, newTexture) {
    setTextures(textures =>
      textures.map(texture => texture.id === id ? { ...texture, texture: newTexture } : texture)
    );
  }

  function deleteTexture(id) {
    setTextures(textures => textures.filter(texture => texture.id !== id));
  }

  const image_selectors_rendered = textures.map(texture =>
    <ImageSelector
      key={texture.id}
      gl={gl}
      texture={texture}
      setTexture={setTexture}
      setName={setName}
      deleteTexture={deleteTexture}
      id={texture.id}
    />
  );

  return <div className='image-selector-list'>
    {image_selectors_rendered}
    <button className='new-texture' onClick={addNewTexture}></button>
  </div>;
}

export default ImageSelectorList;
