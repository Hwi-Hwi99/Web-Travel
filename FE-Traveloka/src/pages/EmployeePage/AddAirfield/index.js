// Hook
import { useState, useEffect } from 'react';
// Styles
import styles from './AddAirfield.module.scss';
// Component
import Button from '~/components/Button';
import { useNavigate } from 'react-router-dom';
import { Wrapper as PoperWrapper } from '~/components/Poper';
// Library
import classNames from 'classnames/bind';
import axios from 'axios';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

function AddAirfield() {
    const navigate = useNavigate();
    const [airfieldName, setAirfieldName] = useState('');
    const [airfieldCode, setAirfieldCode] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const handleErrorToast = (err) => {
        toast.error(err);
    };

    const handleSuccessToast = (err) => {
        toast.success(err, {
            onClose: () => {
                navigate('/listairfield'); //Điều hướng đến danh sách sân bay
            },
        });
    };

    const handleAddAirfield = async () => {
        try {
            if (!airfieldName || !airfieldCode || !country || !city) {
                handleErrorToast('Vui lòng điền đầy đủ thông tin sân bay.');
                return;
            }

            await axios.post('http://localhost:4000/api/airfield', {
                nameAirfield: airfieldName,
                codeAirfield: airfieldCode,
                city: city,
                country: country,
            });

            handleSuccessToast('Sân bay đã được thêm thành công!');
        } catch (err) {
            console.error('Error adding airfield:', err);
            handleErrorToast('Thêm sân bay thất bại. Vui lòng thử lại.');
        }
    };

    const handleGetAirfield = async () => {
        try {
            await axios.get('http://localhost:4000/api/airfield');
        } catch (err) {}
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content')}>
                <h1>THÔNG TIN SÂN BAY</h1>
                <div className={cx('add-airfield')}>
                    <div className={cx('airfield-info')}>
                        <div>
                            <label>
                                <span>Sân bay</span>
                                <input
                                    type="text"
                                    placeholder="Tên sân bay"
                                    value={airfieldName}
                                    onChange={(e) => setAirfieldName(e.target.value)}
                                />
                            </label>
                            <label>
                                <span>Mã sân bay</span>
                                <input
                                    type="text"
                                    placeholder="Mã sân bay"
                                    value={airfieldCode}
                                    onChange={(e) => setAirfieldCode(e.target.value)}
                                />
                            </label>
                        </div>
                        <div>
                            <label>
                                <span>Thành phố</span>
                                <input
                                    type="text"
                                    placeholder="Tên thành phố"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </label>
                            <label>
                                <span>Quốc gia</span>
                                <input
                                    type="text"
                                    placeholder="Quốc gia của hãng"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </label>
                        </div>
                        <div></div>
                    </div>
                    <Button primary className={cx('btn-add-airfield')} onClick={handleAddAirfield}>
                        THÊM
                    </Button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default AddAirfield;
