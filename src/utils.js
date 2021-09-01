const checksum = require('./checksums');
const chalk = require('chalk');

const billRecord = async(xc) => {
  let xBillRecord = 0;
  let totalRecord = 0;
  while (xBillRecord < 5) {
    await xc.command('ALL_BILL_RECORD').then(async(r) => {
      const b = r.info.toString('hex');
      if (b[0] === '0' && b[1] === '2' && b[18] === '0' && b[19] === '3') {
        await xc.sleep(1000);
      } else {
        totalRecord = xc.totalBillRecord(b);
        xBillRecord = 100;
      }
      xBillRecord++;
    });
  }
  return totalRecord;
};

const dispensedBillsSlowWithRecord = async(xc, total) => {
  await xc.command('CLEAR_ERROR_AND_COUNT');
  await xc.command('CLEAR_ERROR_RECORD');
  const totalRecord = await billRecord(xc);
  let totalRecordWithDispensed = totalRecord;
  xc.totalDispensed = total;
  xc.countDispensed = 0;
  let attempts = 0;
  let statusDispensed = null;

  while (xc.countDispensed < xc.totalDispensed) {
    xc.debug &&
      console.log(
        `\n\nDispensing banknote number : ${chalk.yellow(
          xc.countDispensed
        )} - ${chalk.green(totalRecord)} - ${chalk.blue(
          totalRecordWithDispensed
        )}\n`
      );

    if (attempts >= 5) {
      statusDispensed = {
        success: false,
        command: 'DISPENSED',
        total: xc.totalDispensed,
        dispensed: xc.countDispensed
      };
      break;
    }

    const bytesDispensed = xc.intToBytes(1);
    const codeDispensed = xc.createCode(
      0x02,
      0x30,
      0x30,
      0x42,
      0x30,
      bytesDispensed[0],
      bytesDispensed[1],
      bytesDispensed[2],
      checksum[1],
      0x03
    );

    await xc
      .commandHex('DISPENSED', codeDispensed)
      .then(async(r) => {
        const bS = r.info.toString('hex');
        const totalDispensedOne = xc.BytesToInt(
          `${bS[10]}${bS[11]}`,
          `${bS[12]}${bS[13]}`,
          `${bS[14]}${bS[15]}`
        );

        if (totalDispensedOne === 0) {
          await xc.command('CLEAR_ERROR');
          await xc.command('CLEAR_ERROR_RECORD');
          await xc.command('POWERFUL_OUT_BILL');
          attempts++;
          await xc.sleep(2000);
        }

        totalRecordWithDispensed = await billRecord(xc);
        xc.countDispensed = totalRecordWithDispensed - totalRecord;

        if (xc.countDispensed >= xc.totalDispensed) {
          statusDispensed = {
            success: true,
            command: 'DISPENSED',
            total: xc.totalDispensed,
            dispensed: xc.countDispensed
          };
        }
      })
      .catch((e) => {
        xc.error = e;
        statusDispensed = {
          success: false,
          command: 'DISPENSED',
          total: this.totalDispensed,
          dispensed: this.countDispensed
        };
      });
  }

  return statusDispensed;
};

const dispensedBillsSlow = async(xc, total) => {
  await xc.command('CLEAR_ERROR_AND_COUNT');
  await xc.command('CLEAR_ERROR_RECORD');
  xc.totalDispensed = total;
  xc.countDispensed = 0;
  let attempts = 0;
  let statusDispensed = null;

  while (xc.countDispensed < xc.totalDispensed) {
    xc.debug &&
      console.log(
        `\n\nDispensing banknote number : ${chalk.yellow(xc.countDispensed)}\n`
      );

    if (attempts >= this.totalDispensed) {
      statusDispensed = {
        success: false,
        command: 'DISPENSED',
        total: this.totalDispensed,
        dispensed: this.countDispensed
      };
      break;
    }

    const bytesDispensed = xc.intToBytes(1);
    const codeDispensed = xc.createCode(
      0x02,
      0x30,
      0x30,
      0x42,
      0x30,
      bytesDispensed[0],
      bytesDispensed[1],
      bytesDispensed[2],
      checksum[1],
      0x03
    );

    await xc
      .commandHex('DISPENSED', codeDispensed)
      .then(async(r) => {
        const bS = r.info.toString('hex');
        const totalDispensedOne = xc.BytesToInt(
          `${bS[10]}${bS[11]}`,
          `${bS[12]}${bS[13]}`,
          `${bS[14]}${bS[15]}`
        );
        xc.countDispensed += totalDispensedOne;

        if (totalDispensedOne === 0) {
          await xc.command('CLEAR_ERROR');
          await xc.command('CLEAR_ERROR_RECORD');
          await xc.command('POWERFUL_OUT_BILL');
          xc.countDispensed++;
        }

        if (xc.countDispensed >= xc.totalDispensed) {
          statusDispensed = {
            success: true,
            command: 'DISPENSED',
            total: xc.totalDispensed,
            dispensed: xc.countDispensed
          };
        }
      })
      .catch((e) => {
        xc.error = e;
        statusDispensed = {
          success: false,
          command: 'DISPENSED',
          total: xc.totalDispensed,
          dispensed: xc.countDispensed
        };
      });

    attempts++;
  }

  return statusDispensed;
};

const dispensedBillsPowerFul = async(xc, total) => {
  await xc.command('CLEAR_ERROR_AND_COUNT');
  await xc.command('CLEAR_ERROR_RECORD');
  xc.totalDispensed = total;
  xc.countDispensed = 0;
  let statusDispensed = null;

  while (xc.countDispensed < xc.totalDispensed) {
    await xc.command('POWERFUL_OUT_BILL');
    xc.countDispensed++;
  }

  statusDispensed = {
    success: true,
    command: 'DISPENSED',
    total: xc.totalDispensed,
    dispensed: xc.countDispensed
  };

  return statusDispensed;
};

