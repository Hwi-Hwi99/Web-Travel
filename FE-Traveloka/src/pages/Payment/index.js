import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Payment.module.scss';
import classNames from 'classnames/bind';
import { format } from 'date-fns';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const cx = classNames.bind(styles);

function Payment() {
    const navigate = useNavigate();
    const location = useLocation();

    const formatDate = (isoString) => {
        return format(new Date(isoString), 'dd/MM/yyyy');
    };

    const formatTime = (isoString) => {
        return format(new Date(isoString), 'HH:mm');
    };

    const handleSuccessToast = () => {
        toast.success('Thanh toán thành công!', {
            onClose: () => {
                navigate('/');
            },
        });
    };

    const handleErrorToast = () => {
        toast.error('Thanh toán thất bại. Vui lòng thử lại!');
    };

    const seatClassMapping = (seatClass) => {
        const mapping = {
            phoThong: 'Phổ thông',
            phoThongDacBiet: 'Phổ thông đặc biệt',
            thuongGia: 'Thương gia',
            hangNhat: 'Hạng nhất',
        };
        return mapping[seatClass];
    };

    const {
        flight,
        returnFlight,
        adultCount,
        childCount,
        infantCount,
        totalCustomer,
        contactInfo,
        customerInfo,
        seatClass,
    } = location.state;

    const user = localStorage.getItem('user');
    const users = JSON.parse(user);

    useEffect(() => {
        if (!user) {
            sessionStorage.setItem('pendingBooking', JSON.stringify(location.state));
            sessionStorage.setItem('redirectUrl', window.location.pathname);
            toast.error('Vui Lòng đăng nhập!', {
                onClose: () => {
                    navigate('/login');
                },
            });
        }
    }, [user]);
    const flightPrice = flight.tickets[seatClass].price;
    const returnTicketPrice = returnFlight?.tickets[seatClass]?.price || 0;

    const totalAmount = (flightPrice + returnTicketPrice) * totalCustomer;

    const seatNumbers = customerInfo.map((customer) => customer.seatNumber);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <div className={cx('payment')}>
                    <h1>Đặt chổ của tôi</h1>
                    <ul className={cx('info-payment')}>
                        <li className={cx('airlines')}>Hãng hàng không: {flight.airlines}</li>
                        <li className={cx('code')}>
                            Sân bay cất cánh: {flight.airfield.from.nameAirfield}{' '}
                            {`(${flight.airfield.from.codeAirfield})`} - Sân bay hạ cánh:{' '}
                            {flight.airfield.to.nameAirfield} {`(${flight.airfield.to.codeAirfield})`}
                        </li>
                        <li className={cx('date')}>
                            Ngày đi: {formatDate(flight.date)}{' '}
                            {returnFlight ? `- Ngày về: ${formatDate(returnFlight.date)}` : ''}
                        </li>
                        <li className={cx('time')}>
                            Thời gian cất cánh: {formatTime(flight.time.departure)} - Thời gian hạ cánh:{' '}
                            {formatTime(flight.time.arrival)}
                        </li>
                        <li className={cx('price')}>Hạng ghế: {seatClassMapping(seatClass)}</li>
                        <li className={cx('price')}>Giá vé: {flightPrice.toLocaleString()} VND</li>
                        <li className={cx('amount-cus')}>
                            Số lượng người:
                            <p>Số người lớn: {adultCount}</p>
                            <p>Số trẻ em: {childCount}</p>
                            <p>Số em bé: {infantCount}</p>
                        </li>
                        <p className={cx('total')}>Tổng giá tiền: {totalAmount.toLocaleString()} VND</p>
                    </ul>
                    <PayPalScriptProvider options={{ 'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
                        <PayPalButtons
                            className={cx('paypal-btn')}
                            createOrder={(data, actions) => {
                                return actions.order.create({
                                    purchase_units: [
                                        {
                                            amount: {
                                                value: totalAmount,
                                            },
                                        },
                                    ],
                                });
                            }}
                            onApprove={async (data, actions) => {
                                try {
                                    const res = await actions.order.capture();
                                    if (res.status === 'COMPLETED') {
                                        const createBooking = async (
                                            flight,
                                            seatClass,
                                            totalCustomer,
                                            seatNumbers,
                                            ticketPrice,
                                        ) => {
                                            const newBookings = {
                                                user: users._id,
                                                flight: flight._id,
                                                status: 'checked-in',
                                                infoContact: contactInfo,
                                                infoCustomers: customerInfo,
                                                seatClass: seatClass,
                                                totalPrice: ticketPrice * totalCustomer,
                                            };

                                            const newFlight = {
                                                tickets: {
                                                    ...flight.tickets,
                                                    [seatClass]: {
                                                        price: flight.tickets[seatClass].price,
                                                        soLuongVe: flight.tickets[seatClass].soLuongVe,
                                                        soVeCon: flight.tickets[seatClass].soVeCon - totalCustomer,
                                                        bookedSeats: [
                                                            ...flight.tickets[seatClass].bookedSeats,
                                                            ...seatNumbers,
                                                        ],
                                                    },
                                                },
                                            };
                                            return axios.all([
                                                axios.post('http://localhost:4000/api/booking', newBookings),
                                                axios.patch(
                                                    `http://localhost:4000/api/flight/${flight._id}`,
                                                    newFlight,
                                                ),
                                            ]);
                                        };
                                        createBooking(flight, seatClass, totalCustomer, seatNumbers, flightPrice);
                                        if (returnFlight) {
                                            createBooking(
                                                returnFlight,
                                                seatClass,
                                                totalCustomer,
                                                seatNumbers,
                                                returnTicketPrice,
                                            );
                                        }
                                        handleSuccessToast();
                                    }
                                } catch (err) {
                                    handleErrorToast();
                                }
                            }}
                            onError={(err) => {
                                console.error('Error during PayPal payment:', err);
                            }}
                        />
                    </PayPalScriptProvider>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Payment;
