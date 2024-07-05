import { Request, Response } from 'express';
import { reqIdSuffix } from './IRequest';
import { ILoggingContext } from './Services/Logging/ILogger';
import { InternalServerError } from '@curveball/http-errors';

export function assertNotNull<Type>(data:Type | null, message:string = 'unexpected null'):Type {
    if (data == null){
        throw(new Error(message));
    }
    return data;
}

export function orDefault<T>(data: T | null, def:T):T {
    if (data == null){
      return def;
    }
    return data;
  }

export function responseErr(res:Response, req:Request, code:number, errMessage:string, extraData?:any){
  errMessage += reqIdSuffix(req);
  if (extraData == null){
    extraData = {};
  }
  extraData.error = errMessage;
  return res.status(code).json(extraData);
}

export async function makeID<Uid>(hasCollision: Function, length=6){ // default length of 6 is already 22^6=113 million options
  // Removing vowels to avoid spelling real words in IDS (especially don't want curse words)
  // also removing o/0 and 1/l to avoid confusion if someone was manually copying the 
  // https://stackoverflow.com/questions/956556/is-it-irrational-to-sanitize-random-character-strings-for-curse-words
  const options = 'bcdfghjkmpqrtvwxy346789';
  let id: Uid;
  let i = 0;
  const maxIter = 10;
  do{
    // TODO: I used Math.random(), but we may upgrade this in the future
    // https://security.stackexchange.com/questions/120352/should-i-use-a-cryptograpically-secure-random-number-generator-when-i-generate-i
    // apparently I need to add the as unknown to make typescript happy?
    id = [...Array(length)].map( _ => options.charAt(Math.floor(Math.random()*options.length))).join('') as unknown as Uid;
    i++;
  }while(i < maxIter && await hasCollision(id));
  // TODO: this causes the request to fail, but it also crashes
  if(i == maxIter) throw new InternalServerError("Failed to generate new ID");
  return id;
}