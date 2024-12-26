function pldistance(p1, p2, x, y) {
  const num = abs((p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x);
  const den = p5.Vector.dist(p1, p2);
  return num / den;
}

class Particle {
  constructor(brain) {
    this.fitness = 0;
    this.dead = false;
    this.finished = false;
    this.pos = createVector(start.x, start.y);
    this.vel = createVector();
    this.acc = createVector();
    this.maxspeed = 5;
    this.maxforce = 0.2;
    this.sight = SIGHT;
    this.rays = [];
    this.index = 0;
    this.counter = 0;
    this.brain = brain;

    for (let a = -45; a < 45; a += 15) {
      this.rays.push(new Ray(this.pos, radians(a)));
    }

    if (!brain) {
      this.brain = new NeuralNetwork(6, 18, 4, 2);
    }
  }

  dispose() {
    this.brain.dispose();
  }

  mutate() {
    this.brain.mutate(MUTATION_RATE);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    if (!this.dead && !this.finished) {
      this.vel.add(this.acc);
      this.vel.limit(this.maxspeed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
  }

  check(checkpoints) {
    if (!this.finished) {
      for (let checkpoint of checkpoints) {
        if (pldistance(checkpoint.a, checkpoint.b, this.pos.x, this.pos.y) < 5) {
          this.counter++;
          if (this.counter > checkpoints.length) {
            this.finished = true;
          }
        }
      }
    }
  }

  calculateFitness() {
    this.fitness = pow(2, this.fitness);
    this.fitness += this.counter / LIFESPAN;
  }

  look(walls) {
    const inputs = [];
    for (let ray of this.rays) {
      const pt = ray.cast(walls);
      if (pt) {
        const d = p5.Vector.dist(this.pos, pt);
        inputs.push(map(d, 0, width, 1, 0));
      } else {
        inputs.push(1);
      }
    }

    const xs = tf.tensor2d([inputs]);
    const output = this.brain.predict(xs).dataSync();
    xs.dispose();

    let angle = map(output[0], 0, 1, -PI, PI);
    let speed = map(output[1], 0, 1, 0, this.maxspeed);
    angle += this.vel.heading();

    const steering = p5.Vector.fromAngle(angle);
    steering.setMag(speed);
    steering.sub(this.vel);
    steering.limit(this.maxforce);
    this.applyForce(steering);
  }

  bounds() {
    if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
      this.dead = true;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    fill(255, 100);
    rectMode(CENTER);
    rect(0, 0, 10, 5);
    pop();
  }

  highlight() {
    push();
    translate(this.pos.x, this.pos.y);
    const heading = this.vel.heading();
    rotate(heading);
    stroke(0, 255, 0);
    fill(0, 255, 0);
    rectMode(CENTER);
    rect(0, 0, 20, 10);
    pop();
    for (let ray of this.rays) {
      ray.show();
    }
  }
}