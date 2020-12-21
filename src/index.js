import moment from "moment"

// Does rounding
// 123.456 -> 123.46
function money(value) {
  return parseFloat(value.toFixed(2))
}

/*

Взносы с 2018 по 2020 гг.

Взносы в ПФР за год в фиксированном размере (PFRfix)

2018 — 26545
2019 — 29354
2020 — 32448

Взносы в ФФОМС за год в фиксированном размере (FFOMSfix)

2018 — 5840
2019 — 6884
2020 — 8426

Максимальная сумма взносов в ПФР (включая фиксированную часть и дополнительный 1 %):

PFRmax = PFRfix * 8

Фиксированные взносы за неполный год:

ПФР = PFRfix / 12 * М + PFRfix / 12 * Д1 / Д2,
ФФОМС = FFOMSfix / 12 * М + FFOMSfix / 12 * Д1 / Д2, где

М — количество полных месяцев,
Д1 — количество отработанных дней в месяце,
Д2 — общее количество календарных дней в месяце.

Взносы с 2014 по 2017 гг.

Расчётный год, МРОТ:
2017 - 7500
2016 — 6204
2015 — 5965
2014 — 5554

Тарифы:
ПФР — 0,26 (фиксированная часть)
ПФР — 0,01 (дополнительный 1 %)
ФФОМС — 0,051

Фиксированные взносы в месяц:
ПФР = МРОТ * 0,26
ФФОМС = МРОТ * 0,051

Фиксированные взносы за полный год:
ПФР = МРОТ * 0,26 * 12
ФФОМС = МРОТ * 0,051 * 12

Фиксированные взносы за неполный год:
ПФР = МРОТ * 0,26 * М + МРОТ * 0,26 * Д1 / Д2,
ФФОМС = МРОТ * 0,051 * М + МРОТ * 0,051 * Д1 / Д2, где

М — количество полных месяцев,
Д1 — количество отработанных дней в месяце,
Д2 — общее количество календарных дней в месяце.

Дополнительный 1 % в ПФР:
(Доход - 300 000) * 0,01

Максимальная сумма взносов в ПФР (включая фиксированную часть и дополнительный 1 %):
Max ПФР = 8 * МРОТ * 0,26 * 12

*/

export default class Fees {
  static PFRMonthlyFixedFeesRate = 0.26
  static FFOMSMonthlyFixedFeesRate = 0.051

  static getMROT(year) {
    return {
      2017: 7500,
      2016: 6204,
      2015: 5965,
      2014: 5554
    }[year]
  }

  static getPFRFixedFees(year) {
    return {
      2023: 36723,
      2022: 34445,
      2021: 32448,
      2020: 32448,
      2019: 29354,
      2018: 26545
    }[year]
  }

  static getFFOMSFixedFees(year) {
    return {
      2023: 9119,
      2022: 8766,
      2021: 8426,
      2020: 8426,
      2019: 6884,
      2018: 5840
    }[year]
  }

  static getMaxPFRTotalFee(year) {
    if (year <= 2017) {
      return money(this.getMROT(year) * 8 * 0.26 * 12)
    } else {
      return 8 * this.getPFRFixedFees(year)
    }
  }

  static getPFRFixedFee(year, period, covid = false) {
    let fees = null

    if (year <= 2017) {
      fees = this.getMROT(year) * this.PFRMonthlyFixedFeesRate * 12
    } else {
      // Update for COVID in 2020
      if (covid === true) {
        fees = this.getPFRFixedFees(year) - 12130
      } else {
        fees = this.getPFRFixedFees(year)
      }
    }

    if (period && period.length) {
      fees *= this.getWorkingDaysFactor(...period)
    }

    return money(fees)
  }

  static getFFOMSFee(year, period) {
    let fees = null

    if (year <= 2017) {
      fees = this.getMROT(year) * this.FFOMSMonthlyFixedFeesRate * 12
    } else {
      fees = this.getFFOMSFixedFees(year)
    }

    if (period && period.length) {
      fees *= this.getWorkingDaysFactor(...period)
    }
    return money(fees)
  }

  static getWorkingDaysFactor(d1, d2) {
    const date1 = moment(d1, "DD.MM.YYYY")
    const date2 = moment(d2, "DD.MM.YYYY")

    const date1MonthDaysCount = moment(date1)
      .endOf("month")
      .date()
    const date2MonthDaysCount = moment(date2)
      .endOf("month")
      .date()

    const date1IsStartOfTheMonth = date1.date() === 1
    const date2IsEndOthTheMonth = date2MonthDaysCount === date2.date()

    // Full year

    if (date1IsStartOfTheMonth && date1.month() === 0 && date2IsEndOthTheMonth && date2.month() === 11) {
      return 1
    }
    let factor = 0
    if (date1.month() === date2.month()) {
      // Full month
      if (date1IsStartOfTheMonth && date2IsEndOthTheMonth) {
        return 1 / 12
      }
      const working_days = date2.diff(date1, "days") + 1
      factor = working_days / date1MonthDaysCount / 12
    } else {
      const date1WorkingDaysCount = date1MonthDaysCount - date1.date() + 1
      factor += date1IsStartOfTheMonth ? 1 : date1WorkingDaysCount / date1MonthDaysCount
      factor += date2IsEndOthTheMonth ? 1 : date2.date() / date2MonthDaysCount
      factor += date2.month() - date1.month() - 1
      factor /= 12
    }

    return factor
  }

  static getPFROnePercentFee(year, period, amount, covid = false) {
    const PFRPercentFee = money(Math.max(0, amount - 300000) * 0.01)
    const PFRFixedFee = this.getPFRFixedFee(year, period, covid)
    const PFRTotalFee = PFRPercentFee + PFRFixedFee
    const maxPFRTotalFee = this.getMaxPFRTotalFee(year)

    if (PFRTotalFee > maxPFRTotalFee) {
      return money(maxPFRTotalFee - PFRFixedFee)
    }
    return PFRPercentFee
  }
}
