import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Parking } from "./parking.model";
import { Adresse } from "src/Adresse/adresse.model";
import { Vehicle } from "./VehicleType";

@Injectable()
export class ParkingService{

    constructor(@InjectModel('Parking')private parkingModel:Model<Parking> ){
    }

    async addparking( nom:string,
        capacity:number,
        height:number,
        shadow:boolean,
        elecCharge:boolean,
        price:number,
        adresse:Adresse,
        vehicule:Vehicle[]
    ){
            
            const NewParking= new this.parkingModel({nom,capacity,height,shadow,elecCharge,price,adresse,vehicule})
            return await NewParking.save();
    }

}