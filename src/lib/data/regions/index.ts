import { type PlaceItems, predefinedPlaces } from '@/lib/utils/places';
import { auPlaces } from './au';
import { brPlaces } from './br';
import { caPlaces } from './ca';
import { cnPlaces } from './cn';
import { dePlaces } from './de';
import { esPlaces } from './es';
import { frPlaces } from './fr';
import { gbPlaces } from './gb';
import { idPlaces } from './id';
import { itPlaces } from './it';
import { jpPlaces } from './jp';
import { krPlaces } from './kr';
import { mxPlaces } from './mx';
import { ruPlaces } from './ru';
import { usPlaces } from './us';
import { worldPlaces } from './world';

export type RegionMap = Record<string, PlaceItems[]>;

/** Map of country code → region places */
export const COUNTRY_REGIONS: RegionMap = {
	in: predefinedPlaces,
	us: usPlaces,
	cn: cnPlaces,
	gb: gbPlaces,
	jp: jpPlaces,
	de: dePlaces,
	fr: frPlaces,
	au: auPlaces,
	br: brPlaces,
	kr: krPlaces,
	ca: caPlaces,
	ru: ruPlaces,
	it: itPlaces,
	es: esPlaces,
	mx: mxPlaces,
	id: idPlaces
};

export const getCountryRegions = (countryCode: string): PlaceItems[] =>
	COUNTRY_REGIONS[countryCode] ?? [];

export const getCountryCategories = (countryCode: string): string[] =>
	getCountryRegions(countryCode).map((r) => r.category);

export { worldPlaces };
