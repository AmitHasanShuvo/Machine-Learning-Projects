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

    tfvis.render.scatterplot({
        name: 'Horsepower vs MPG'
    }, {
        values
    }, {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
    });
}
document.addEventListener('DOMContentLoaded', run);