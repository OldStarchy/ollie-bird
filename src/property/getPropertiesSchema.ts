import type z from '../../node_modules/zod/v4/classic/external.d.cts';
import PropertiesSchema from './PropertiesSchema';

export default function getPropertiesSchema(
	Class: abstract new (...args: any[]) => any,
): z.ZodObject | null {
	const metadata = Class[Symbol.metadata];

	if (metadata && metadata[PropertiesSchema]) {
		return metadata[PropertiesSchema] as z.ZodObject;
	}

	return null;
}
