const airfieldRepository = require('../repositories/airfieldRepository');

const searchAirfield = async (req, res) => {
  try {
    console.log('🔍 Controller: searchAirfield called with query:', req.query);
    const { keyword } = req.query;
    const airfields = await airfieldRepository.findAirfields(keyword);

    if (!airfields.length) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'No airfields found' });
    }

    res.status(200).json({
      status: 'success',
      results: airfields.length,
      data: { airfields, },
    });
  } catch (err) {
    console.error('❌ Error in searchAirfield:', err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const getAllAirfields = async (req, res) => {
  try {
    console.log('🔍 Controller: getAllAirfields called with query:', req.query);
    const airfields = await airfieldRepository.getAllAirfields(req.query);
    res.status(200).json({
      status: 'success',
      results: airfields.length,
      data: { airfields, },
    });
  } catch (err) {
    console.error('❌ Error in getAllAirfields:', err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const createAirfield = async (req, res) => {
  try {
    console.log('🔍 Controller: createAirfield called with body:', req.body);
    const newAirfield = await airfieldRepository.createAirfield(req.body);

    res
      .status(201)
      .json({ status: 'success', data: { airfield: newAirfield } });
  } catch (err) {
    console.error('❌ Error in createAirfield:', err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const updateAirfield = async (req, res) => {
  try {
    console.log(
      `🔍 Controller: updateAirfield called with id: ${req.params.id}, body:`,
      req.body,
    );
    const airfield = await airfieldRepository.updateAirfield(
      req.params.id,
      req.body,
    );

    if (!airfield) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Airfield not found' });
    }

    res.status(200).json({ status: 'success', data: { airfield } });

  } catch (err) {
    console.error('❌ Error in updateAirfield:', err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const deleteAirfield = async (req, res) => {
  try {
    console.log(
      `🔍 Controller: deleteAirfield called with id: ${req.params.id}`,
    );
    const deleted = await airfieldRepository.deleteAirfield(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'Airfield not found' });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    console.error('❌ Error in deleteAirfield:', err.message);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

module.exports = {
  searchAirfield,
  getAllAirfields,
  createAirfield,
  updateAirfield,
  deleteAirfield,
  getAllAirfields,
};
