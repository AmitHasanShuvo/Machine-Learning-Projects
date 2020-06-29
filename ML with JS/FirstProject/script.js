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
    tfvis.show.modelSummary({name: 'Model Summary'},model);
}
document.addEventListener('DOMContentLoaded', run);


/* Now we will defin the model architecture */

function createModel(){
    /* dec the model */
    const model = tf.sequential();
    /* adding layers */
    model.add(tf.layers.dense({inputShape: [1],units:10, useBias:true}));
    //model.add(tf.layers.dense({inputShape: [1],units:0, useBias:true}));

    model.add(tf.layers.dense({units:1,useBias: true}));

    return model;
}
// Prepare the model 

function convertToTensor(data){
    return tf.tidy(() =>{
        // Shuffle the data
        tf.util.shuffle(data);
        // Convert data into tensors
        const inputs = data.map(d => d.horsepower)
        const labels = data.map(d => d.mpg);
        const inputTensor = tf.tensor2d(inputs,[inputs.length,1]);
        const labelsTensor = tf.tensor2d(labels, [labels.length,1]);

        // normalize the data to range 0 - 1 using min max scaling


        const inputMax = inputTensor.max();
        const inputMin = inputTensor.min();
        const labelmax = labelsTensor.max();
        const labelmin = labelsTensor.min();

        const normalizedInputs = inputTensor.sub(inputMin).div(inputMax,sub(inputMin));
        const normalizedLabels = inputTensor.sub(labelmin).div(labelmax,sub(labelmin));


        return {
            inputs : normalizedInputs,
            labels: normalizedLabels,

            inputMax,inputMin,labelmax,labelmin,
        }
    });
}

