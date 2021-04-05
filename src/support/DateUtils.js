'use strict';

class DateUtils {
    static isSupportedLocale(locale){
        let isSupported = true;
        try{
            new Date().toLocaleDateString(locale);
        }catch (ex){
            if ( ex.name === 'RangeError' ){
                isSupported = false
            }
        }
        return isSupported;
    }

    static stringifyDate(date, locale = 'en'){
        if ( !DateUtils.isSupportedLocale(locale) ){
            locale = 'en';
        }
        return date.toLocaleDateString(locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

module.exports = DateUtils;
