import * as mongoose from 'mongoose'
import { Adresse, AdresseShema } from 'src/Adresse/adresse.model'
import { VehicleSchema ,Vehicle } from './VehicleType'

export const ParkingShema = new mongoose.Schema({
    nom:String,
    capacity:Number,
    height:Number,
    shadow:Boolean,
    elecCharge:Boolean,
    vehicule:[VehicleSchema],    
    adresse:AdresseShema,
    images:{
        type:[String],
        default:['assets/images/image1.jpg', 'assets/images/image2.jpg']
    }

})


export interface Parking extends mongoose.Document{
    id:string,
    nom:string,
    capacity:number,
    height:number,
    shadow:boolean,
    elecCharge:boolean,
    adresse:Adresse,
    images:string[],
    vehicule:Vehicle[]

}