const defaultVertexShaderSource = `#version 300 es
in vec2 aPos;

out vec2 uv;

void main(void) {
    gl_Position = vec4(aPos, 0.0, 1.0);
    uv = aPos * 0.5 + 0.5;
    uv = vec2(uv.x, 1.0 - uv.y);
}`;

const defaultFragmentShaderSourceHeader = `#version 300 es
precision mediump float;

in vec2 uv;
uniform float uTime;
uniform vec2 uMouse;
out vec4 FragColor;
`;

const defaultFragmentShaderSource = `void main(void) {
    FragColor = vec4(uv, 0.5 + 0.5 * sin(uTime), 1.0);
}`;


export { 
    defaultVertexShaderSource, 
    defaultFragmentShaderSourceHeader,
    defaultFragmentShaderSource,
};

