import React, { useState } from 'react';

function FragmentShaderInput({ fragment, setFragment }) {
  const [fragmentSource, setFragmentSource] = useState(fragment);

  function updateFragment() {
    setFragment(fragmentSource)
  }
  
  return (<div className='shader'>
    <div className='source'>
      <textarea className='fragment-input' type="text"
          onChange={(e) => setFragmentSource(e.target.value)}
          value={fragmentSource}/>
    </div>
    <div className='update'>
      <button onClick={updateFragment}>Update fragment shader</button>
    </div>
  </div>)
}

export default FragmentShaderInput;
