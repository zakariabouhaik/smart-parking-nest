import { Body, Controller, Post } from "@nestjs/common";
import { ParkingService } from "./parking.service";
import { Parking } from "./parking.model";
import { Adresse } from "src/Adresse/adresse.model";
import { Vehicle } from "./VehicleType";


@Controller('parking')
export class ParkingController {

    constructor(private readonly parkingService:ParkingService){}

    @Post()
    addParking(
        @Body()parking:{nom:string,
            capacity:number,
            height:number,
            shadow:boolean,
            elecCharge:boolean,
            price:number,
            adresse:Adresse
            vehicule:Vehicle[]}):Promise<Parking>{

                return this.parkingService.addparking(parking.nom,parking.capacity,parking.height
                    ,parking.shadow,parking.elecCharge,parking.price,parking.adresse,parking.vehicule
                )
            }
    


}