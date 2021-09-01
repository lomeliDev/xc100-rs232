const {
  XC100,
  dispensedBillsSlowWithRecord,
  dispensedBillsSlow,
  dispensedBillsPowerFul,
  dispensedBillsFastWithRecord,
  dispensedBillsFast
} = require('./src/index');

let serialPortConfig = {
  baudrate: 9600, // default: 9600
  databits: 8, // default: 8
  stopbits: 1, // default: 1
  parity: 'none' // default: 'none'
};

let xc = new XC100({
  debug: true, // default: false
  timeout: 5000 // default: 3000
});

xc.on('OPEN', () => {
  console.log('Port opened!');
});

xc.on('CLOSE', () => {
  console.log('Port closed!');
});

xc.on('RECEIVED', (result) => {
  console.log('RECEIVED');
  console.log(result);
});

xc.open('/dev/tty.usbserial-14410', serialPortConfig)
  .then(async() => {
    console.log('GO!!!');
    // return;

    console.log(await dispensedBillsSlowWithRecord(xc, 2));
    await xc.sleep(5000);
    console.log(await dispensedBillsSlow(xc, 2));
    await xc.sleep(5000);
    console.log(await dispensedBillsPowerFul(xc, 2));
    await xc.sleep(5000);
    console.log(await dispensedBillsFastWithRecord(xc, 2));
    await xc.sleep(5000);
    console.log(await dispensedBillsFast(xc, 2));

    await xc.command('CLEAR_ERROR_AND_COUNT');
    await xc.command('CLEAR_ERROR_RECORD');

    console.log('FINISH!!!');

  })
  .catch((error) => {
    console.log(error);
  });
