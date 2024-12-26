// This file contains functions for genetic algorithms used in the game, including the creation of new generations of cars, fitness calculations, and selection methods.

const TOTAL = 100; // Total number of cars
const MUTATION_RATE = 0.1; // Mutation rate for genetic algorithm
let population = []; // Array to hold the current population of cars
let savedParticles = []; // Array to hold the cars that have finished
let end; // Variable to hold the end point of the track

function nextGeneration() {
  console.log('Next generation');
  
  calculateFitnessFirst(end);

  for (let i = 0; i < TOTAL; i++) {
    population[i] = pickOneRank();
    let child = new Particle(population[i].brain.copy());
    child.mutate();
  }

  for (let i = 0; i < TOTAL; i++) {
    savedParticles[i].dispose();
  }
  savedParticles = [];
}

function calculateRankProbabilities() {
  savedParticles.sort((a, b) => b.fitness - a.fitness);
  let totalRank = 0;
  for (let i = 1; i <= savedParticles.length; i++) {
    totalRank += i;
  }

  for (let i = 0; i < savedParticles.length; i++) {
    savedParticles[i].selectionProbability = (savedParticles.length - i) / totalRank;
  }
}

function pickOneRank() {
  calculateRankProbabilities();

  let index = 0;
  let r = random(1);
  while (r > 0) {
    r -= savedParticles[index].selectionProbability;
    index++;
  }
  index--;

  let particle = savedParticles[index];
  let child = new Particle(particle.brain);
  child.mutate();
  return child;
}

function calculateFitnessFirst(target) {
  for (let particle of savedParticles) {
    particle.calculateFitness();
  }

  let bestFitness = 0;
  let bestParticle = null;
  for (let particle of savedParticles) {
    if (particle.fitness > bestFitness) {
      bestFitness = particle.fitness;
      bestParticle = particle;
    }
  }

  if (bestParticle) {
    bestParticle.fitness += 100; // Bonus for the best particle
  }

  let sum = 0;
  for (let particle of savedParticles) {
    sum += particle.fitness;
  }
  for (let particle of savedParticles) {
    particle.fitness /= sum; // Normalize fitness
  }
}