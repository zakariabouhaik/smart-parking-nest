import mongoose from "mongoose"

export enum VehicleType{
    VOITURE='voiture',
    MOTO='moto',
    BICYCLETTE='bicyclette'

}

export const VehicleSchema = new mongoose.Schema({
   
    type:{
    type:String,
    enum:Object.values(VehicleType),
    },
    
    price:Number,
          
},{_id:false})

export interface Vehicle{
    type:VehicleType,
    price:number
}