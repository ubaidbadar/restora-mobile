/** "ubaid badar" → "Ubaid Badar": a capital at the start of each word, the rest kept as typed (so "McDonald" stays). */
const nameCase = (name: string) => name.replace(/(^|\s)(\p{Ll})/gu, (_match, space: string, letter: string) => space + letter.toUpperCase());

export default nameCase;
