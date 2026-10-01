import mongoose, {Schema} from "mongoose";
import { ServiceType } from "../../../enums/service-type.enum.js";

const timeAvailabilitySchema = new mongoose.Schema({
    dayOfWeek : {type : String,required : true},
    startTime : {type : String,required : true},
    endTime : {type : String,required : true}
},{_id: false});
//Se usa para que el subschema no tenga id propia
//monGOAT por defecto le agrega a todos id

const doctorSchema = new mongoose.Schema({
    userId : {type : Schema.Types.ObjectId , ref: 'User' ,required : true , unique : true},
    registration : {type: String, required : true, unique : true},
    name : {type : String , required : true},
    services : {
        [ServiceType.SPECIALTY]: [{type : Schema.Types.ObjectId , ref : 'Specialty'}],
        [ServiceType.PRACTICE]: [{type : Schema.Types.ObjectId , ref : 'Practice'}]
    },
    locationIds : [{type : Schema.Types.ObjectId , ref : 'Location'}],
    availabilities : [timeAvailabilitySchema],
    deletedAt : {type : Date, default : null}
}, {
    timestamps : true
})

export const DoctorModel = mongoose.model('Doctor',doctorSchema);