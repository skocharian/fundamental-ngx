import { NgModule } from '@angular/core';
import {
    DATE_TIME_FORMATS,
    DatetimeAdapter
} from '@fundamental-ngx/core';

import { MomentDatetimeAdapter } from './moment-datetime-adapter';
import { MOMENT_DATETIME_FORMATS } from './moment-datetime-formats';

export * from './moment-datetime-adapter';

@NgModule({
    providers: [{ provide: DatetimeAdapter, useClass: MomentDatetimeAdapter }]
})
export class MomentDateTimeAdapterModule {}

@NgModule({
    imports: [MomentDateTimeAdapterModule],
    providers: [{ provide: DATE_TIME_FORMATS, useValue: MOMENT_DATETIME_FORMATS }]
})
export class MomentDateTimeModule {}
