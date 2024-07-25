import * as mongoose from 'mongoose'


export const AdresseShema= new mongoose.Schema({
country: String,
  city: String,
  street: String,
  latitude: Number,
  longitude: Number
}, { _id: false });



export interface Adresse {
    country: string,
    city: string,
    street: string,
    latitude: number,
    longitude: number

}