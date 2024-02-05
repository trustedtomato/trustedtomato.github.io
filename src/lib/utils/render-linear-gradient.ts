// debugging utilities
const debugging =
  import.meta.env.DEV ||
  import.meta.env.MODE === 'development' ||
  import.meta.env.VITE_DEBUG ||
  false

const emptyFunc = () => {
  /* empty */
}

const debug = debugging ? console.log.bind(console) : emptyFunc
const debugTime = debugging
  ? (label: string) => console.time(`[render-linear-gradient] ${label}`)
  : emptyFunc
const debugTimeEnd = debugging
  ? (label: string) => console.timeEnd(`[render-linear-gradient] ${label}`)
  : emptyFunc

/**
 * Helper function to create a WebGL shader.
 * @param gl WebGL context
 * @param type Shader type
 * @param source Shader source code
 */
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) {
    throw new Error('Failed to create shader')
  }

  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (success) {
    return shader
  }

  gl.deleteShader(shader)
  throw new Error('Failed to compile shader: ' + gl.getShaderInfoLog(shader))
}

/**
 * Helper function to create a WebGL program.
 */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  )
  const program = gl.createProgram()
  if (!program) {
    throw new Error('Failed to create program')
  }
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  const success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }

  gl.deleteProgram(program)
  throw new Error('Failed to link program: ' + gl.getProgramInfoLog(program))
}

/**
 * The source code for the vertex shader.
 * (Just pass through the position.)
 */
const vertextShader = /*glsl*/ `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`

/**
 * The source code for the fragment shader.
 * Renders a noisy linear gradient.
 */
const fragmentShader = /*glsl*/ `
  precision highp float;

  uniform vec2 u_resolution;
  uniform vec4 u_colors[8];
  uniform float u_stops[8];
  uniform int u_num_stops;
  uniform int u_gamma_correction;
  uniform float u_quantization;
  uniform vec2 u_gradient_start_pos;
  uniform vec2 u_gradient_end_pos;

  float triangleNoise(const vec2 n) {
    // triangle noise, in [-0.5..1.5[ range
    vec2 p = fract(n * vec2(5.3987, 5.4421));
    p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));

    float xy = p.x * p.y;
    // compute in [0..2[ and remap to [-1.0..1.0[
    float noise = (fract(xy * 95.4307) + fract(xy * 75.04961) - 1.0);
    //noise = sign(noise) * (1.0 - sqrt(1.0 - abs(noise)));
    return noise;
  }

  vec4 Dither_TriangleNoise(vec4 rgba) {
    // Gjøl 2016, "Banding in Games: A Noisy Rant"
    vec3 noise = vec3(triangleNoise(gl_FragCoord.xy / u_resolution.xy)) / 256.0;
    return vec4(rgba.rgb + noise, rgba.a);
  }

  vec4 OECF(const vec4 c) {
    return u_gamma_correction == 1 ? pow(c, vec4(1.0 / 2.2)) : c;
  }

  vec4 EOCF(const vec4 c) {
    return u_gamma_correction == 1 ? pow(c, vec4(2.2)) : c;
  }

  void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    // these should be uniforms
    vec2 gradient_start_pos = u_gradient_start_pos;
    vec2 gradient_end_pos = u_gradient_end_pos;
      
    vec2 uv = (fragCoord.xy / u_resolution.xy);
    uv.y = (uv.y - 1.0) * -1.0;
          
    float alpha = atan(
      gradient_end_pos.y - gradient_start_pos.y,
      gradient_end_pos.x - gradient_start_pos.x
    ); // this is the angle of the gradient in rad
      
    float gradient_startpos_rotated_x = gradient_start_pos.x * cos(-alpha) - gradient_start_pos.y * sin(-alpha);
    float gradient_endpos_rotated_x = gradient_end_pos.x * cos(-alpha) - gradient_end_pos.y * sin(-alpha);
    float len = gradient_endpos_rotated_x - gradient_startpos_rotated_x;
    float x_loc_rotated = uv.x * cos(-alpha) - uv.y * sin(-alpha);

    fragColor = u_colors[0];

    // it is not possible to loop until u_num_stops, because u_num_stops is not a constant.
    // so we loop until 8, and break if we are out of bounds.
    for (int i = 0; i < 8; i++) {
      if (i >= u_num_stops - 1) {
        break;
      }
      fragColor = OECF(mix(EOCF(fragColor), EOCF(u_colors[i + 1]), smoothstep(
        gradient_startpos_rotated_x + u_stops[i] * len,
        gradient_startpos_rotated_x + u_stops[i + 1] * len,
        x_loc_rotated
      )));
    }
    fragColor = Dither_TriangleNoise(fragColor / u_quantization) * u_quantization;
  }

  void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
  }
`

