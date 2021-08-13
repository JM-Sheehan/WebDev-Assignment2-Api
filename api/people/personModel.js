import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    birthday: {type: String },
    known_for_department: {type: String},
    deathday: {type: String},
    id: {type: Number, required: true, unique: true},
    name: {type: String, required: true},
    also_known_as: [{type: String, ref: 'Aka'}],
    gender: {type: Number},
    biography: {type: String},
    popularity: {type: Number},
    place_of_birth: {type: String},
    profile_path: {type: String},
    adult: {type: Boolean},
    imdb_id: {type: String},
    homepage: {type: String}
}

);

PersonSchema.statics.findByPersonDBId = function(id){
    return this.findOne({ id: id});
};

export default mongoose.model('Person', PersonSchema);