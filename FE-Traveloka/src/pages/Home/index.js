//hook
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// images
import images from '~/assets/images';
// component
import styles from './Home.module.scss';
import Button from '~/components/Button';
import { Wrapper as PoperWrapper } from '~/components/Poper';
import CityItems from '~/components/CityItems';
//library
import axios from 'axios';
import classNames from 'classnames/bind';
import Tippy from '@tippyjs/react/headless';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome/index';
import Menu from '~/components/Poper/Menu';
import {
    faCalendarDay,
    faChair,
    faMagnifyingGlass,
    faPlaneArrival,
    faPlaneDeparture,
    faUserLarge,
} from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const cx = classNames.bind(styles);

function Home() {
    const handleErrorToast = (err) => {
        toast.error(err);
    };
    const navigate = useNavigate();
    //lưu giữ trạng thái sân bay đi
    const [from, setFrom] = useState('');
    //lưu giữ trạng thái sân bay đến
    const [to, setTo] = useState('');
    //lưu giữ trạng thái ngày đi
    const [departureDate, setDepartureDate] = useState('');
    //lưu giữ trạng thái ngày về
    const [returnDate, setReturnDate] = useState('');
    //lưu giữ trạng thái hạng ghế
    const [seatClass, setSeatClass] = useState('Phổ thông');
    //lưu giữ trạng thái có phải vé khứ hồi hay không
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    //lưu giữ trạng thái số lượng người
    const [adultCount, setAdultCount] = useState(1);
    const [childCount, setChildCount] = useState(0);
    const [infantCount, setInfantCount] = useState(0);
    const [totalCustomer, setTotalCustomer] = useState(0);
    //lưu giữ trạng thái người dùng đã click vô ô input để thay đổi số lượng người
    const [isPassenger, setIsPassenger] = useState(false);
    //lưu giữ trạng thái các kết quả tìm kiếm khi lấy từ API lên
    const [searchResults, setSearchResults] = useState([]);
    //lưu giữ trạng thái từ khóa tìm kiếm
    const [searchKeyword, setSearchKeyword] = useState('');
    //lưu giữ trạng thái hiển thị kết quả tìm kiếm
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSelecting, setIsSelecting] = useState(true);
    //Thông báo lỗi
    // const [error, setError] = useState('');

    //Danh sách các hạng ghế
    const MENU_ITEMS = [
        {
            title: 'Phổ thông',
            onClick: function () {
                return setSeatClass('Phổ thông');
            },
        },
        {
            title: 'Phổ thông đặt biệt',
            onClick: function () {
                return setSeatClass('Phổ thông đặt biệt');
            },
        },
        {
            title: 'Thương gia',
            onClick: function () {
                return setSeatClass('Thương gia');
            },
        },
        {
            title: 'Hạng nhất',
            onClick: function () {
                return setSeatClass('Hạng nhất');
            },
        },
    ];

    const preventDefault = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFromInputChange = (e) => {
        const keyword = e.target.value;
        setFrom(keyword);
        setSearchKeyword(keyword);
    };

    const handleToInputChange = (e) => {
        const keyword = e.target.value;
        setTo(keyword);
        setSearchKeyword(keyword);
    };

    const handleAirportSelect = (airfields) => {
        if (isSelecting) {
            setFrom(`${airfields.city}`);
        } else {
            setTo(`${airfields.city}`);
        }
        setShowSearchResults(false);
    };

    useEffect(() => {
        const total = adultCount + childCount + infantCount;
        return setTotalCustomer(total);
    }, [adultCount, childCount, infantCount]);

    //handle khi user click chọn số hành khách
    const handlePassengerInputClick = (e) => {
        e.stopPropagation();
        setIsPassenger(true);
    };

    // xử lý khi user blur input
    const handleBlur = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsPassenger(false);
        }
    };

    //handle khi tăng số lượng khách
    const handleIncrease = (type) => {
        if (type === 'adults') setAdultCount(adultCount + 1);
        if (type === 'children') setChildCount(childCount + 1);
        if (type === 'infants') setInfantCount(infantCount + 1);
    };

    //handle khi giảm số lượng khách tối thiểu ít hơn 1 người lớn
    const handleDecrease = (type) => {
        if (type === 'adults' && adultCount > 1) setAdultCount(adultCount - 1);
        if (type === 'children' && childCount > 0) setChildCount(childCount - 1);
        if (type === 'infants' && infantCount > 0) setInfantCount(infantCount - 1);
    };

    //handle khi chọn ngày đi nhỏ hơn ngày hiện tại
    const handleDepartureDateChange = (e) => {
        const getCurrentDateFormatted = () => {
            const today = new Date();
            const year = today.getFullYear();
            // Tháng bắt đầu từ 0 nên cần +1
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const selectedDate = e.target.value;

        if (selectedDate >= getCurrentDateFormatted()) {
            setDepartureDate(selectedDate);
        } else {
            setDepartureDate(getCurrentDateFormatted());
        }
    };

    //handle khi chọn ngày về nhỏ hơn ngày đi
    const handleReturnDateChange = (e) => {
        const newReturnDate = e.target.value;
        if (newReturnDate < departureDate) {
            setReturnDate(departureDate);
        } else {
            setReturnDate(newReturnDate);
        }
    };

    // Hàm để hiển thị thông báo lỗi
    const displayError = (message) => {
        handleErrorToast(message);
    };

    //Call Api khi user nhập từ khóa
    useEffect(() => {
        const searchResults = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/api/airfield/search?keyword=${searchKeyword}`);
                const data = res.data;
                setSearchResults(data.data.airfields);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Error fetching search results:', error);
                setSearchResults([]);
                setShowSearchResults(false);
            }
        };
        if (searchKeyword.length > 0) {
            searchResults();
        } else {
            setShowSearchResults(false);
        }
    }, [searchKeyword]);

    // handle tìm kiếm vé
    const handleSearch = async () => {
        if (!from || !to || !departureDate) {
            displayError('Vui lòng điền đầy đủ thông tin !!!');
            return;
        }
        try {
            const res = await axios.get('http://localhost:4000/api/flight', {
                params: {
                    //Đi từ đâu
                    from,

                    //Đi đến đâu
                    to,

                    //Ngày đi
                    departureDate,

                    //Ngày về (nếu có)
                    returnDate: isRoundTrip ? returnDate : '',

                    //Hạng ghế
                    seatClass,

                    // Số lượng khách hàng
                    totalCustomer,
                },
            });

            // Kiểm tra nếu có dữ liệu chuyến bay trả về
            if (res.data.data.departure) {
                if (res.data.data.return && res.data.data.return.length > 0) {
                    navigate('/ticketplane', {
                        state: {
                            flights: res.data.data.departure,
                            returnFlights: res.data.data.return,
                            seatClass,
                            adultCount,
                            childCount,
                            infantCount,
                            totalCustomer,
                        },
                    });
                } else if (isRoundTrip && res.data.data.return.length <= 0) {
                    displayError('Không tìm thấy chuyến bay về phù hợp !!!');
                } else {
                    navigate('/ticketplane', {
                        state: {
                            flights: res.data.data.departure,
                            seatClass,
                            adultCount,
                            childCount,
                            infantCount,
                            totalCustomer,
                        },
                    });
                }
            } else {
                displayError('Không tìm thấy chuyến bay phù hợp !!!');
            }
        } catch (err) {
            console.log(err);
            displayError('Có lỗi trong quá trình tìm chuyến bay, vui lòng thử lại !!!');
        }
    };

    return (
        <div className={cx('home')}>
            {/* Banner */}
            <div className={cx('wrapper')}>
                <div className={cx('banner')}>
                    <div className={cx('title-banner')}>
                        <h1>Tìm và đặt vé máy bay khuyến mãi & vé giá rẻ chỉ với 3 bước đơn giản!</h1>
                        <h2>Khám phá ngay những ưu đãi tốt nhất dành cho bạn tại Traveloka!</h2>
                    </div>
                    <img src={images.banner} alt="banner" />
                </div>

                <div className={cx('next-link')}>Xem thêm khuyến mãi</div>
            </div>

            {/* Content */}

            <div className={cx('content')}>
                <div className={cx('find-ticket')}>
                    <div className={cx('ticket')}>
                        <div className={cx('title-content')}>Một chiều/ Khứ hồi</div>
                        <div className={cx('buy-ticket')}>
                            <div className={cx('info-customer')}>
                                <div className={cx('right-info')}>
                                    {/* Departure */}

                                    <Tippy
                                        placement="bottom"
                                        interactive
                                        render={(attrs) => (
                                            <div className={cx('search-start')} tabIndex="-1" {...attrs}>
                                                <PoperWrapper>
                                                    <h3>Thành Phố Hoặc Sân Bay Phổ biến</h3>
                                                    {showSearchResults && (
                                                        <div className={cx('city-items-list')}>
                                                            {searchResults.map((data) => (
                                                                // Nhận các props thông qua API và truyền vào CityItems để render
                                                                <CityItems
                                                                    key={data.id}
                                                                    data={data}
                                                                    onClick={() => handleAirportSelect(data)}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </PoperWrapper>
                                            </div>
                                        )}
                                    >
                                        <div className={cx('from')}>
                                            <p className={cx('name-input')}>Từ</p>
                                            <FontAwesomeIcon className={cx('icon')} icon={faPlaneDeparture} />
                                            <input
                                                className={cx('from-input')}
                                                type="text"
                                                placeholder="Điểm khởi hành"
                                                value={from}
                                                onChange={handleFromInputChange}
                                                onFocus={() => setIsSelecting(true)}
                                            />
                                        </div>
                                    </Tippy>

                                    {/* Arrival */}
                                    <div className={cx('from')}>
                                        <p className={cx('name-input')}>Đến</p>
                                        <FontAwesomeIcon className={cx('icon')} icon={faPlaneArrival} />
                                        <Tippy
                                            placement="bottom"
                                            interactive
                                            render={(attrs) => (
                                                <div className={cx('search-start')} tabIndex="-1" {...attrs}>
                                                    <PoperWrapper>
                                                        <h3>Thành Phố Hoặc Sân Bay Phổ biến</h3>
                                                        {searchResults.map((airfields) => (
                                                            // Nhận các props thông qua API và truyền vào CityItems để render
                                                            <CityItems
                                                                key={airfields.id}
                                                                data={airfields}
                                                                onClick={() => handleAirportSelect(airfields)}
                                                            />
                                                        ))}
                                                    </PoperWrapper>
                                                </div>
                                            )}
                                        >
                                            <input
                                                className={cx('to-input')}
                                                type="text"
                                                placeholder="Điểm đến"
                                                value={to}
                                                onChange={handleToInputChange}
                                                onFocus={() => setIsSelecting(false)}
                                            />
                                        </Tippy>
                                    </div>
                                </div>

                                {/* Amount customer */}
                                <div className={cx('left-info')} onBlur={handleBlur}>
                                    <div
                                        className={cx('amount-cus')}
                                        onFocus={() => setIsPassenger(true)}
                                        onClick={handlePassengerInputClick}
                                    >
                                        <p className={cx('name-input')}>Số hành khách</p>
                                        <FontAwesomeIcon className={cx('icon')} icon={faUserLarge} />
                                        <input
                                            type="text"
                                            value={`${adultCount} Người lớn, ${childCount} Trẻ em, ${infantCount} Em bé`}
                                            readOnly
                                        />
                                        {isPassenger && (
                                            <div className={cx('passenger-details')}>
                                                <div className={cx('passenger-count')}>
                                                    <span className={cx('per-count')}>
                                                        Người lớn
                                                        <br /> <h6>(Từ 12 tuổi)</h6>
                                                    </span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            preventDefault(e);
                                                            handleDecrease('adults');
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <span className={cx('person')}>{adultCount}</span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            preventDefault(e);
                                                            handleIncrease('adults');
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <div className={cx('passenger-count')}>
                                                    <span className={cx('per-count')}>
                                                        Trẻ em
                                                        <br /> <h6>(Từ 2 - 11 tuổi)</h6>
                                                    </span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            preventDefault(e);
                                                            handleDecrease('children');
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <span className={cx('person')}>{childCount}</span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            preventDefault(e);
                                                            handleIncrease('children');
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* Start: Số lượng em Bé Dưới 2 tuổi */}

                                                <div className={cx('passenger-count')}>
                                                    <span className={cx('per-count')}>
                                                        Em bé
                                                        <br /> <h6>(Dưới 2 tuổi)</h6>
                                                    </span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            preventDefault(e);
                                                            handleDecrease('infants');
                                                        }}
                                                    >
                                                        -
                                                    </button>
                                                    <span className={cx('person')}>{infantCount}</span>
                                                    <button
                                                        onMouseDown={(e) => {
                                                            preventDefault(e);
                                                            handleIncrease('infants');
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* End: Số lượng em bé dưới 2 tuổi */}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('info-customer')}>
                                <div className={cx('right-info')}>
                                    {/* Departure */}
                                    <div className={cx('from')}>
                                    <p className={cx('name-input')}>Ngày khởi hành</p>
                                        <FontAwesomeIcon className={cx('icon')} icon={faCalendarDay} />
                                        <input
                                            className={cx('date-input')}
                                            type="date"
                                            placeholder="Origin"
                                            value={departureDate}
                                            onChange={handleDepartureDateChange}
                                        />
                                    </div>

                                    {/* Arrival */}

                                    <div className={cx('from')}>
                                        <div className={cx('btn-check-box')}>
                                            <input
                                                type="checkbox"
                                                checked={isRoundTrip}
                                                onChange={() => setIsRoundTrip(!isRoundTrip)}
                                            />
                                            <label>Khứ Hồi</label>
                                        </div>
                                        {isRoundTrip && (
                                            <div className={cx('day-return')}>
                                                <FontAwesomeIcon className={cx('icon')} icon={faCalendarDay} />
                                                <input
                                                    type="date"
                                                    placeholder="Destination"
                                                    value={returnDate}
                                                    onChange={handleReturnDateChange}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Amount customer */}
                                <div className={cx('left-info')}>
                                    <Menu items={MENU_ITEMS}>
                                        <div className={cx('amount-cus')}>
                                            <p className={cx('name-input')}>Hạng ghế</p>
                                            <FontAwesomeIcon className={cx('icon')} icon={faChair} />
                                            <input type="text" value={seatClass} readOnly />
                                        </div>
                                    </Menu>
                                </div>
                            </div>
                            <Button
                                large
                                leftIcon={<FontAwesomeIcon className={cx('icon')} icon={faMagnifyingGlass} />}
                                className={cx('btnFind')}
                                onClick={handleSearch}
                            >
                                Tìm chuyến bay
                            </Button>
                        </div>
                    </div>
                </div>
                <div className={cx('review')}>
                    <div className={cx('birth-day-travel')}>
                        <h1>Mừng Sinh Nhật Traveloka, Sale đậm hết ga</h1>
                        <p>Ưu đãi lên tới 50% cho vé máy bay, khách sạn và vé vui chơi</p>
                        <img className={cx('birth-day-banner')} src={images.birthdayTravel} alt="#" />
                        <h1>MÙA SALE HOA ANH ĐÀO</h1>
                        <p>Coupon giảm đến 1 TRIỆU VNĐ</p>
                        <img className={cx('birth-day-banner')} src={images.hoaAnhDao} alt="#" />
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Home;
