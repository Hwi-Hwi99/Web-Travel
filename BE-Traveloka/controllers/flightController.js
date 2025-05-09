const Flight = require('../models/flightModel');
const Airfield = require('../models/airfieldModel');
const flightObserver = require('../observers/flightObserver');

const seatClassMapping = {
  'Phổ thông': 'phoThong',
  'Phổ thông đặt biệt': 'phoThongDacBiet',
  'Thương gia': 'thuongGia',
  'Hạng nhất': 'hangNhat',
};

const getAllFlights = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    const mappedSeatClass = seatClassMapping[queryObj.seatClass];

    const fromAirfield = await Airfield.findOne({
      city: { $regex: new RegExp(`^${queryObj.from}$`, 'i') },
    });
    const toAirfield = await Airfield.findOne({
      city: { $regex: new RegExp(`^${queryObj.to}$`, 'i') },
    });

    const departureQuery = {
      'airfield.from': fromAirfield,
      'airfield.to': toAirfield,
      date: { $elemMatch: { $eq: new Date(queryObj.departureDate) } },
      [`tickets.${mappedSeatClass}.soLuongVe`]: {
        $gte: queryObj.totalCustomer,
      },
    };

    if (queryObj.returnDate) {
      const returnQuery = {
        'airfield.from': toAirfield,
        'airfield.to': fromAirfield,
        date: { $elemMatch: { $eq: new Date(queryObj.returnDate) } },
        [`tickets.${mappedSeatClass}.soLuongVe`]: {
          $gte: queryObj.totalCustomer,
        },
      };

      const returnFlights = await Flight.find(returnQuery)
        .populate('airfield.from', 'city codeAirfield nameAirfield')
        .populate('airfield.to', 'city codeAirfield nameAirfield');

      const flights = await Flight.find(departureQuery)
        .populate('airfield.from', 'city codeAirfield nameAirfield')
        .populate('airfield.to', 'city codeAirfield nameAirfield');

      res.status(200).json({
        status: 'success',
        departureFlights: flights.length,
        returnFlights: returnFlights.length,
        data: { departure: flights, return: returnFlights },
      });
    } else {
      const flights = await Flight.find(departureQuery)
        .populate('airfield.from', 'city codeAirfield nameAirfield')
        .populate('airfield.to', 'city codeAirfield nameAirfield');

      res.status(200).json({
        status: 'success',
        results: flights.length,
        data: { departure: flights },
      });
    }
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

const getFlight = async (req, res) => {
  try {
    const flight = await Flight.find(req.query)
      .populate('airfield.from', 'city codeAirfield nameAirfield')
      .populate('airfield.to', 'city codeAirfield nameAirfield');
    res.status(200).json({ status: 'success', data: { flight } });
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

const createFlight = async (req, res) => {
  try {
    const { airfield } = req.body;
    const fromAirfield = await Airfield.findOne({
      city: { $regex: new RegExp(`^${airfield.from}$`, 'i') },
    });
    const toAirfield = await Airfield.findOne({
      city: { $regex: new RegExp(`^${airfield.to}$`, 'i') },
    });
    req.body.airfield.from = fromAirfield._id;
    req.body.airfield.to = toAirfield._id;

    const newFlight = await Flight.create(req.body);
    flightObserver.notify('create', newFlight);

    res.status(200).json({ status: 'success', data: { Flight: newFlight } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    flightObserver.notify('update', flight);
    res.status(200).json({ status: 'success', data: { flight } });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const deleteFlight = async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    flightObserver.notify('delete', { id: req.params.id });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

module.exports = {
  getAllFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
};
