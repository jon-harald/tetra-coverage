const fs        = require('fs');
const tetra     = require('./tetraterminal');
const program     = require('commander');


program
  .version('0.1.0')
  .option('-p, --port <portname>', 'Serial port e.g /dev/ttyusb')
  .option('-b, --baud [baudrate]', 'Baudrate (default 38400')
  .option('-f, --filename [filename]', 'Filename to output coverage data to (default report.txt)')
  .option('-i --interval <number>', 'Interval in seconds to get reports')
  .parse(process.argv);


  // Check parameters and set defaults
let portName;

if (typeof program.port !== 'undefined') {
    portName = '/dev/cu.usbserial-FTF4Y8HO' 
} else {
    console.log("Portname missing\n");
    program.outputHelp();
    process.exit(1);
}

let baudrate = typeof program.baudrate !== 'undefined' ? program.baudrate : 38400;
let filename = typeof program.filename !== 'undefined' ? program.filename : "report.txt";
let interval = typeof program.interval !== 'undefined' ? program.interval * 1000 : null;


let radio = new tetra.Motorola(portName, baudrate);
let issi, manufacturer, serialnumber, model;
start();

async function start() {
    try {
    issi = await radio.getIssi();
    console.log(`ISSI: ${issi}`);
    model = await radio.getModel();
    console.log(`Model: ${model}`);
    serialnumber = await radio.getSerialnumber();
    console.log(`Serial: ${serialnumber}`);
    manufacturer = await radio.getManufacturer();
    console.log(`Manufacturer: ${manufacturer}`);
    } catch (err) {
        console.log("Error retrieving radio info: " + err);
        process.exit(1);
    }

    radio.initializeTerminal().then(
        async ()=>{
        await getReport();
        if (interval) {
            setInterval( async function () {
                await getReport();
            }, interval);
        } else {
            process.exit();
        }
    });
}

async function getReport() {
    try {
        rssi = await radio.getRSSI();
        location = await radio.getLocation();
        cell = await radio.getCellInfo();

        report = {
            issi: issi,
            signal: {
                rssi: rssi,
                c1: undefined,
            },
            currentcell: cell,
            neighbourcells: undefined,
            location: {
                lat: location.lat,
                lon: location.lon,
                satellites: location.satellites,
                timestamp: location.timestamp,
            },
        }

        fs.appendFile(filename, JSON.stringify(report) + '\n', (err) => { 
            if (err) throw err;
        })
        
        console.log(JSON.stringify(report));
        radio.setDisplayMessage("Dekning", `RSSI: ${rssi} dBm lagret`, 5 ,4);
    } catch (err) {
        console.log(`Unable to get signalreport: ${err}`);
    }
}
