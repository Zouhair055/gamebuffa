// This file defines the NeuralNetwork class, which represents the neural networks used by the cars to make decisions based on their environment. It includes methods for creating, copying, mutating, and predicting outputs from the neural network.

class NeuralNetwork {
  constructor(a, b, c, d) {
    if (a instanceof tf.Sequential) {
      this.model = a;
      this.input_nodes = b;
      this.hidden_nodes = c;
      this.output_nodes = d;
    } else {
      this.input_nodes = a;
      this.hidden_nodes = b;
      this.output_nodes = c;
      this.model = this.createModel();
    }
  }

  copy() {
    return tf.tidy(() => {
      const modelCopy = this.createModel();
      const weights = this.model.getWeights();
      const weightCopies = [];
      for (let i = 0; i < weights.length; i++) {
        weightCopies[i] = weights[i].clone();
      }
      modelCopy.setWeights(weightCopies);
      return new NeuralNetwork(modelCopy, this.input_nodes, this.hidden_nodes, this.output_nodes);
    });
  }

  mutate(rate) {
    tf.tidy(() => {
      const weights = this.model.getWeights();
      const mutatedWeights = [];
      for (let i = 0; i < weights.length; i++) {
        let tensor = weights[i];
        let shape = weights[i].shape;
        let values = tensor.dataSync().slice();
        for (let j = 0; j < values.length; j++) {
          if (Math.random() < rate) {
            values[j] += randomGaussian(0, 0.1);
          }
        }
        let newTensor = tf.tensor(values, shape);
        mutatedWeights[i] = newTensor;
      }
      this.model.setWeights(mutatedWeights);
    });
  }

  crossover(partner) {
    return tf.tidy(() => {
      const weightsA = this.model.getWeights();
      const weightsB = partner.model.getWeights();
      const newWeights = [];
      for (let i = 0; i < weightsA.length; i++) {
        let tensorA = weightsA[i];
        let tensorB = weightsB[i];
        let shape = tensorA.shape;
        let valuesA = tensorA.dataSync().slice();
        let valuesB = tensorB.dataSync().slice();
        let newValues = [];
        for (let j = 0; j < valuesA.length; j++) {
          newValues[j] = Math.random() < 0.5 ? valuesA[j] : valuesB[j];
        }
        const childModel = this.createModel();
        const newTensor = tf.tensor(newValues, shape);
        newWeights[i] = newTensor;
      }
      childModel.setWeights(newWeights);
      return new NeuralNetwork(childModel, this.input_nodes, this.hidden_nodes, this.output_nodes);
    });
  }

  dispose() {
    this.model.dispose();
  }

  predict(inputs) {
    return tf.tidy(() => {
      const xs = tf.tensor2d([inputs]);
      const ys = this.model.predict(xs);
      const outputs = ys.dataSync();
      return outputs;
    });
  }

  createModel() {
    const model = tf.sequential();
    const hidden1 = tf.layers.dense({
      units: this.hidden_nodes,
      inputShape: [this.input_nodes],
      activation: 'relu'
    });
    model.add(hidden1);
    const output = tf.layers.dense({
      units: this.output_nodes,
      activation: 'sigmoid'
    });
    model.add(output);
    return model;
  }

  async saveModel() {
    await this.model.save('downloads://model');
  }
}