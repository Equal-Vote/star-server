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
    console.log("orDefault but was NOT null...");
    return data;
  }