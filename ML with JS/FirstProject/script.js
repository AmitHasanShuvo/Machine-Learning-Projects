console.log('Hello this is my first TF with JS project')


/* Getting the data */

async function getData() {
    const carsDataRequest = await fetch('https://storage.googleapis.com/tfjs-tutorials/carsData.json');
    const carsData = await carsDataRequest.json();
    const cleaned = carsData.map(car => ({
            mpg: car.Miles_per_Gallon,
            horsepower: car.Horsepower,
        }))
        .filter(car => (car.mpg != null && car.horsepower != null));
    return cleaned;
}


/* It will remove any entry that dont have miles per gallon or horsepower defined*/

/* Now we will plot the data
 */

async function run() {
    const data = await getData();
    const values = data.map(d => ({
        x: d.horsepower,
        y: d.mpg,
    }));
    /*This tfvis is helping to visulize the data */
    tfvis.render.scatterplot({
        name: 'Horsepower vs MPG'
    }, {
        values
    }, {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 400
    });

    // Creating the model
    const model = createModel();
    tfvis.show.modelSummary({
        name: 'Model Summary'
    }, model);

    //convert the data to a form ,so we can train them
    const tensorData = convertToTensor(data);
    const {inputs,labels} = tensorData;

    // Train the model

    await trainModel(model,inputs,labels);
    console.log('Done training');

    testModel(model,data,tensorData)

}
document.addEventListener('DOMContentLoaded', run);


/* Now we will defin the model architecture */

function createModel() {
    /* dec the model */
    const model = tf.sequential();
    /* adding layers */
    model.add(tf.layers.dense({
        inputShape: [1],
        units: 50,
        useBias: true
    }));
    //model.add(tf.layers.dense({inputShape: [1],units:0, useBias:true}));

    model.add(tf.layers.dense({
        units: 1,
        useBias: true
    }));

    return model;
}
// Prepare the model 

function convertToTensor(data) {
    return tf.tidy(() => {
        // Shuffle the data
        tf.util.shuffle(data);
        // Convert data into tensors
        // making two arrays
        const inputs = data.map(d => d.horsepower)
        const labels = data.map(d => d.mpg);

        // converting arrrays into 2d tensors
        const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
        const labelsTensor = tf.tensor2d(labels, [labels.length, 1]);

        // normalize the data to range 0 - 1 using min max scaling


        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelmax = labelsTensor.max();
        const labelmin = labelsTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax. sub(inputMin));
        const normalizedLabels = labelsTensor.sub(labelmin).div(labelmax. sub(labelmin));


        return {
            inputs: normalizedInputs,
            labels: normalizedLabels,

            inputMax,
            inputMin,
            labelmax,
            labelmin,
        }
    });
}

// Train the model

async function trainModel(model, inputs, labels) {
    model.compile({
        optimizer: tf.train.adam(),
        loss: tf.losses.meanSquaredError,
        metrics: ['mse'],
    });

    const batchsize = 64;
    const epochs = 100;

    return await model.fit(inputs, labels,{
        batchsize,
        epochs,
        shuffle: true,
        callbacks: tfvis.show.fitCallbacks({
                name: 'Train Performace'
            },
            ['loss', 'mse'], {
                height: 200,
                callbacks: ['onEpochEnd']
            }
        )
    });
}

//Make predictons
function testModel(model, inputData, normalizationData) {
    const {inputMax, inputMin, labelmin, labelmax} = normalizationData;  
    
    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling 
    // that we did earlier.
    const [xs, preds] = tf.tidy(() => {
      
      const xs = tf.linspace(0, 1, 100);      
      const preds = model.predict(xs.reshape([100, 1]));      
      
      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);
      
      const unNormPreds = preds
        .mul(labelmax.sub(labelmin))
        .add(labelmin);
      
      // Un-normalize the data
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });
    
   
    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });
    
    const originalPoints = inputData.map(d => ({
      x: d.horsepower, y: d.mpg,
    }));
    
    
    tfvis.render.scatterplot(
      {name: 'Model Predictions vs Original Data'}, 
      {values: [originalPoints, predictedPoints], series: ['original', 'predicted']}, 
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );
  }
