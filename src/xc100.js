const SerialPort = require('serialport');
const EventEmitter = require('events');
const commandList = require('./commands');

module.exports = class xc100 extends EventEmitter {
  constructor(param) {
    super();
    this.eventEmitter = new EventEmitter();
    this.debug = param.debug || false;
    this.timeout = param.timeout || 3000;
    this.currentCommand = null;
    this.enabled = false;
    this.powerUp = false;
    this.openPort = false;
    this.lastChannel = null;
    this.error = null;
    this.buffer = Buffer.alloc(10);
    this.bufferClean = new Array(10);
    this.bufferTotalDispensed = new Array(6);
    this.counterBytes = 0;
    this.totalDispensed = 0;
    this.countDispensed = 0;
    for (let i = 0; i < 10; i++) {
      this.buffer[i] = 0x00;
    }
  }

  restore() {
    try {
      this.currentCommand = null;
      this.enabled = false;
      this.powerUp = false;
      this.openPort = false;
      this.lastChannel = null;
      this.error = null;
      this.buffer = Buffer.alloc(10);
      this.bufferClean = new Array(10);
      this.bufferTotalDispensed = new Array(6);
      this.counterBytes = 0;
      this.totalDispensed = 0;
      this.countDispensed = 0;
      for (let i = 0; i < 10; i++) {
        this.buffer[i] = 0x00;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async sleep(ms) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  exec(code) {
    const buffer = Buffer.alloc(1);
    buffer[0] = code;
    return buffer;
  }

  intToBytes(number) {
    let n_1 = '0x30';
    let n_2 = '0x30';
    let n_3 = '0x30';
    let n = '000';
    number = '' + number;
    if (number > 0) {
      if (number.length === 1) {
        n = `00${number[0]}`;
      } else if (number.length === 2) {
        n = `0${number[0]}${number[1]}`;
      } else if (number.length === 3) {
        n = `${number[0]}${number[1]}${number[2]}`;
      }
    }
    n_1 = `0x3${n[0]}`;
    n_2 = `0x3${n[1]}`;
    n_3 = `0x3${n[2]}`;
    return [n_1, n_2, n_3];
  }

  BytesToInt(b0, b1, b2) {
    b0 = '' + b0;
    b1 = '' + b1;
    b2 = '' + b2;
    return parseInt(`${b0[1]}${b1[1]}${b2[1]}`);
  }

  totalBillRecord(byte) {
    return parseInt(`${byte[1]}${byte[3]}${byte[5]}${byte[7]}${byte[9]}${byte[11]}`);
  }

  createCode(b0, b1, b2, b3, b4, b5, b6, b7, b8, b9) {
    const buffer = Buffer.alloc(10);
    buffer[0] = b0;
    buffer[1] = b1;
    buffer[2] = b2;
    buffer[3] = b3;
    buffer[4] = b4;
    buffer[5] = b5;
    buffer[6] = b6;
    buffer[7] = b7;
    buffer[8] = b8;
    buffer[9] = b9;
    return buffer;
  }

  open(port, param = {}) {
    return new Promise((resolve, reject) => {
      try {
        this.port.close();
      } catch (error) { this.error = error; }

      this.port = new SerialPort(port, {
        baudRate: param.baudRate || 9600,
        databits: param.databits || 8,
        stopbits: param.stopbits || 1,
        parity: param.parity || 'none',
        autoOpen: true
      });

      const parser = this.port.pipe(
        new SerialPort.parsers.ByteLength({ length: 1 })
      );

      parser.on('data', (byte) => {

        if (byte.toString('hex') === '06' && this.counterBytes === 0) {
          this.counterBytes = 0;
          for (let i = 0; i < 10; i++) {
            this.buffer[i] = 0x00;
            this.bufferClean[i] = '0x00';
          }
          this.buffer[0] = 0x06;
        } else if (byte.toString('hex') === '02' && this.counterBytes === 0) {
          this.counterBytes = 0;
          for (let i = 0; i < 10; i++) {
            this.buffer[i] = 0x00;
            this.bufferClean[i] = '0x00';
          }
        }

        this.buffer[this.counterBytes] = `0x${byte.toString('hex')}`;
        this.bufferClean[this.counterBytes] = byte.toString('hex');
        this.counterBytes++;

        let checkEvent = false;

        if (this.currentCommand === 'ALL_BILL_RECORD') {


          if (byte.toString('hex') === '03' && this.bufferClean[3] === '79') {
            this.bufferTotalDispensed = new Array(6);
            this.bufferTotalDispensed[0] = this.bufferClean[6];
            this.bufferTotalDispensed[1] = this.bufferClean[7];
          } else if (byte.toString('hex') === '03' && this.counterBytes === 10 && this.bufferClean[3] === '7a') {
            this.bufferTotalDispensed[2] = this.bufferClean[4];
            this.bufferTotalDispensed[3] = this.bufferClean[5];
            this.bufferTotalDispensed[4] = this.bufferClean[6];
            this.bufferTotalDispensed[5] = this.bufferClean[7];
            this.counterBytes = 0;
            for (let i = 0; i < 10; i++) {
              this.buffer[i] = 0x00;
              this.bufferClean[i] = '0x00';
            }
            for (let i = 0; i < 6; i++) {
              this.buffer[i] = `0x${this.bufferTotalDispensed[i]}`;
            }
            checkEvent = true;
          }
        }

        if (this.currentCommand !== 'DISPENSED' && this.currentCommand !== 'ALL_BILL_RECORD') {
          if (byte.toString('hex') === '06') {
            this.emit('RECEIVED', this.buffer);
            checkEvent = true;
            this.counterBytes = 0;
          } else if (byte.toString('hex') === '03') {
            this.emit('RECEIVED', this.buffer);
            checkEvent = true;
            this.counterBytes = 0;
          }
        }

        if (this.currentCommand === 'DISPENSED') {
          if (byte.toString('hex') === '03' && this.bufferClean[3] === '62') {
            this.emit('RECEIVED', this.buffer);
            checkEvent = true;
          }
        }

        if (this.currentCommand !== null && checkEvent) {
          this.counterBytes = 0;
          try {
            this.eventEmitter.emit(
              this.currentCommand,
              this.buffer
            );
          } catch (error) {
            this.eventEmitter.emit(this.currentCommand, null);
          }
        }

        if (this.counterBytes === 10) {
          this.counterBytes = 0;
        }

        if (byte.toString('hex') === '06' && this.counterBytes === 1) {
          this.counterBytes = 0;
        }

      });

      this.port.on('error', (error) => {
        reject(error);
        this.emit('CLOSE');
        this.restore();
      });

      this.port.on('close', (error) => {
        reject(error);
        this.emit('CLOSE');
        this.restore();
      });

      this.port.on('open', () => {
        resolve();
        this.emit('OPEN');
        this.openPort = true;
        this.enabled = true;
      });
    });
  }

  close() {
    if (this.port !== undefined) {
      this.port.close();
    }
  }

  command(command) {
    this.currentCommand = null;
    this.counterBytes = 0;
    return new Promise((resolve) => {
      this.currentCommand = command;
      this.port.write(commandList[command].code);
      this.port.drain(() => {
        return resolve(this.newEvent(command));
      });
    }).then((res) => {
      return res;
    });
  }

  commandHex(command, buffer) {
    this.currentCommand = null;
    this.counterBytes = 0;
    return new Promise((resolve) => {
      this.currentCommand = command;
      this.port.write(buffer);
      this.port.drain(() => {
        return resolve(this.newEvent(command));
      });
    }).then((res) => {
      return res;
    });
  }

  newEvent(command) {
    return new Promise((resolve) => {
      this.eventEmitter.once(command, (buffer) => {
        if (buffer !== null) {
          try {
            resolve({
              success: true,
              command: command,
              info: buffer
            });
          } catch (error) {
            resolve({
              success: false,
              command: command,
              info: {}
            });
          }
        } else {
          resolve({
            success: false,
            command: command,
            info: {}
          });
        }
      });
    }).then(
      (res) =>
        new Promise((resolve) => {
          resolve(res);
        })
    );
  }

};
