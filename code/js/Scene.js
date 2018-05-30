"use strict";
const Scene = function(gl) {
  this.vsRaydir = new Shader(gl, gl.VERTEX_SHADER, "raydir_vs.essl");
  this.fsTrace = new Shader(gl, gl.FRAGMENT_SHADER, "trace_fs.essl");
  this.fsShow = new Shader(gl, gl.FRAGMENT_SHADER, "show_fs.essl");  
  this.traceProgram = new Program(gl, this.vsRaydir, this.fsTrace);
  this.showProgram = new Program(gl, this.vsRaydir, this.fsShow);    
  this.traceProgram.envmapTexture.set(new
    TextureCube(gl, [
      "media/posx.jpg",
      "media/negx.jpg",
      "media/posy.jpg",
      "media/negy.jpg",
      "media/posz.jpg",
      "media/negz.jpg",
      ]));
  this.quadGeometry = new QuadGeometry(gl);

  this.camera = new PerspectiveCamera();

  this.timeAtFirstFrame = new Date().getTime(); 
  this.timeAtLastFrame = new Date().getTime();

  this.randoms = new Uint32Array(64*4);
};

Scene.prototype.resize = function(gl, width, height) {
  this.fb = [gl.createFramebuffer(), gl.createFramebuffer()];
  this.tex = [gl.createTexture(), gl.createTexture()];
  for(let i=0; i<2; i++) {
    gl.bindTexture(gl.TEXTURE_2D, this.tex[i]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width,
                  height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb[i]);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                            this.tex[i], 0);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  const timeAtThisFrame = new Date().getTime();
  const dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  // clear the screen
  gl.clearColor(0.6, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.camera.move(dt, keysPressed);
 
  const ground = new ClippedQuadric(
    this.traceProgram.quadrics.at(0),
    this.traceProgram.quadrics.at(1)); 
  ground.setParallelPlanes();
  ground.scale(15, 2, 15);

  this.traceProgram.rayDirMatrix.set(this.camera.rayDirMatrix);
  this.traceProgram.eyePos.set(this.camera.position);
  
  window.crypto.getRandomValues(this.randoms);
  for(let i=0; i<64; i++) {
    this.traceProgram.randoms.at(i).set(
      this.randoms[i*4+0] / 4294967295,
      this.randoms[i*4+1] / 4294967295,
      this.randoms[i*4+2] / 4294967295,
      this.randoms[i*4+3] / 4294967295);
  }

  for(let i=1; i<17; i++) {
    const sphere = new ClippedQuadric(
      this.traceProgram.quadrics.at(i*2),
      this.traceProgram.quadrics.at(i*2+1)); 
    sphere.setUnitSphere();
    sphere.translate(Math.cos(i*0.3)*Math.sqrt(i)*3, 0, Math.sin(i*0.3)*Math.sqrt(i)*3);
  }

  this.showProgram.showTexture.set(this.tex[0]);
  this.traceProgram.prevImage.set(this.tex[0]);  

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb[1]);

  this.traceProgram.commit();
  this.quadGeometry.draw();

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  this.showProgram.commit();
  this.quadGeometry.draw();

  this.tex.reverse();
  this.fb.reverse();

};


