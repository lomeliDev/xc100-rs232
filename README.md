# XC100 bill dispenser

Node.JS library for TOP Vending Machine XC100 bill dispenser

**Supported devices:** XC100

## Installation

Install from npm:

```bash
npm install xc100-rs232
```


```js
const { XC100 } = require('xc100-rs232');

let xc = new XC100({
  debug: true,
  timeout: 5000
});
```

## Methods
All methods use Promise
- ```xc.open('COM1')``` - Connect device
- ```xc.close()``` - Disconnect device
- ```xc.command('COMMAND_NAME')``` - Execute command and get answer
- ```xc.commandHex('COMMAND_NAME', Buffer HEX)``` - Execute command and get answer
- ```xc.enabled``` - Dispenser status
- ```xc.openPort``` - Port status

## Command
```js
await xc.command('CLEAR_ERROR_AND_COUNT')
.then(result => {
    console.log(result)
    return;
})

await xc.command('POWERFUL_OUT_BILL')
```
See [all supported commands](#supported-commands)


## Event
```js
xc.on('RECEIVED', result => {
    console.log(result)
})
```
See [all supported events](#supported-events)


## Example
```js
const {
  XC100,
  dispensedBillsSlowWithRecord,
  dispensedBillsSlow,
  dispensedBillsPowerFul,
  dispensedBillsFastWithRecord,
  dispensedBillsFast
} = require('xc100-rs232');

let serialPortConfig = {
  baudrate: 9600,
  databits: 8,
  stopbits: 1,
  parity: 'none'
};

let xc = new XC100({
  debug: true,
  timeout: 5000
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

```

### Supported Commands:

Command name						|	Information return	|	Need promise	|	Description
------------------------------------|-------------------|-----------------------|-------------------
[CLEAR_COUNT](#CLEAR_COUNT)				|	**yes**	|	**yes**	|	Cleans the dispensed bill counter
[CLEAR_ERROR](#CLEAR_ERROR)	|	**yes**	|	**yes**	|	Clean dispenser errors
[CLEAR_ERROR_AND_COUNT](#CLEAR_ERROR_AND_COUNT)	|	**yes**	|	**yes**	|	Clears dispenser counter and errors
[KEY_DISABLE](#KEY_DISABLE)			|	**yes**	|	**yes**	|	Disable the key
[KEY_ENABLE](#KEY_ENABLE)					|	**yes**	|	**yes**	|	Enable the key
[STATUS](#STATUS)					|	**yes**	|	**yes**	|	Returns device status
[ERROR_RECORD](#ERROR_RECORD)					|	**yes**	|	**yes**	|	Returns device errors
[CLEAR_ERROR_RECORD](#CLEAR_ERROR_RECORD)					    |	**yes**	|	**yes**	|	Clean up the bugs
[TOTAL_COUNT](#TOTAL_COUNT)					    |	**yes**	|	**yes**	|	Returns the total number of tickets dispensed
[PASSWORD_ENABLE](#PASSWORD_ENABLE)					    |	**yes**	|	**yes**	|	Enable the password
[PASSWORD_DISABLE](#PASSWORD_DISABLE)					    |	**yes**	|	**yes**	|	Disable the password
[POWERFUL_OUT_BILL](#POWERFUL_OUT_BILL)					    |	**yes**	|	**yes**	|	Powerful invoice
[ALL_BILL_RECORD](#ALL_BILL_RECORD)					    |	**yes**	|	**yes**	|	Returns the total number of tickets dispensed in their entire life

### Example commands with options:

###### CLEAR_COUNT
```js
xc.command('CLEAR_COUNT').then((result) => console.log(result););
```
###### CLEAR_ERROR
```js
xc.command('CLEAR_ERROR').then((result) => console.log(result););
```
###### CLEAR_ERROR_AND_COUNT
```js
xc.command('CLEAR_ERROR_AND_COUNT').then((result) => console.log(result););
```
###### KEY_DISABLE
```js
xc.command('KEY_DISABLE').then((result) => console.log(result););
```
###### KEY_ENABLE
```js
xc.command('KEY_ENABLE').then((result) => console.log(result););
```
###### STATUS
```js
xc.command('STATUS').then((result) => console.log(result););
```
###### ERROR_RECORD
```js
xc.command('ERROR_RECORD').then((result) => console.log(result););
```
###### CLEAR_ERROR_RECORD
```js
xc.command('CLEAR_ERROR_RECORD').then((result) => console.log(result););
```
###### TOTAL_COUNT
```js
xc.command('TOTAL_COUNT').then((result) => console.log(result););
```
###### PASSWORD_ENABLE
```js
xc.command('PASSWORD_ENABLE').then((result) => console.log(result););
```
###### PASSWORD_DISABLE
```js
xc.command('PASSWORD_DISABLE').then((result) => console.log(result););
```
###### POWERFUL_OUT_BILL
```js
xc.command('POWERFUL_OUT_BILL').then((result) => console.log(result););
```
###### ALL_BILL_RECORD
```js
xc.command('ALL_BILL_RECORD').then((result) => console.log(result););
```

### Supported Events:

Event name							|   Description
------------------------------------|------------------
OPEN								    |	Event that detects that the device was opened successfully
CLOSE								    |	Event that detects that the device was closed
RECEIVED							  |	Receive a 10-byte buffer with the response of the last command

## Errors and contributions

For an error write the problem directly on github issues or submit it
to the mail miguel@lomeli.io. If you want to contribute to the project please send an email.

#xc100 , #BillDispenser , #Bill Dispenser , #TOP Vending Machine
