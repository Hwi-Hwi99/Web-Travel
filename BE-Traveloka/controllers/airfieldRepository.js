const Airfield = require('../models/airfieldModel');

const findAirfields = async (keyword) => {
    console.log('🔍 Repository: findAirfields called with keyword:', keyword);
    return Airfield.find({
        $or: [
            { codeAirfield: { $regex: keyword, $options: 'i' } },
            { nameAirfield: { $regex: keyword, $options: 'i' } },
            { city: { $regex: keyword, $options: 'i' } },
            { country: { $regex: keyword, $options: 'i' } },
        ],
    });
};

const getAllAirfields = async (query) => {
    console.log('🔍 Repository: getAllAirfields called with query:', query);
    return Airfield.find(query);
};

const createAirfield = async (data) => {
    console.log('🔍 Repository: createAirfield called with data:', data);
    return Airfield.create(data);
};

const updateAirfield = async (id, data) => {
    console.log(
        `🔍 Repository: updateAirfield called with id: ${id} and data:`,
        data,
    );
    return Airfield.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });
};

const deleteAirfield = async (id) => {
    console.log(`🔍 Repository: deleteAirfield called with id: ${id}`);
    return Airfield.findByIdAndDelete(id);
};

module.exports = {
    findAirfields,
    getAllAirfields,
    createAirfield,
    updateAirfield,
    deleteAirfield,
};