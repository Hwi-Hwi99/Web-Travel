//Hook
import { useState, useEffect } from 'react';
//Styles
import styles from './AddFlight.module.scss';
// Component
import Button from '~/components/Button';
import CityItems from '~/components/CityItems';
import AirlineItems from '~/components/AirlineItems';
import { Wrapper as PoperWrapper } from '~/components/Poper';
// Library
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TextField from '@mui/material/TextField';
const cx = classNames.bind(styles);
function AddFlight() {
    const navigate = useNavigate();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchAirfieldKeyword, setSearchAirfieldKeyword] = useState('');

    // Sân bay
    const [showAirfiled, setShowAirfiled] = useState(false);
    const [searchAirfield, setSearchAirfield] = useState([]);

    //City
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    // Hãng hàng không
    const [showAirline, setShowAirline] = useState(false);
    const [searchAirline, setSearchAirline] = useState([]);
    const [airlines, setAirlines] = useState('');

    // State để lấy các input fileld
    const [flightCode, setFlightCode] = useState('');
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [departureDate, setDepartureDate] = useState('');

    // phoThong
    const [pricePhoThong, setPricePhoThong] = useState('');
    const [ticketPhoThong, setTicketPhoThong] = useState('');
    // phoThong dac biet
    const [pricePhoThongDacBiet, setPricePhoThongDacBiet] = useState('');
    const [ticketPhoThongDacBiet, setTicketVePhoThongDacBiet] = useState('');
    // thuong gia
    const [priceThuongGia, setPriceThuongGia] = useState('');
    const [ticketThuongGia, setTicketThuongGia] = useState('');
    // hang nhat
    const [priceHangNhat, setPriceHangNhat] = useState('');
    const [ticketHangNhat, setTicketHangNhat] = useState('');

    useEffect(() => {
        const search = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/airfield/search?keyword=${searchKeyword}`);
                const data = res.data;
                setSearchAirfield(data.data.airfields);
                console.log(data.data.airfields);
                setShowAirfiled(true);
            } catch (err) {
                console.error('Error fetching search results:', err);
                setSearchAirfield([]);
                setShowAirfiled(false);
            }
        };
        if (searchKeyword.length > 0) {
            search();
        } else {
            setShowAirfiled(false);
        }
    }, [searchKeyword]);

    useEffect(() => {
        const searchAirlines = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:4000/api/airline/search?keyword=${searchAirfieldKeyword}`,
                );
                const data = res.data;
                setSearchAirline(data.data.airlines);
                setShowAirline(true);
            } catch (err) {
                console.error('Error fetching search results:', err);
                setSearchAirline([]);
                setShowAirline(false);
            }
        };
        if (searchAirfieldKeyword.length > 0) {
            searchAirlines();
        } else {
            setShowAirline(false);
        }
    }, [searchAirfieldKeyword]);

    const handleInputChange = (e, type) => {
        const keyword = e.target.value;
        if (type === 'departure') {
            setFrom(keyword);
            setSearchKeyword(keyword);
        } else if (type === 'arrival') {
            setTo(keyword);
            setSearchKeyword(keyword);
        } else if (type === 'airlines') {
            setAirlines(keyword);
            setSearchAirfieldKeyword(keyword);
        }
    };

    const handleSelect = (airfields, type) => {
        if (type === 'departure') {
            console.log(airfields);
            setFrom(`${airfields.city}`);
        } else if (type === 'arrival') {
            setTo(`${airfields.city}`);
        } else if (type === 'airlines') {
            setAirlines(`${airfields.nameAirline}`);
        }
        setShowAirfiled(false);
        setShowAirline(false);
    };
    const handleErrorToast = (err) => {
        toast.error(err);
    };

    const handleSuccessToast = (err) => {
        toast.success(err, {
            onClose: () => {
                navigate('/listfilght'); //Điều hướng đến danh sách sân bay
            },
        });
    };

    const handleAddFlight = async () => {
        try {
            if (!from || !to) {
                handleErrorToast('Vui lòng chọn sân bay khởi hành và đến.');
                return;
            }
            const departureTime = new Date(`${departureDate}T${departure}:00`);
            const arrivalTime = new Date(`${departureDate}T${arrival}:00`);
            await axios.post('http://localhost:4000/api/flight', {
                flightCode,
                airlines,
                airfield: {
                    from,
                    to,
                },
                time: {
                    departure: departureTime,
                    arrival: arrivalTime,
                },
                date: [departureDate],
                tickets: {
                    phoThong: {
                        price: pricePhoThong,
                        soLuongVe: ticketPhoThong,
                    },
                    phoThongDacBiet: {
                        price: pricePhoThongDacBiet,
                        soLuongVe: ticketPhoThongDacBiet,
                    },
                    thuongGia: {
                        price: priceThuongGia,
                        soLuongVe: ticketThuongGia,
                    },
                    hangNhat: {
                        price: priceHangNhat,
                        soLuongVe: ticketHangNhat,
                    },
                },
            });
            handleSuccessToast('Flight added successfully!');
        } catch (err) {
            console.error('Error adding flight:', err);
            handleErrorToast('Failed to add flight. Please try again.');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <h1>ĐIỀN THÔNG TIN CHUYẾN BAY</h1>
                <div className={cx('add-flight')}>
                    <div className={cx('flight-info')}>
                        <label>
                            <span>Mã chuyến bay</span>
                            <TextField
                                label="Mã chuyến bay"
                                placeholder="Flight Number"
                                variant="outlined"
                                // fullWidth
                                value={flightCode}
                                onChange={(e) => setFlightCode(e.target.value)}
                            />
                        </label>
                        <div>
                            <label>
                                <span>Hãng hàng không</span>
                                <Tippy
                                    placement="bottom-start"
                                    interactive
                                    render={(attrs) => (
                                        <div className={cx('search-start')} tabIndex="-1" {...attrs}>
                                            <PoperWrapper>
                                                <h3>Hãng hàng không</h3>
                                                {showAirline && (
                                                    <div className={cx('airline-items-list')}>
                                                        {searchAirline.map((data) => (
                                                            <AirlineItems
                                                                key={data._id}
                                                                data={data}
                                                                onClick={() => handleSelect(data, 'airlines')}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </PoperWrapper>
                                        </div>
                                    )}
                                >
                                    <TextField
                                        label="Hãng hàng không"
                                        placeholder="Airlines"
                                        variant="outlined"
                                        value={airlines}
                                        onFocus={() => setShowAirline(true)}
                                        onChange={(e) => handleInputChange(e, 'airlines')}
                                    />
                                </Tippy>
                            </label>
                        </div>
                        <div>
                            <label>
                                <span> Sân bay cất cánh</span>
                                <Tippy
                                    placement="bottom-start"
                                    interactive
                                    render={(attrs) => (
                                        <div className={cx('search-start')} tabIndex="-1" {...attrs}>
                                            <PoperWrapper>
                                                <h3>Các sân bay</h3>
                                                {showAirfiled && (
                                                    <div className={cx('city-items-list')}>
                                                        {searchAirfield.map((data) => (
                                                            <CityItems
                                                                key={data.id}
                                                                data={data}
                                                                onClick={() => handleSelect(data, 'departure')}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </PoperWrapper>
                                        </div>
                                    )}
                                >
                                    <TextField
                                        label="Thành phố đi"
                                        placeholder="Departure City"
                                        variant="outlined"
                                        value={from}
                                        onFocus={() => setShowAirfiled(true)}
                                        onChange={(e) => handleInputChange(e, 'departure')}
                                    />
                                </Tippy>
                            </label>
                        </div>

                        <label>
                            <span> Thời gian cất cánh</span>
                            <TextField
                                label="Giờ khởi hành"
                                type="time"
                                variant="outlined"
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </label>
                        <div>
                            <label className={cx('amount-ticket')}>
                                <span> Số lượng vé</span>
                                <div className={cx('level-ticket')}>
                                    <div className={cx('field')}>
                                        <TextField
                                            id="economy-tickets"
                                            label="Phổ thông"
                                            placeholder="Phổ thông"
                                            variant="outlined"
                                            className={cx('field-input')}
                                            value={ticketPhoThong}
                                            onChange={(e) => setTicketPhoThong(e.target.value)}
                                        />
                                    </div>
                                    <div className={cx('field')}>
                                        <TextField
                                            id="premium-economy-tickets"
                                            label="Phổ thông đặc biệt"
                                            placeholder="Phổ thông đặc biệt"
                                            variant="outlined"
                                            className={cx('field-input')}
                                            value={ticketPhoThongDacBiet}
                                            onChange={(e) => setTicketVePhoThongDacBiet(e.target.value)}
                                        />
                                    </div>
                                    <div className={cx('field')}>
                                        <TextField
                                            id="business-tickets"
                                            label="Thương gia"
                                            placeholder="Thương gia"
                                            variant="outlined"
                                            className={cx('field-input')}
                                            value={ticketThuongGia}
                                            onChange={(e) => setTicketThuongGia(e.target.value)}
                                        />
                                    </div>
                                    <div className={cx('field')}>
                                        <TextField
                                            id="first-class-tickets"
                                            label="Hạng nhất"
                                            placeholder="Hạng nhất"
                                            variant="outlined"
                                            className={cx('field-input')}
                                            value={ticketHangNhat}
                                            onChange={(e) => setTicketHangNhat(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>
                    <div className={cx('flight-info')}>
                        <label>
                            <span>Ngày khởi hành</span>
                            <TextField
                                label="Ngày khởi hành"
                                type="date"
                                variant="outlined"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </label>
                        <div>
                            <label>
                                <span> Sân bay hạ cánh</span>
                                <Tippy
                                    placement="bottom-start"
                                    interactive
                                    render={(attrs) => (
                                        <div className={cx('search-start')} tabIndex="-1" {...attrs}>
                                            <PoperWrapper>
                                                <h3>Các sân bay</h3>
                                                {showAirfiled && (
                                                    <div className={cx('city-items-list')}>
                                                        {searchAirfield.map((airport) => (
                                                            <CityItems
                                                                key={airport.id}
                                                                data={airport}
                                                                onClick={() => handleSelect(airport, 'arrival')}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </PoperWrapper>
                                        </div>
                                    )}
                                >
                                    <TextField
                                        label="Thành phố đến"
                                        placeholder="Arrival City"
                                        variant="outlined"
                                        value={to}
                                        onFocus={() => setShowAirfiled(true)}
                                        onChange={(e) => handleInputChange(e, 'arrival')}
                                    />
                                </Tippy>
                            </label>
                        </div>
                        <label>
                            <span>Thời gian hạ cánh</span>
                            <TextField
                                label="Giờ đến"
                                type="time"
                                variant="outlined"
                                value={arrival}
                                onChange={(e) => setArrival(e.target.value)}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </label>
                        <label className={cx('price-ticket')}>
                            <span> Giá vé</span>
                            <div className={cx('level-ticket')}>
                                <div className={cx('field')}>
                                    <TextField
                                        id="economy-price"
                                        label="Phổ thông"
                                        placeholder="Phổ thông"
                                        variant="outlined"
                                        className={cx('field-input')}
                                        value={pricePhoThong}
                                        onChange={(e) => setPricePhoThong(e.target.value)}
                                    />
                                </div>
                                <div className={cx('field')}>
                                    <TextField
                                        id="premium-economy-price"
                                        label="Phổ thông đặc biệt"
                                        placeholder="Phổ thông đặc biệt"
                                        variant="outlined"
                                        className={cx('field-input')}
                                        value={pricePhoThongDacBiet}
                                        onChange={(e) => setPricePhoThongDacBiet(e.target.value)}
                                    />
                                </div>
                                <div className={cx('field')}>
                                    <TextField
                                        id="business-price"
                                        label="Thương gia"
                                        placeholder="Thương gia"
                                        variant="outlined"
                                        className={cx('field-input')}
                                        value={priceThuongGia}
                                        onChange={(e) => setPriceThuongGia(e.target.value)}
                                    />
                                </div>
                                <div className={cx('field')}>
                                    <TextField
                                        id="first-class-price"
                                        label="Hạng nhất"
                                        placeholder="Hạng nhất"
                                        variant="outlined"
                                        className={cx('field-input')}
                                        value={priceHangNhat}
                                        onChange={(e) => setPriceHangNhat(e.target.value)}
                                    />
                                </div>
                            </div>
                        </label>
                    </div>
                </div>
                <Button primary className={cx('btn-add-flight')} onClick={handleAddFlight}>
                    THÊM
                </Button>
            </div>
            <ToastContainer />
        </div>
    );
}

export default AddFlight;
