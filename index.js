const regl = require('regl')();


function randBtwn(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function randIntBtwn(min, max) {
  return Math.floor(randBtwn(min, max));
}

const PI = `#define PI 3.1415926535897932384626433832795`;

const fullPos = [
  [-1, -1], [-1, 1], [1, 1],
  [-1, -1], [1, -1], [1, 1]
];

const fullScreenVert = `
  precision mediump float;
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0, 1);
  }
`;

const stroke = `
  float stroke(float x, float s, float w) {
    float d = step(s, x + w * 0.5) -
              step(s, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
  }
`;

const circleSDF = `
  float circleSDF(vec2 st) {
    return length(st - 0.5) * 2.0;
  }
`;

const fill = `
  float fill(float x, float size) {
    return 1.0 - step(size, x);
  }
`;

const rectSDF = `
  float rectSDF(vec2 st, vec2 s) {
    st = st * 2.0 - 1.0;
    return max(abs(st.x / s.x),
               abs(st.y / s.y));
  }
`;

const crossSDF = `
  float crossSDF(vec2 st, float s) {
    vec2 size = vec2(0.25, s);
    return min(rectSDF(st, size.xy),
               rectSDF(st, size.yx));
  }
`;

const flip = `
  float flip(float v, float pct) {
    return mix(v, 1.0 - v, pct);
  }
`;

const vesicaSDF = `
  float vesicaSDF(vec2 st, float w) {
    vec2 offset = vec2(w * 0.5, 0.0);
    return max(circleSDF(st - offset),
               circleSDF(st + offset));
  }
`;

const triSDF = `
  float triSDF(vec2 st) {
    st = (st * 2.0 - 1.0) * 2.0;
    return max(abs(st.x) * 0.866025 + st.y * 0.5, -st.y * 0.5);
  }
`;

const rhombSDF = `
  float rhombSDF(vec2 st) {
    return max(triSDF(st), triSDF(vec2(st.x, 1.0 - st.y)));
  }
`;

const rotate = `
  vec2 rotate(vec2 st, float a) {
    st = mat2(cos(a), -sin(a), sin(a), cos(a)) * (st - 0.5);
    return st + 0.5;
  }
`;

const draw1 = regl({

  frag: `
  precision mediump float;
  uniform vec2 resolution;

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    color += step(0.5, st.x);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw2 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    color += step(0.5 + cos(st.y * PI) * 0.25, st.x);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw3 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    color += step(0.5, (st.x + st.y) * 0.5);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw4 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${stroke}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    color += stroke(st.x, 0.5, 0.15);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw5 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${stroke}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float offset = cos(st.y * PI) * 0.15;
    color += stroke(st.x, 0.28 + offset, 0.1);
    color += stroke(st.x, 0.50 + offset, 0.1);
    color += stroke(st.x, 0.72 + offset, 0.1);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw6 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${stroke}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float sdf = 0.5 + (st.x - st.y) * 0.5;
    color += stroke(sdf, 0.5, 0.1);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw7 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${stroke}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float sdf = 0.5 + (st.x - st.y) * 0.5;
    float sdf_inv = (st.x + st.y) * 0.5;
    color += stroke(sdf, 0.5, 0.1);
    color += stroke(sdf_inv, 0.5, 0.1);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw8 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${stroke}
  ${circleSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    color += stroke(circleSDF(st), 0.5, 0.05);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw9 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${circleSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    vec2 offset = vec2(0.1, 0.05);
    color += fill(circleSDF(st), 0.65);
    color -= fill(circleSDF(st - offset), 0.5);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw10 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${rectSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float sdf = rectSDF(st, vec2(1.0, 1.0));
    color += stroke(sdf, 0.5, 0.125);
    color += fill(sdf, 0.1);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw11 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${rectSDF}
  ${crossSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float rect = rectSDF(st, vec2(1.0, 1.0));
    float cross = crossSDF(st, 1.0);
    color += fill(rect, 0.5);
    color *= step(0.5, fract(cross * 4.0));
    color *= step(1.0, cross);
    color += fill(cross, 0.5);
    color += stroke(rect, 0.65, 0.05);
    color += stroke(rect, 0.75, 0.025);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw12 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${rectSDF}
  ${flip}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float rect = rectSDF(st, vec2(0.5, 1.0));
    float diag = (st.x + st.y) * 0.5;
    color += flip(fill(rect, 0.6),
                    stroke(diag, 0.5, 0.01));
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw13 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${circleSDF}
  ${flip}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    vec2 offset = vec2(0.15, 0.0);
    float left = circleSDF(st + offset);
    float right = circleSDF(st - offset);
    color += flip(stroke(left, 0.5, 0.05),
                  fill(right, 0.525));
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw14 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${circleSDF}
  ${vesicaSDF}
  ${flip}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float sdf = vesicaSDF(st, 0.2);
    color += flip(fill(sdf, 0.5), step((st.x + st.y) * 0.5, 0.5));
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw15 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${triSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    st.y = 1.0 - st.y;
    vec2 ts = vec2(st.x, 0.82 - st.y);
    color += fill(triSDF(st), 0.7);
    color -= fill(triSDF(ts), 0.36);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw16 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${circleSDF}
  ${triSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float circle = circleSDF(st - vec2(0.0, 0.1));
    float triangle = triSDF(st + vec2(0.0, 0.1));
    color += stroke(circle, 0.45, 0.1);
    color *= step(0.55, triangle);
    color += fill(triangle, 0.45);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw17 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${triSDF}
  ${rhombSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float sdf = rhombSDF(st);
    color += fill(sdf, 0.425);
    color += stroke(sdf, 0.5, 0.05);
    color += stroke(sdf, 0.6, 0.03);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw18 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${flip}
  ${stroke}
  ${triSDF}
  ${rhombSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    float sdf = rhombSDF(st);
    color += flip(fill(triSDF(st), 0.5),
                  fill(rhombSDF(st), 0.4));
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw19 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${triSDF}
  ${rotate}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    st = rotate(st, radians(-25.0));
    float sdf = triSDF(st);
    sdf /= triSDF(st + vec2(0.0, 0.2));
    color += fill(abs(sdf), 0.56);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const draw20 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${rectSDF}
  ${rotate}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    st = rotate(st, radians(45.0));
    color += fill(rectSDF(st, vec2(1.0, 1.0)), 0.4);
    color *= 1.0 - stroke(st.x, 0.5, 0.02);
    color *= 1.0 - stroke(st.y, 0.5, 0.02);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});


const draw21 = regl({

  frag: `
  ${PI}

  precision mediump float;
  uniform vec2 resolution;

  ${fill}
  ${stroke}
  ${rotate}
  ${rectSDF}

  void main() {
    vec3 color = vec3(0.0, 0.0, 0.0);
    vec2 st = gl_FragCoord.xy / resolution;
    st = rotate(st, radians(45.0));
    float off = 0.12;
    vec2 s = vec2(1.0, 1.0);
    float r = rectSDF(st, s);
    color += fill(rectSDF(st + off, s), 0.2);
    color += fill(rectSDF(st - off, s), 0.2);
    color *= step(0.33, r);
    color += fill(r, 0.3);
    gl_FragColor = vec4(color, 1);
  }`,

  vert: fullScreenVert,

  attributes: {
    position: fullPos
  },

  uniforms: {
    resolution: ({ viewportWidth, viewportHeight }) => {
      return [ viewportWidth, viewportHeight ];
    }
  },

  count: 6
});

const deck = {
  draw1, draw2, draw3, draw4, draw5,
  draw6, draw7, draw8, draw9, draw10,
  draw11, draw12, draw13, draw14, draw15,
  draw16, draw17, draw18, draw19, draw20,
  draw21
}

let i = 1;
regl.frame(function draw(context) {
  if (context.tick % 100 === 0) {
    i++;
    console.log(`card: ${i}`);
  }

  if (i > Object.keys(deck).length) {
    i = 1;
  }

  // const card = `draw${i}`;
  const card = 'draw21';
  deck[card]({});
});
