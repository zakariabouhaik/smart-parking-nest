import mongoose from "mongoose";

export const UserShema=new mongoose.Schema({
    keycloakId:String,
    name:String,
    lastname:String,
    phonenumber:String,
    otpcode:String
})

export interface USER extends mongoose.Document{
    keycloakId:string,
    name:string,
    lastname:string,
    phonenumber:string,
    otpcode:String
}