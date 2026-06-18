const fragmentShader = `
precision mediump float;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

void main() {
  float offset = 1.0 / 320.0;
  vec4 base = texture2D(uMainSampler, outTexCoord);
  float r = texture2D(uMainSampler, outTexCoord + vec2(-offset, 0.0)).r;
  float g = base.g;
  float b = texture2D(uMainSampler, outTexCoord + vec2(offset, 0.0)).b;
  gl_FragColor = vec4(r, g, b, base.a);
}
`;

export default class CRTShaderPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game) {
    super({
      game,
      renderTarget: true,
      fragShader: fragmentShader
    });
  }
}
