import React, { useState } from 'react';

// https://stackoverflow.com/questions/10456236/html-text-area-tab-support
function insertAtCursor (el, text) {
  text = text || '';
  if (document.selection) {
    // IE
    el.focus();
    var sel = document.selection.createRange();
    sel.text = text;
  } else if (el.selectionStart || el.selectionStart === 0) {
    // Others
    var startPos = el.selectionStart;
    var endPos = el.selectionEnd;
    el.value = el.value.substring(0, startPos) +
      text +
      el.value.substring(endPos, el.value.length);
    el.selectionStart = startPos + text.length;
    el.selectionEnd = startPos + text.length;
  } else {
    el.value += text;
  }
};

function FragmentShaderInput({ fragment, setFragment }) {
  const [fragmentSource, setFragmentSource] = useState(fragment);

  function updateFragment() {
    setFragment(fragmentSource)
  }

  function handleKeyDown(event) {
    if((event.ctrlKey || event.metaKey) && event.which === 83) {
      updateFragment();
      event.preventDefault();
    }

    if (event.which === 9) {
      insertAtCursor(event.target, '    ');
      event.preventDefault();
    }
  }

  return (<div className='shader'>
    <div className='source'>
      <textarea className='fragment-input' type="text"
        onKeyDown={handleKeyDown}
        onChange={(e) => setFragmentSource(e.target.value)}
        value={fragmentSource}/>
    </div>
    <div className='update'>
      <button onClick={updateFragment}>Update fragment shader</button>
    </div>
  </div>)
}

export default FragmentShaderInput;
