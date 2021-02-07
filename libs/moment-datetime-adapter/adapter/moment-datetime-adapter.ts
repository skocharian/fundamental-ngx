import { Inject, Injectable, InjectionToken, LOCALE_ID, Optional } from '@angular/core';
import { DatetimeAdapter } from '@fundamental-ngx/core';

import moment, { Moment, MomentFormatSpecification, MomentInput } from 'moment';

function range<T>(length: number, mapFn: (index: number) => T): T[] {
    return Array.from(new Array(length)).map((_, index) => mapFn(index));
}

export interface MomentDateTimeAdapterOptions {
    strict?: boolean;
    useUtc?: boolean;
}

export const MOMENT_DATE_TIME_ADAPTER_OPTIONS = new InjectionToken<MomentDateTimeAdapterOptions>(
    'MOMENT_DATE_TIME_ADAPTER_OPTIONS', {
        providedIn: 'root',
        factory: MOMENT_DATE_TIME_ADAPTER_OPTIONS_FACTORY
    }
);

export function MOMENT_DATE_TIME_ADAPTER_OPTIONS_FACTORY(): MomentDateTimeAdapterOptions {
    return {
        useUtc: false,
        strict: false
    };
}

@Injectable()
export class MomentDatetimeAdapter extends DatetimeAdapter<Moment> {

    private _localeData: {
        firstDayOfWeek: number,
        longMonths: string[],
        shortMonths: string[],
        narrowMonths: string[],
        longDaysOfWeek: string[],
        shortDaysOfWeek: string[],
        narrowDaysOfWeek: string[]
    };

    constructor(
        @Optional() @Inject(LOCALE_ID) localeId: string,
        @Optional() @Inject(MOMENT_DATE_TIME_ADAPTER_OPTIONS) private _options?: MomentDateTimeAdapterOptions
    ) {
        super();

        this.setLocale(localeId || moment.locale());
    }

    setLocale(locale: string): void {
        super.setLocale(locale);

        const momentLocaleData = moment.localeData(locale);
        this._localeData = {
            firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
            longMonths: momentLocaleData.months(),
            shortMonths: momentLocaleData.monthsShort(),
            narrowMonths: momentLocaleData.months().map((name: string) => name.charAt(0)),
            longDaysOfWeek: momentLocaleData.weekdays(),
            shortDaysOfWeek: momentLocaleData.weekdaysShort(),
            narrowDaysOfWeek: momentLocaleData.weekdaysMin()
        };
    }

    getYear(date: Moment): number {
        return this.clone(date).year();
    };

    getMonth(date: Moment): number {
        return this.clone(date).month();
    };

    getDate(date: Moment): number {
        return this.clone(date).date();
    };

    getDayOfWeek(date: Moment): number {
        return this.clone(date).day();
    };

    getHours(date: Moment): number {
        return this.clone(date).hours();
    };

    getMinutes(date: Moment): number {
        return this.clone(date).minutes();
    };

    getSeconds(date: Moment): number {
        return this.clone(date).seconds();
    };

    setHours(date: Moment, hours: number): Moment {
        return this.clone(date).hours(hours);
    };

    setMinutes(date: Moment, minutes: number): Moment {
        return this.clone(date).minutes(minutes);
    };

    setSeconds(date: Moment, seconds: number): Moment {
        return this.clone(date).seconds(seconds);
    };

