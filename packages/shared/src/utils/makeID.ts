// Recommended lengths for different ID types
export const ID_LENGTHS = {
  BALLOT: 8,     // b-12345678
  VOTER: 8,      // v-12345678
  CANDIDATE: 3,  // c-123
  RACE: 3,       // r-123
  ELECTION: 6,   // e-123456
} as const;

// Prefix for different ID types
export const ID_PREFIXES = {
  BALLOT: 'b',
  VOTER: 'v',
  CANDIDATE: 'c',
  RACE: 'r',
} as const;


// Removing vowels to avoid spelling real words in IDS (especially don't want curse words)
// also removing o/0 and 1/l to avoid confusion if someone was manually copying the 
// https://stackoverflow.com/questions/956556/is-it-irrational-to-sanitize-random-character-strings-for-curse-words
function generateRandomPart(length: number): string {
  const options = 'bcdfghjkmpqrtvwxy2346789';
  return [...Array(length)]
    .map(_ => options.charAt(Math.floor(Math.random()*options.length)))
    .join('');
}

// Synchronous version for simple ID generation
export function makeID(prefix: string = '', length: number): string {
  const randomPart = generateRandomPart(length);
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}

// Common constants
const MAX_ITERATIONS = 10;

// Async version for when collision checking is needed
export async function makeUniqueID(
  prefix: string | null = null, 
  length: number,
  hasCollision: (id: string) => Promise<boolean> | boolean
): Promise<string> {
  let i = 0;
  let currentId = makeID(prefix || '', length);
  
  while(i < MAX_ITERATIONS && await hasCollision(currentId)) {
    currentId = makeID(prefix || '', length);
    i++;
  }
  
  if(i === MAX_ITERATIONS) throw new Error("Failed to generate unique ID");
  return currentId;
}

// Synchronous version for when collision checking is needed but async isn't required
export function makeUniqueIDSync(
  prefix: string | null = null, 
  length: number,
  hasCollision: (id: string) => boolean
): string {
  let i = 0;
  let currentId = makeID(prefix || '', length);
  
  while(i < MAX_ITERATIONS && hasCollision(currentId)) {
    currentId = makeID(prefix || '', length);
    i++;
  }
  
  if(i === MAX_ITERATIONS) throw new Error("Failed to generate unique ID");
  return currentId;
}
