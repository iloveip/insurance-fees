import expect from 'expect'

import Fees from 'src/index'

describe('Module tests', () => {
  it('OPS 01.03.2020–31.12.2020 COVID 16931.67', () => {
    expect(Fees.getPFRFixedFee(2020, ["01.03.2020", "31.12.2020"], true)).toEqual(16931.67)
  })
  it('OMS 01.03.2020–31.12.2020 7021.67', () => {
    expect(Fees.getFFOMSFee(2020, ["01.03.2020", "31.12.2020"])).toEqual(7021.67)
  })
  it('OPS 1 % 01.03.2020–31.12.2020 200m 232544.00', () => {
    expect(Fees.getPFROnePercentFee(2020, ["01.03.2020", "31.12.2020"], 200000000)).toEqual(232544.00)
  })
  it('OPS 1 % 01.01.2020–31.12.2020 10m 97000.00', () => {
    expect(Fees.getPFROnePercentFee(2020, ["01.01.2020", "31.12.2020"], 10000000)).toEqual(97000.00)
  })
  it('OPS 1 % 01.03.2020–31.12.2020 COVID 200m 242652.33', () => {
    expect(Fees.getPFROnePercentFee(2020, ["01.03.2020", "31.12.2020"], 200000000, true)).toEqual(242652.33)
  })
})
