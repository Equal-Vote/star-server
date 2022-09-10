// export default async function initPgBoss() {

//     console.log("= = = = init PG Boss");
//     const PgBoss = require('pg-boss');
//     var connectionStr = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres'

//     try {
//         const boss = new PgBoss(connectionStr);
//         boss.on('error', (error: any) => console.error(error));
  
//         await boss.start();
      
//         const queue = 'some-queue';
      
//         let jobId = await boss.send(queue, { param1: 'foo' })
      
//         console.log(`created job in queue ${queue}: ${jobId}`);
      
//         await boss.work(queue, someAsyncJobHandler);
//     } catch (e:any){
//         console.log("= = = = Error connecting PgBoss: " + e.message);        
//         return;
//     }

//     console.log("= = = = PG Boss Init Complete");
//   }
  
//   async function someAsyncJobHandler(job: { id: any; data: any; }) {
//     console.log(`job ${job.id} received with data:`);
//     console.log(JSON.stringify(job.data));
//   }