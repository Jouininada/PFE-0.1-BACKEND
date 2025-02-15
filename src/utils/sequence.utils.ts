import { format } from 'date-fns';
import { DATE_FORMAT } from 'src/app/enums/date-formats.enum';

const DATE_FORMAT_PATTERNS: { [key in DATE_FORMAT]: RegExp } = {
  [DATE_FORMAT.yyyy]: /^\d{4}$/,
  [DATE_FORMAT.yy_MM]: /^\d{2}-\d{2}$/,
  [DATE_FORMAT.yyyy_MM]: /^\d{4}-\d{2}$/,
};

export function parseSequential(sequence: string) {
  const regex = /^(.+?)-(\d{4}-\d{2}|\d{2}-\d{2}|\d{4})-(\d+)$/;
  const match = sequence.match(regex);

  if (!match) {
    return {
      prefix: '',
      dynamicSequence: DATE_FORMAT.yyyy,
      next: 0,
    };
  }

  const [, prefix, dynamicSequence, nextStr] = match;
  const next = parseInt(nextStr, 10);

  const knownFormat =
    (Object.keys(DATE_FORMAT_PATTERNS).find((format) =>
      DATE_FORMAT_PATTERNS[format as DATE_FORMAT].test(dynamicSequence),
    ) as DATE_FORMAT) || DATE_FORMAT.yyyy;

  return {
    prefix,
    dynamicSequence: knownFormat,
    next: isNaN(next) ? 0 : next,
  };
}

export function formSequential(
  prefix: string,
  dynamicSequence: any,
  next: number,
  date: Date = new Date(),
): string {
  return `${prefix}-${format(date, dynamicSequence)}-${next}`;
}
