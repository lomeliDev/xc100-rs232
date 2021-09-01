const XC100 = require('./xc100');
const {
  billRecord,
  dispensedBillsSlowWithRecord,
  dispensedBillsSlow,
  dispensedBillsPowerFul,
  dispensedBillsFastWithRecord,
  dispensedBillsFast
} = require('./utils');

module.exports = {
  XC100: XC100,
  billRecord: billRecord,
  dispensedBillsSlowWithRecord: dispensedBillsSlowWithRecord,
  dispensedBillsSlow: dispensedBillsSlow,
  dispensedBillsPowerFul: dispensedBillsPowerFul,
  dispensedBillsFastWithRecord: dispensedBillsFastWithRecord,
  dispensedBillsFast: dispensedBillsFast
};
