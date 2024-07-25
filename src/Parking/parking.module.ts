import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Mongoose } from "mongoose";
import { ParkingShema } from "./parking.model";
import { ParkingController } from "./parking.controller";
import { ParkingService } from "./parking.service";

@Module({
 imports:[
    MongooseModule.forFeature([{name:'Parking',schema:ParkingShema}])
 ],
 controllers:[ParkingController],
 providers:[ParkingService]

})

export class ParkingModule{}