interface ColorStop {
  color: string
  offset?: number
}

interface LinearGradientOptions {
  /** The canvas to render the gradient to. */
  canvas?: HTMLCanvasElement
  /** The width of the canvas. */
  width: number
  /** The height of the canvas. */
  height: number
  /** The color stops of the gradient. */
  stops: ColorStop[]
  /** The quantization of the gradient (defaults to 1 meaning no quantization). */
  quantization?: number
  /** The start position of the gradient. */
  start?: { x: number; y: number }
  /** The end position of the gradient. */
  end?: { x: number; y: number }
  /** Whether to apply gamma correction (defaults to true). */
  gammaCorrection?: boolean
}

/**
 * Renders a linear gradient to a canvas.
 * @param options The options for the linear gradient.
 * @returns The canvas with the rendered linear gradient.
 */
export function renderLinearGradient({
  canvas,
  width,
  height,
  stops,
  quantization = 1,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  gammaCorrection = false
}: LinearGradientOptions) {
  debugTime('setup canvas')

  if (!canvas) {
    canvas = document.createElement('canvas')
  }

  const gl = canvas.getContext('webgl')

  debugTimeEnd('setup canvas')
  debugTime('compile')

  if (!gl) {
    console.warn('WebGL not supported')
    return null
  }
  const program = createProgram(gl, vertextShader, fragmentShader)

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position')
  const resolutionUniformLocation = gl.getUniformLocation(
    program,
    'u_resolution'
  )
  const colorsUniformLocation = gl.getUniformLocation(program, 'u_colors')
  const stopsUniformLocation = gl.getUniformLocation(program, 'u_stops')
  const numStopsUniformLocation = gl.getUniformLocation(program, 'u_num_stops')
  const quantizationUniformLocation = gl.getUniformLocation(
    program,
    'u_quantization'
  )
  const gradentStartPosUniformLocation = gl.getUniformLocation(
    program,
    'u_gradient_start_pos'
  )
  const gradentEndPosUniformLocation = gl.getUniformLocation(
    program,
    'u_gradient_end_pos'
  )
  const gammaCorrectionUniformLocation = gl.getUniformLocation(
    program,
    'u_gamma_correction'
  )

  debugTimeEnd('compile')
  debugTime('renderLinearGradient')

  canvas.width = width
  canvas.height = height

  // setup position buffer
  const positionBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // first triangle
      -1, -1, 1, -1, -1, 1,
      // second triangle
      -1, 1, 1, -1, 1, 1
    ]),
    gl.STATIC_DRAW
  )

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  gl.useProgram(program)
  gl.enableVertexAttribArray(positionAttributeLocation)
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

  // setup uniforms
  gl.uniform2f(resolutionUniformLocation, width, height)
  gl.uniform1fv(
    stopsUniformLocation,
    new Float32Array(stops.map((s, i) => s.offset || i / (stops.length - 1)))
  )
  gl.uniform1i(numStopsUniformLocation, stops.length)
  gl.uniform2f(gradentStartPosUniformLocation, start.x, start.y)
  gl.uniform2f(gradentEndPosUniformLocation, end.x, end.y)
  gl.uniform1f(quantizationUniformLocation, quantization)
  gl.uniform1i(gammaCorrectionUniformLocation, gammaCorrection ? 1 : 0)

  gl.uniform4fv(
    colorsUniformLocation,
    new Float32Array(
      stops
        .map((stop) => {
          const match = stop.color.match(/^#?(..)(..)(..)$/)
          if (!match) {
            throw new Error(`Invalid color: ${stop.color}`)
          }
          const [, r, g, b] = match
          return [
            parseInt(r, 16) / 255,
            parseInt(g, 16) / 255,
            parseInt(b, 16) / 255,
            1
          ]
        })
        .flat()
    )
  )

  // draw
  gl.drawArrays(gl.TRIANGLES, 0, 6)

  debugTimeEnd('renderLinearGradient')

  return canvas
}
