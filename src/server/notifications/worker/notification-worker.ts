import {
  runNotificationScheduler,
} from "@/server/notifications/scheduler/notification-scheduler";
import { runCustomServiceMaintenance } from "@/server/custom-services/custom-service-service";


const INTERVAL =
  5 * 60 * 1000;


async function run(){

  try{

    const [result, customServices] = await Promise.all([
      runNotificationScheduler(),
      runCustomServiceMaintenance(),
    ]);


    console.log(
      "notification scheduler result:",
      result,
      customServices,
    );


  }catch(error){

    console.error(
      "notification worker error:",
      error,
    );

  }

}


console.log(
  "notification worker started",
);


run();


setInterval(
  run,
  INTERVAL,
);