const dispensedBillsFastWithRecord = async(xc, total) => {
  await xc.command('CLEAR_ERROR_AND_COUNT');
  await xc.command('CLEAR_ERROR_RECORD');
  const totalRecord = await billRecord(xc);
  let totalRecordWithDispensed = totalRecord;
  xc.totalDispensed = total;
  xc.countDispensed = 0;
  let totalToDispensed = xc.totalDispensed;
  let attempts = 0;
  let statusDispensed = null;

  while (xc.countDispensed < xc.totalDispensed) {
    xc.debug &&
      console.log(
        `\n\nDispensing banknote number : ${chalk.yellow(
          xc.countDispensed
        )} - ${chalk.green(totalRecord)} - ${chalk.blue(
          totalRecordWithDispensed
        )}\n`
      );

    if (attempts >= 5) {
      statusDispensed = {
        success: false,
        command: 'DISPENSED',
        total: xc.totalDispensed,
        dispensed: xc.countDispensed
      };
      break;
    }

    const bytesDispensed = xc.intToBytes(totalToDispensed);
    const codeDispensed = xc.createCode(
      0x02,
      0x30,
      0x30,
      0x42,
      0x30,
      bytesDispensed[0],
      bytesDispensed[1],
      bytesDispensed[2],
      checksum[totalToDispensed],
      0x03
    );

    await xc
      .commandHex('DISPENSED', codeDispensed)
      .then(async(r) => {
        const bS = r.info.toString('hex');
        const totalDispensedOne = xc.BytesToInt(
          `${bS[10]}${bS[11]}`,
          `${bS[12]}${bS[13]}`,
          `${bS[14]}${bS[15]}`
        );

        if (totalDispensedOne === 0) {
          await xc.command('CLEAR_ERROR');
          await xc.command('CLEAR_ERROR_RECORD');
          await xc.command('POWERFUL_OUT_BILL');
          attempts++;
          await xc.sleep(2000);
        }

        totalRecordWithDispensed = await billRecord(xc);
        xc.countDispensed = totalRecordWithDispensed - totalRecord;
        totalToDispensed = xc.totalDispensed - xc.countDispensed;

        if (xc.countDispensed >= xc.totalDispensed) {
          statusDispensed = {
            success: true,
            command: 'DISPENSED',
            total: xc.totalDispensed,
            dispensed: xc.countDispensed
          };
        }
      })
      .catch((e) => {
        xc.error = e;
        statusDispensed = {
          success: false,
          command: 'DISPENSED',
          total: xc.totalDispensed,
          dispensed: xc.countDispensed
        };
      });
  }

  if (statusDispensed === null) {
    statusDispensed = {
      success: false,
      command: 'DISPENSED',
      total: xc.totalDispensed,
      dispensed: xc.countDispensed
    };
  }

  return statusDispensed;
};

const dispensedBillsFast = async(xc, total) => {
  await xc.command('CLEAR_ERROR_AND_COUNT');
  await xc.command('CLEAR_ERROR_RECORD');
  xc.totalDispensed = total;
  xc.countDispensed = 0;
  let totalToDispensed = xc.totalDispensed;
  let attempts = 0;
  let statusDispensed = null;

  while (xc.countDispensed < xc.totalDispensed) {
    xc.debug &&
      console.log(
        `\n\nDispensing banknote number : ${chalk.yellow(xc.countDispensed)}\n`
      );

    if (attempts >= 5) {
      statusDispensed = {
        success: false,
        command: 'DISPENSED',
        total: xc.totalDispensed,
        dispensed: xc.countDispensed
      };
      break;
    }

    const bytesDispensed = xc.intToBytes(totalToDispensed);
    const codeDispensed = xc.createCode(
      0x02,
      0x30,
      0x30,
      0x42,
      0x30,
      bytesDispensed[0],
      bytesDispensed[1],
      bytesDispensed[2],
      checksum[totalToDispensed],
      0x03
    );

    await xc
      .commandHex('DISPENSED', codeDispensed)
      .then(async(r) => {
        const bS = r.info.toString('hex');
        xc.countDispensed += xc.BytesToInt(
          `${bS[10]}${bS[11]}`,
          `${bS[12]}${bS[13]}`,
          `${bS[14]}${bS[15]}`
        );
        if (xc.countDispensed >= xc.totalDispensed) {
          statusDispensed = {
            success: true,
            command: 'DISPENSED',
            total: xc.totalDispensed,
            dispensed: xc.countDispensed
          };
        } else {
          await xc.command('CLEAR_ERROR');
          await xc.command('CLEAR_ERROR_RECORD');
          await xc.command('POWERFUL_OUT_BILL');
          xc.countDispensed++;
          await xc.sleep(2000);
          totalToDispensed = xc.totalDispensed - xc.countDispensed;
        }
      })
      .catch((e) => {
        xc.error = e;
        statusDispensed = {
          success: false,
          command: 'DISPENSED',
          total: xc.totalDispensed,
          dispensed: xc.countDispensed
        };
      });
    attempts++;
  }

  if (statusDispensed === null) {
    statusDispensed = {
      success: false,
      command: 'DISPENSED',
      total: xc.totalDispensed,
      dispensed: xc.countDispensed
    };
  }

  return statusDispensed;
};

module.exports = {
  billRecord: billRecord,
  dispensedBillsSlowWithRecord: dispensedBillsSlowWithRecord,
  dispensedBillsSlow: dispensedBillsSlow,
  dispensedBillsPowerFul: dispensedBillsPowerFul,
  dispensedBillsFastWithRecord: dispensedBillsFastWithRecord,
  dispensedBillsFast: dispensedBillsFast
};