    getWeekNumber(date: Moment): number {
        return this.clone(date).week();
    };

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
        switch (style) {
            case 'narrow':
                return this._localeData.narrowMonths;
            case 'short':
                return this._localeData.shortMonths;
            case 'long':
            default:
                return this._localeData.longMonths;
        }
    };

    getDateNames(): string[] {
        return range(31, (i) => this.createDate(2017, 0, i + 1).format('D'));
    };

    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        switch (style) {
            case 'narrow':
                return this._localeData.narrowDaysOfWeek;
            case 'short':
                return this._localeData.shortDaysOfWeek;
            case 'long':
            default:
                return this._localeData.longDaysOfWeek;
        }
    };

    getYearName(date: Moment): string {
        return this.clone(date).format('YYYY');
    };

    getWeekName(date: Moment): string {
        return this.clone(date).week().toLocaleString(this.locale);
    };

    getHourNames({ meridian, twoDigit }: { twoDigit: boolean; meridian: boolean }): string[] {
        const format: string = meridian ? (twoDigit ? 'hh' : 'h') : (twoDigit ? 'HH' : 'H');
        const momentDate = this._createMomentDate();

        return range(24, (i) => {
            return this.clone(momentDate).hour(i).format(format);
        });
    };

    getMinuteNames({ twoDigit }: { twoDigit: boolean }): string[] {
        const format: string = twoDigit ? 'mm' : 'm';
        const momentDate = this._createMomentDate();

        return range(60, (i) => {
            return this.clone(momentDate).minute(i).format(format);
        });
    };

    getSecondNames({ twoDigit }: { twoDigit: boolean }): string[] {
        const format: string = twoDigit ? 'ss' : 's';
        const momentDate = this._createMomentDate();

        return range(60, (i) => {
            return this.clone(momentDate).second(i).format(format);
        });
    };

    getDayPeriodNames(): [string, string] {
        console.log('here');

        return ['', ''];
    };

    getFirstDayOfWeek(): number {
        return this._localeData.firstDayOfWeek;
    };

    getNumDaysInMonth(date: Moment): number {
        return this.clone(date).daysInMonth();
    };

    parse(value: any, parseFormat: MomentFormatSpecification = ''): Moment | null {
        if (value && typeof value === 'string') {
            return this._createMomentDate(value, parseFormat, this.locale);
        }

        return value ? this._createMomentDate(value).locale(this.locale) : null;
    };

    format(date: Moment, displayFormat: string): string {
        date = this.clone(date);

        if (!this.isValid(date)) {
            throw Error('MomentDateTimeAdapter: Cannot format invalid date.');
        }

        return date.format(displayFormat);
    };

    createDate(year: number, month: number, date: number): Moment {
        if (month < 0 || month > 11) {
            throw Error(`Invalid month index "${ month }". Month index has to be between 0 and 11.`);
        }

        if (date < 1) {
            throw Error(`Invalid date "${ date }". Date has to be greater than 0.`);
        }

        const result = this._createMomentDate({ year: year, month: month, date: date }).locale(this.locale);

        if (!result.isValid()) {
            throw Error(`Invalid date "${ date }" for month with index "${ month }".`);
        }

        return result;
    };

    today(): Moment {
        return this._createMomentDate()
            .locale(this.locale)
            .startOf('day');
    };

    now(): Moment {
        return this._createMomentDate().locale(this.locale);
    };

    addCalendarYears(date: Moment, years: number): Moment {
        return this.clone(date).add({ years: years });
    };

    addCalendarMonths(date: Moment, months: number): Moment {
        return this.clone(date).add({ months: months });
    };

    addCalendarDays(date: Moment, days: number): Moment {
        return this.clone(date).add({ days: days });
    };

    getAmountOfWeeks(year: number, month: number, firstDayOfWeek: number): number {
        return null;
    };

    clone(date: Moment): Moment {
        return date.clone().locale(this.locale);
    };

    datesEqual(date1: Moment, date2: Moment): boolean {
        if (!date1 || !date2) {
            return false;
        }

        return date1.isSame(date2, 'day');
    };

    dateTimesEqual(date1: Moment, date2: Moment): boolean {
        if (!date1 || !date2) {
            return false;
        }

        return date1.isSame(date2);
    };

    isBetween(dateToCheck: Moment, startDate: Moment, endDate: Moment): boolean {
        if (!dateToCheck || !startDate || !endDate) {
            return false;
        }

        return dateToCheck.isBetween(startDate, endDate);
    };

    isValid(date: Moment): boolean {
        return this.clone(date).isValid();
    };

    toIso8601(date: Moment): string {
        return this.clone(date).format();
    };

    isTimeFormatIncludesDayPeriod(displayFormat: string): boolean {
        return !!displayFormat.match(/[aA]/);
    };

    isTimeFormatIncludesHours(displayFormat: string): boolean {
        return !!displayFormat.match(/[hH]/);
    };

    isTimeFormatIncludesMinutes(displayFormat: string): boolean {
        return !!displayFormat.match(/[m]/);
    };

    isTimeFormatIncludesSeconds(displayFormat: string): boolean {
        return !!displayFormat.match(/[s]/);
    };

    _createMomentDate(
        date?: MomentInput,
        format?: MomentFormatSpecification,
        locale?: string,
    ): Moment {
        const { strict, useUtc }: MomentDateTimeAdapterOptions = this._options || {};

        return useUtc
            ? moment.utc(date, format, locale, strict)
            : moment(date, format, locale, strict);
    }
}
