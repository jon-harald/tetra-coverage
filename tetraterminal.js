const SerialPort    = require('serialport');
const Readline      = require('@serialport/parser-readline');
const utm           = require('utm');

const dbSteps = [-113, -111, -109, -107, -105, -103, -101, -99, -97, -95, -93, -91, -89, -87, -85, -83, -81, -79, -77, -75, -73, -71, -69, -67, -65, -63, -61, -59, -57, -55, -53, -51];

// Error codes from ETSI specification EN 100 392-5
// Values over 100 is manufacturer specific 
const errorCodes ={
    3: "Operations not allowed",
    4: "Operatin not supported",
    30: "No network service",
    33: "Parameter wrong type",
    34: "Parameter value out of range",
    35: "Syntax error",
    40: "Service not supported in DMO",
    50: "No GPS network service",
}

var exports = module.exports =  {};

const ctrlz = String.fromCharCode(26);
const cr = String.fromCharCode(13);

exports.Sepura = class Sepura{
    // TODO: Implement Sepura 
    constructor(portname, baudrate) {
        this.serialport = new SerialPort(portname, {
            baudRate: baudrate  
        });
        this.parser = this.serialport.pipe(new Readline({ delimiter: '\n' }));

        this.serialport.on('error', function(err) {
            console.error(err.message);
        });
    }

    geTerminalInfo(){

    }

    getRSSI() {
        //AT+CSQ?
    }

    getCellInfo() {
        //AT+CCI
    }

    getLocation() {
        //AT+CGPS
    }
        
    getNeighbourCells() {
        //AT+CNCI
    }    
}



exports.Motorola = class Motorola  {

    constructor(portName, baudRate) {
        this.serialport = new SerialPort(portName, {
            baudRate: baudRate  
        });
        this.parser = this.serialport.pipe(new Readline({ delimiter: '\n' }));

        this.serialport.on('error', function(err) {
            console.error(err.message);
        });
    }

    // TODO: Make general parse method for results from terminal that don't need special treatment.

    // TODO: Implement timeout (Promise.race) and possibly retries

    getIssi() {
        //at+gmm (model)            = 5606,H63PCH6TZ7AN,43.8.0.0 (MT3250 rev1)
        //at+gnumf (issi)           = 0,2420109806101625
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+CNUMF?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let issi;
                    parser.on('data', (data) => { 
                        if (data.substr(0,7) === "+CNUMF:") {
                            let itsi = data.substr(8).split(",");
                            issi = itsi[1].substr(-8);
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(issi);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

    getModel() {
        //at+gmm (model)            = 5606,H63PCH6TZ7AN,43.8.0.0 (MT3250 rev1)
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+GMM?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let modelInfo;
                    parser.on('data', (data) => { 
                        if (data.substr(0,5) === "+GMM:") {
                            modelInfo = data.substr(6).split(",");
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(modelInfo);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

    getManufacturer() {
        //at+gmi (manufacturer)     = MOTOROLA
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+GMI?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let parsedData;
                    parser.on('data', (data) => { 
                        if (data.substr(0,5) === "+GMI:") {
                            parsedData = data.substr(6);
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(parsedData);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

    getSerialnumber() {
        //at+gsn (serial number)    = 893TPZA838  
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+GSN?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let parsedData;
                    parser.on('data', (data) => { 
                        if (data.substr(0,5) === "+GSN:") {
                            parsedData = data.substr(6);
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(parsedData);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }
    
    initializeTerminal() {
        //TODO: Set character set in terminal
        let parser = this.parser;
        return new Promise((resolve, reject) => {
            this.serialport.write('AT+CSCS=UCS2\r', function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                        parser.on('data', (data) => { 
                        if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve();
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            let errorCode = data.substr(12,2);
                            if (this.errorCodes[errorCode]) {
                                parser.removeAllListeners('data');
                                reject(this.errorCodes[errorCode]);
                            } else {
                                parser.removeAllListeners('data');
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    }); 
                }
            });
        });
    }

    // Displays message in radio termnial screen
    setDisplayMessage(title, message, timeout, icon) {
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            this.serialport.write(Buffer.from('AT+MCDNTN="' +  message + '","' + title + '",' + timeout +',' + icon + "\r"), function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                }
                else {
                    parser.on('data', (data) => { 
                        if (data.substr(0,2) === "OK") {
                            resolve();
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCode === 3) {
                                // Probably just radio locked, not an error
                                resolve();
                            }
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode :" +  errorCode);
                            }
                        } 
                    });
                }
            }); 
        });
    }

    // Retrieves signal strenght (RSSI) in dBm from terminal 
    getRSSI() {
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+CSQ?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let rssi;
                    parser.on('data', (data) => { 
                        if (data.substr(0,5) === "+CSQ:") {
                            let rssiData = data.substr(6).split(",");
                            rssi = dbSteps[rssiData[0]];
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(rssi);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

    // Retrieves location from terminals GPS
    getLocation() {
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+GPSPOS?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let locationData, location;
                    parser.on('data', (data) => { 
                        if (data.substr(0,8) === "+GPSPOS:") {
                            locationData = data.substr(9).split(',');
                            // TODO: Convert UTM to LatLon
                            let utmEasting = parseInt(locationData[2]);
                            let utmNorthing = parseInt(locationData[3]);
                            let utmZone= parseInt(locationData[1].substr(0,2));
                            let utmHemisphere = locationData[1].substr(2,1);
                            let latlon = utm.toLatLon(utmEasting, utmNorthing, utmZone, null, utmHemisphere=='N' ? true:false);
                            location = {
                                lat: 0.00,
                                lon: 0.00,
                                lat: latlon.latitude,
                                lon: latlon.longitude,
                                satellites: parseInt(locationData[4]),
                                timestamp: locationData[0],
                            };
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(location);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCode === 3) {
                                // Most probable couse is disabled GPS
                                reject(errorCodes[errorCode] + " - GPS is disabled");
                            }
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

    // Retrieves cell broadcast info (LA, Wide/LST, etc)
    getCellInfo() {
        let parser = this.parser;
        return new Promise((resolve,reject) => {
            var atString = 'AT+CTBCT?\r';
            this.serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let cellData, cell;
                    parser.on('data', (data) => { 
                        if (data.substr(0,7) === "+CTBCT:") {
                            cellData = data.substr(8).split(',');
                            cell = {
                                la: cellData[0],
                                service: cellData[1],
                                security: parseInt(cellData[2]),
                                sdstl: parseInt(cellData[3]),
                            }
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(cell);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            let errorCode = parseInt(data.substr(12,2));
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

    // Retrieves data on neighbour cells
    getNeighbourCells() {
        // TODO: Mulitline response from terminal
        return new Promise( function (resolve,reject) {
            var atString = 'AT+GCLI?\r';
            serialport.write(atString, function(err) {
                if (err) {
                    reject('Error on write: ', err.message);
                } else {
                    let locationData;
                    parser.on('data', (data) => { 
                        if (data.substr(0,8) === "+GCLI:") {
                            neighbourData = data.substr(9).split(',');
                        } else if (data.substr(0,2) === "OK") {
                            parser.removeAllListeners('data');
                            resolve(locationData);
                        } else if (data.substr(0,11) === "+CME ERROR:") {
                            parser.removeAllListeners('data');
                            errorCode = data.substr(12,2);
                            if (errorCodes[errorCode]) {
                                reject(errorCodes[errorCode]);
                            } else {
                                reject("Unknown errorcode " +  errorCode);
                            }
                        } 
                    });
                }
            });
        });
    }

}

return module.exports;