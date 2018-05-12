"use strict";

const ClippedQuadric = function(surface, clipper) {
  this.surface = surface;
  this.clipper = clipper;
}

ClippedQuadric.prototype.setUnitSphere = function(){
  this.surface.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0,-1,
    );
  this.clipper.set(
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0,-1,
    );
}

ClippedQuadric.prototype.setUnitCylinder = function(){
  this.surface.set(
    1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0,-1,
    );
  this.clipper.set(
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0,-1,
    );
}

ClippedQuadric.prototype.setParallelPlanes = function(){
  this.surface.set(
    0, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0,-1,
    );
  this.clipper.set(
    1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0,-1,
    );
}

ClippedQuadric.prototype.transform = function(t){
  t.invert();
  const tt = t.clone(t).transpose();
  this.surface.premul(t).mul(tt);
  this.clipper.premul(t).mul(tt);
}

ClippedQuadric.prototype.translate = function(x, y, z){
  const t = new Mat4().translate(x, y, z);
  this.transform(t);
}

ClippedQuadric.prototype.rotate = function(angle, axis){
  const t = new Mat4().rotate(angle, axis);
  this.transform(t);
}

ClippedQuadric.prototype.scale = function(x, y, z){
  const t = new Mat4().scale(x, y, z);
  this.transform(t);
}
